"""Offline shape/relationship checks only; never a proof verifier."""
import json
import math
import re
import sys
from datetime import datetime
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource

ROOT = Path(__file__).resolve().parents[1]
LIMIT = 16 * 1024 * 1024
FORMATS = FormatChecker()

@FORMATS.checks('date-time', raises=ValueError)
def utc_timestamp(value):
    if not isinstance(value, str):
        return True
    if not re.fullmatch(r'\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z', value):
        return False
    datetime.fromisoformat(value.replace('Z', '+00:00'))
    return True

def unique_object(pairs):
    value = {}
    for key, item in pairs:
        if key in value:
            raise ValueError(f'duplicate JSON key: {key}')
        value[key] = item
    return value

def reject_constant(value):
    raise ValueError(f'non-finite JSON number: {value}')

def check_json(value):
    if isinstance(value, str):
        value.encode('utf-8', errors='strict')
    elif isinstance(value, float) and not math.isfinite(value):
        raise ValueError('non-finite JSON number')
    elif isinstance(value, dict):
        for key, item in value.items():
            check_json(key)
            check_json(item)
    elif isinstance(value, list):
        for item in value:
            check_json(item)

def load(path):
    with Path(path).open('rb') as stream:
        raw = stream.read(LIMIT + 1)
    if len(raw) > LIMIT:
        raise ValueError('file exceeds 16 MiB prototype limit')
    value = json.loads(raw.decode('utf-8'), object_pairs_hook=unique_object,
                       parse_constant=reject_constant)
    check_json(value)
    return value

def validator():
    schemas = [load(ROOT / 'schemas/v0.1' / name) for name in
               ('event.schema.json', 'bundle.schema.json')]
    for schema in schemas:
        Draft202012Validator.check_schema(schema)
    registry = Registry().with_resources([
        (s['$id'], Resource.from_contents(s)) for s in schemas
    ])
    return Draft202012Validator(schemas[1], registry=registry,
                                format_checker=FORMATS)

def moment(value):
    return datetime.fromisoformat(value.replace('Z', '+00:00'))

def validate_bundle(bundle):
    check_json(bundle)
    validator().validate(bundle)
    events = bundle['events']
    by_id = {}
    for event in events:
        eid = event['header']['event_id']
        if eid in by_id:
            raise ValueError(f'duplicate event ID: {eid}')
        by_id[eid] = event
    omitted = set(bundle['omitted_event_ids'])
    if len(omitted) != len(bundle['omitted_event_ids']) or omitted & by_id.keys():
        raise ValueError('omitted IDs must be unique and absent from events')

    def resolve(eid, kinds=None):
        if eid not in by_id:
            if eid in omitted:
                return None
            raise ValueError(f'undeclared missing event: {eid}')
        found = by_id[eid]
        if kinds and found['payload']['kind'] not in kinds:
            raise ValueError(f'incorrect referenced kind: {eid}')
        return found

    for event in events:
        header, payload = event['header'], event['payload']
        kind, data = payload['kind'], payload['data']
        if bundle['scope'] == 'public' and header['visibility'] != 'public':
            raise ValueError('public bundle contains nonpublic event')
        for reference in header['references']:
            if reference['event_id'] == header['event_id']:
                raise ValueError('event must not reference itself')
            resolve(reference['event_id'])
        for field in ('subject_event_id', 'source_event_id'):
            if field in data:
                resolve(data[field])
        if kind == 'dream' and 'sleep_window' in data:
            window = data['sleep_window']
            if moment(window['start']) > moment(window['end']):
                raise ValueError('sleep window is reversed')
        if kind == 'session':
            if not (moment(data['recording_opens_at']) <= moment(data['lock_deadline'])
                    <= moment(data['reveal_not_before'])):
                raise ValueError('session deadlines are out of order')
        if kind in ('lock', 'reveal'):
            field = 'dream_commitment_event_id' if kind == 'lock' else 'commitment_event_id'
            commitment = resolve(data[field], {'commitment'})
            if commitment:
                committed = commitment['payload']['data']
                if committed['session_id'] != data['session_id']:
                    raise ValueError('commitment session mismatch')
                subject = 'dream' if kind == 'lock' else data['opening']['kind']
                if committed['subject'] != subject:
                    raise ValueError('commitment subject mismatch')
        if kind == 'evaluation':
            resolve(data['dream_event_id'], {'dream', 'reveal', 'encrypted'})
        if kind == 'motif_observation' and 'span' in data:
            source = resolve(data['source_event_id'], {'dream'})
            span = data['span']
            if span['start'] >= span['end']:
                raise ValueError('empty or reversed motif span')
            if source and span['end'] > len(source['payload']['data']['text']):
                raise ValueError('motif span exceeds source text')
    return len(events)

def main():
    if len(sys.argv) != 2:
        print('Usage: python tools/validate.py BUNDLE.json', file=sys.stderr)
        return 2
    try:
        count = validate_bundle(load(sys.argv[1]))
    except Exception as error:
        print(f'FAIL: {error}', file=sys.stderr)
        return 1
    print(f'PASS: {count} events; structure and local relationships only. Proofs unverified.')
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
