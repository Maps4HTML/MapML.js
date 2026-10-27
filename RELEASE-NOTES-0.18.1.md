# Release Notes — v0.18.1

_Changes since [v0.18.0](https://github.com/Maps4HTML/MapML.js/releases/tag/v0.18.0)._

## Fixes
- `<map-tile>`: fix inline ("static") tile rendering when tile content changes
  while the parent `<map-layer>` is unchecked. Replaced tile layers are now
  removed from the layer's internal layer group, and removing a tile layer now
  clears its rendered tiles. Previously, re-checking the layer brought back
  stale tiles and could render a duplicate set alongside the current ones.
- Layer control: on touch devices, expanding the collapsed layer control no
  longer accidentally toggles the layer settings (gear) button. Tapping the map
  now reliably collapses the control.
- Attribution control: the attribution (info) button now has a localized
  tooltip and `aria-label`.

## Features
- Add a "static" control: a lock button that toggles the viewer's existing
  `static` attribute, freezing or restoring map interaction. Opt in with
  `controlslist="static"` on `<mapml-viewer>` or `<map is="web-map">`. The
  button's pressed state follows the `static` attribute when it is changed
  programmatically. Ported from MapML-MapLibre.

## Build / Tooling
- Vendor `media-query-parser` 3.0.2 and `media-query-solver` 0.1.3 under
  `vendor/`, because `media-query-solver` was unpublished from npm on
  2026-09-30 and `npm ci` was failing. The vendored code is identical to the
  published packages, and the built `dist/mapml.js` is unchanged.
- Sync workflow: supply the access token to git via a credential helper instead
  of the clone URL. Newer libcurl versions in the `alpine` image caused git to
  drop URL-embedded credentials, so pushes to the downstream repositories
  failed.
- Sync workflow: the build is now synced to `dist/MapML.js/dist/` in the
  experiments repository, so it can sit alongside other builds such as
  MapML-MapLibre.
- Update `how-to-release.md`.

## Other
- Test fixes: make the `<map-link>` security test less flaky, and generate the
  localization test's `<map-options>` instead of hard-coding them.

---

### Commits
- Fix inline "static" `<map-tile>` rendering: remove the old MapTileLayer from
  the parent `<map-layer>` LayerGroup; call `GridLayer.prototype.onRemove` from
  `MapTileLayer.onRemove` (`45401483`)
- Port static control from MapML-MapLibre (`7f515725`)
- Prevent ghost click on settings gear during touch expand (`6581b5ae`)
- Add localized tooltip and aria-label to attribution summary (`e76971bc`)
- Vendor media-query-parser and media-query-solver because the latter was
  unpublished from npm on 2026-09-30 (`63164cfc`)
- Pass the sync access token via a git credential helper, after the libcurl
  change in the `alpine` image (`d16940ef`)
- Sync Leaflet build into experiments `dist/MapML.js/dist` subtree (`cdb752b6`)
- Update localization test so map-options are generated, not hard-coded
  (`c7638a13`)
- Fix flaky test (`8e23fda0`)
- Update how-to-release.md (`2d03e35c`)
