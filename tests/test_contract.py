import copy
import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'tools'))
from validate import ROOT, load, validate_bundle

class ContractTests(unittest.TestCase):
    def setUp(self):
        self.bundle = load(ROOT / 'examples/synthetic-bundle.json')

    def rejects(self):
        with self.assertRaises(Exception):
            validate_bundle(self.bundle)

    def test_round_trip(self):
        self.assertEqual(validate_bundle(json.loads(json.dumps(self.bundle))), 6)

    def test_interpretation_cannot_be_inserted_into_raw_report(self):
        self.bundle['events'][1]['payload']['data']['interpretation'] = 'later claim'
        self.rejects()

    def test_private_plaintext_rejected(self):
        self.bundle['scope'] = 'owner_encrypted'
        self.bundle['events'][1]['header']['visibility'] = 'private'
        self.rejects()

    def test_public_export_rejects_private_ciphertext(self):
        event = self.bundle['events'][1]
        event['header']['visibility'] = 'private'
        event['payload'] = {'kind':'encrypted','data':{
            'algorithm':'A256GCM','key_id':event['header']['author_id'],
            'iv':'A'*16,'ciphertext':'A'*24,
            'plaintext_schema':'urn:oneiric-network:payload:0.1.0'}}
        self.rejects()

    def test_duplicate_id_rejected(self):
        self.bundle['events'].append(copy.deepcopy(self.bundle['events'][0]))
        self.rejects()

    def test_missing_reference_must_be_declared(self):
        omitted = self.bundle['events'].pop(1)['header']['event_id']
        self.rejects()
        self.bundle['omitted_event_ids'].append(omitted)
        self.assertEqual(validate_bundle(self.bundle), 5)

    def test_invalid_timestamp_rejected(self):
        self.bundle['events'][0]['header']['created_at'] = '2026-02-31T07:00:00Z'
        self.rejects()

    def test_reversed_sleep_window_rejected(self):
        self.bundle['events'][1]['payload']['data']['sleep_window'] = {
            'start':'2026-09-27T07:00:00Z','end':'2026-09-26T07:00:00Z',
            'timezone':'America/Los_Angeles','precision':'estimated'}
        self.rejects()

    def test_unknown_version_rejected(self):
        self.bundle['schema_version'] = '0.2.0'
        self.rejects()

    def test_unsupported_certainty_field_rejected(self):
        self.bundle['events'][3]['payload']['data']['paranormal_certainty'] = 1
        self.rejects()

    def test_contradictions_retained(self):
        self.bundle['events'][5]['payload']['data']['stance'] = 'contradicts'
        self.assertEqual(validate_bundle(self.bundle), 6)

    def test_parser_rejects_ambiguous_json(self):
        for raw in ('{"a":1,"a":2}', '{"n":NaN}', '{"n":1e999}', '{"s":"\\ud800"}'):
            with self.subTest(raw=raw), tempfile.TemporaryDirectory() as folder:
                path = Path(folder)/'bad.json'
                path.write_text(raw)
                with self.assertRaises((ValueError, UnicodeError)):
                    load(path)

if __name__ == '__main__':
    unittest.main()
