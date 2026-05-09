---

# Search Feature Implementation Plan

Target: implement a search control for `<mapml-viewer>` / `<map is="web-map">`.  
Reference design: search.md. Example service response: geonames.json.

---

## Phase 1 — UI Control (no network)

**Goal:** render search button + slide-out panel; wire open/close and controlslist.

**Create:**
- `src/mapml/control/SearchButton.js`
  - Extend leaflet `Control`, position `topleft`.
  - Pattern: follow GeolocationButton.js / `ReloadButton.js`.
  - Container: `div.mapml-search-control` with `<button>` (magnifying-glass inline SVG).
  - Panel: `div.mapml-search-panel` (hidden initially, full map height, slides left-to-right over other controls).
    - `<input type="search">` at top.
    - `div.mapml-search-results` scrollable container.
    - Left-pointing close `<button>` vertically centered on panel right edge.
  - Click/Enter on icon → open panel + focus input.
  - Escape or close button → close panel + return focus to icon.
  - Export factory `searchButton(options)`.

**Modify:**
- mapml-viewer.js
  - Import `searchButton`.
  - Add `'search'` to DOMTokenList supported tokens (~line 191).
  - `_createControls()`: create `this._searchButton` **first** (before zoom).
  - `_hideControls()` / `_showControls()`: default hidden (opt-in).
  - controlslist switch: `case 'search'` → show.
  - `_deleteControls()`: delete `this._searchButton`.
  - `_setControlsVisibility()` switch: `case 'search'`.
- web-map.js — equivalent if it duplicates controlslist logic.
- mapml.css — styles for `.mapml-search-control`, `.mapml-search-panel`, transitions.

**Tests:** `test/e2e/core/searchControl.html` + `.test.js`
- Button visible with `controlslist="search"`, hidden without.
- Panel opens on click, input focused.
- Panel closes on Escape / close button.
- Panel full map height, overlays controls.

---

## Phase 2 — Default Handler (fetch + canonical formats)

**Goal:** wire `<map-link rel="search|suggestions">` to the control; implement fetch, events, default handler.

**Modify map-link.js:**
- Add `'search'`, `'suggestions'` to rel allowed values.
- `connectedCallback()`: store ref on parent layer (`layerEl._searchLink`, `layerEl._suggestionsLink`); only first per layer honored.
- `disconnectedCallback()`: clear those refs.

**Modify `src/mapml/control/SearchButton.js`:**
- Disabled state: button has `aria-disabled="true"` and is visually grayed out when no visible layer has a `<map-link rel="search">` descendant. Panel does not open while disabled.
- Enable/disable logic: listen for layer add/remove/checked/unchecked events; re-evaluate whether any visible layer has `_searchLink`. Update button state accordingly.
- On debounced input (200ms, min 2 chars):
  - Collect visible layers with `_suggestionsLink`.
  - Resolve `tref` replacing `{searchTerms}` with URL-encoded value.
  - Fetch all parallel (AbortController for stale).
  - After all resolve → dispatch `mapsuggestions` CustomEvent on `<mapml-viewer>` with `{ cancelable: true, detail: { query, responses: [{response, layer}...], container } }`.
  - If not `preventDefault()` → run default suggestions handler.
- On Enter / suggestion click:
  - Resolve source layer's `_searchLink.tref`.
  - Fetch → dispatch `mapsearch` CustomEvent with `{ cancelable: true, detail: { query, response, layer, container } }`.
  - If not `preventDefault()` → run default search handler.

**Canonical formats:**
- Suggestions: `[{ "text": "Ottawa", "layer": "places" }]`
- Search: GeoJSON FeatureCollection with `bbox`, `geometry`, `properties.name`, `properties.zoom`, `properties.center`, `properties.layer`.

**Tests:** `test/e2e/core/searchDefault.html` + `.test.js`
- Mock routes in server.js.
- Suggestions appear; results appear; click result → map moves; events fire correctly; duplicate rel ignored.

---

## Phase 3 — Custom Handler (geonames.gc.ca)

**Goal:** demonstrate `preventDefault()` override using geonames response shape.

**Create:**
- `test/e2e/core/searchCustomHandler.html` — fixture with inline `<script>` that listens for `mapsuggestions`/`mapsearch`, calls `preventDefault()`, and parses geonames `items` array (`name`, `latitude`, `longitude`, `bbox`).
- `test/e2e/core/searchCustomHandler.test.js` — mock route serves geonames.json content.
  - Custom suggestions render item names.
  - Default handler does NOT run.
  - Click result → map moves.

---

## Implementation Notes

- `{searchTerms}` substitution: simple string replace on `tref`.
- Search icon: second control in top-left (created after zoom).
- Panel inside shadow DOM → inherits mapml.css, grabs focus from map for scroll behaviour

## Out of Scope

- Viewport/extent search in `<map-extent>`.
- Streaming/progressive dispatch.
- Custom module-link declaration mechanism.
- `type="text/mapml"` support.

---

Want me to write this to `search-implementation-plan.md` in the project root? (File creation is currently restricted on my end — you may need to paste it or enable the tool.)