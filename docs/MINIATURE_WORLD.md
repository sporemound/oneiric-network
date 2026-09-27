# Synthetic miniature world — first experience

Open `apps/web/index.html` directly in a browser. It is self-contained and works
offline, including from a downloaded file. No account, server or build tools are
needed to explore the checked-in version. It collects no input or telemetry and
loads no remote assets.

## Included

- 20 invented dream reports, five places covering all four place classes.
- Three reports with no final place association; contradictions remain visible.
- Network circles and selectable edges; keyboard and report-list alternatives.
- Atlas entries with individually attributed observations.
- A five-day fictional chronology that filters reports, places and relationships
  by their event timestamps. Later annotations appear only on day five.
- Original-event inspection, separate raw reports and later interpretation.

There is no Lab implementation, participant intake, inferred score, authentication,
cryptographic proof, or assertion of actual convergence. All data is fictional.
The broad Pacific referent is not a geographic identification. The fictional
library was invented for the demo. The layout is authored for legibility, not
calculated from similarity or distance. All associations have unknown exposure;
one later annotation explicitly discloses prior exposure to another report.

## Source and rebuild

`examples/miniature-world.json` is the portable schema-valid event bundle.
`apps/web/layout.json` stores display-only titles and map positions, outside the
research contract. The UI reads the bundle; it does not maintain an alternative
research data model. `model.mjs` projects the selected point in chronology.

```sh
python tools/seed_miniature.py
python tools/validate.py examples/miniature-world.json
python tools/build_demo.py
node --test tests/test_projection.mjs
```

The current browser shell uses native HTML/CSS/JavaScript to make this first
experience directly shareable as a file without a toolchain. This is a bounded
prototype decision, not a replacement of the brief's proposed Vite/TypeScript
direction. Keep the projection and event contract when adding that app toolchain.

On small screens the network is a scrollable map; the report list supplies a
direct accessible route to every dream. Selecting a report opens its detail below
the map. The Atlas reflows to a single column.

## Questions for the next iteration

Does a connection explain itself clearly? Are contradictions as accessible as
resemblances? Can a visitor tell raw experience from later interpretation? Does
the world invite exploration without needing a score? Use these questions to
guide changes before adding accounts or collecting real reports.

## Initial verification

The 52-event bundle passes the v0.1 validator. All 12 schema tests and three
projection tests pass. A jsdom smoke check exercised Network/Atlas switching,
edge inspection, About, chronology, annotation separation and the mobile detail
navigation branch with no JavaScript errors. This is not a rendering test.
Visual browser QA remains outstanding: the available cloud browser rejected
local `file:` navigation. No screenshot or cross-device layout verification is
claimed for this revision.
