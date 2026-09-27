// Rebuild the visible world only from events available at the chosen cutoff.
export function projectWorld(bundle, layout, day) {
  const cutoff = `2026-09-${String(day).padStart(2,'0')}T23:59:59Z`;
  const events = bundle.events.filter(event => event.header.created_at <= cutoff);
  const kind = name => events.filter(event => event.payload.kind === name);
  const people = new Map(kind('presence').map(e => [e.payload.data.participant_id,e.payload.data.handle]));
  const dreams = kind('dream').map(e => ({id:e.header.event_id, ...layout.dreams[e.header.event_id],
    author:people.get(e.header.author_id) || 'Unknown presence', time:e.header.created_at, text:e.payload.data.text,event:e}));
  const places = kind('place').map(e => ({id:e.payload.data.place_id,...e.payload.data,
    ...layout.places[e.payload.data.place_id],event:e}));
  const dreamIds = new Set(dreams.map(d=>d.id)), placeIds = new Set(places.map(p=>p.id));
  const edges = kind('place_observation').filter(e=>dreamIds.has(e.payload.data.source_event_id) && placeIds.has(e.payload.data.place_id))
    .map(e=>({id:e.header.event_id,...e.payload.data,time:e.header.created_at,event:e}));
  const annotations = kind('annotation');
  return {dreams,places,edges,annotations,unconnected:dreams.filter(d=>!edges.some(e=>e.source_event_id===d.id))};
}
