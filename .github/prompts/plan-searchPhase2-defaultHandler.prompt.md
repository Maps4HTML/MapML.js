
---

## Plan: Search Phase 2 — Default Handler, Fetch, Events & Formats

Wire `<map-link rel="search">` and `<map-link rel="suggestions">` to the search control. Implement debounced fetch for suggestions on input and search on Enter/click. Dispatch cancelable events (`mapsearch`, `mapsuggestions`) on the viewer element so authors can `preventDefault()` and supply custom rendering. Provide default handlers that render GeoJSON FeatureCollection responses (the format returned by Nominatim `format=geojson` and Photon).

**Steps**

### Phase A — map-link.js: accept `search` and `suggestions` rel values

1. In map-link.js, add `'search'` and `'suggestions'` to the array in the `set rel()` setter.
2. In `connectedCallback()`, add `case 'search':` and `case 'suggestions':` — no-op (the link is discoverable via DOM query from `SearchButton`).
3. In `whenReady()`, add `case 'search':` and `case 'suggestions':` that resolve immediately.

### Phase B — SearchButton.js: fetch logic, events, default handlers

4. Add debounced `input` event handler on `this._input` — 300ms debounce, minimum 2 chars, `AbortController` for stale requests → calls `_fetchSuggestions(query)`.

5. Implement `_getSearchLinks()` and `_getSuggestionsLinks()` — query checked layers, look in `layer.shadowRoot` (remote) or `layer` (local) for `map-link[rel=search]` / `map-link[rel=suggestions]`. Return `[{ link, layer }]`. First per layer wins.

6. Implement `_fetchSuggestions(query)`:
   - Resolve each link's `tref` replacing `{searchTerms}` with `encodeURIComponent(query)`.
   - Fetch all in parallel via `Promise.allSettled()`.
   - Dispatch cancelable `mapsuggestions` CustomEvent on `this._mapEl` with `{ detail: { query, responses } }`.
   - If not prevented → `_defaultSuggestionsHandler(detail)`.

7. Implement `_defaultSuggestionsHandler()`:
   - Render each GeoJSON feature as a `<button class="mapml-search-result">` in `this._results`.
   - Display text: `properties.display_name || properties.name`.
   - Click → `_selectResult(feature, layer)`.

8. Implement search on Enter → `_doSearch(query)`:
   - Same pattern as suggestions: resolve tref, fetch, dispatch cancelable `mapsearch` event, default handler renders results.

9. Implement `_selectResult(feature, layer)`:
   - If `feature.bbox` → `map.fitBounds()`.
   - Else → `map.setView([lat, lon], 14)`.
   - Close panel.

### Phase C — CSS for results

10. Add styles: `.mapml-search-results` scrollable, `.mapml-search-result` full-width button with hover, ellipsis overflow.

### Phase D — Test data and mock routes

11. Add mock routes in server.js:
   - `GET /search/suggestions?q=...` → static GeoJSON FeatureCollection (2-3 features).
   - `GET /search/results?q=...` → static GeoJSON FeatureCollection (1 feature with bbox).

12. Create `test/e2e/data/search-with-tref.mapml` — remote layer with both `<map-link rel="suggestions" tref="...">` and `<map-link rel="search" tref="...">` in `<map-head>`.

### Phase E — Tests

13. Create `test/e2e/core/searchDefault.html` + `searchDefault.test.js`:
   - Suggestions appear after typing
   - Search results appear on Enter
   - Click result → map moves / fits bounds
   - `mapsuggestions` / `mapsearch` events fire with correct detail
   - `preventDefault()` suppresses default rendering
   - No fetch when button is disabled

**Relevant files**
- SearchButton.js — main target: fetch, events, default handlers
- map-link.js — `connectedCallback()`, `set rel()`, `whenReady()`
- mapml.css — result item styles
- server.js — mock routes
- search-layer.mapml — existing structure reference

**Verification**
1. `npx playwright test test/e2e/core/searchDefault.test.js --reporter=list`
2. `npx playwright test searchDisabled.test.js --reporter=list` — no regressions
3. `npx playwright test domApi-mapml-viewer.test.js --reporter=list` — no regressions
4. `grunt` — build succeeds

**Decisions**
- Default format: **GeoJSON FeatureCollection** — works with Nominatim (`format=geojson`) and Photon out of the box
- `{searchTerms}` is the only template variable — simple string replace, no `<map-input>` siblings needed
- `<map-link rel="search|suggestions">` goes in `<map-head>` (remote) or direct child of `<map-layer>` (local) — NOT inside `<map-extent>`
- Events are cancelable and bubble; `preventDefault()` suppresses default handler
- One search + one suggestions link per layer (first wins); multiple layers' results are merged
- Suggestions are optional — if no `rel="suggestions"` link exists, only Enter triggers search

**Further Considerations**
1. **Nominatim usage policy** — test fixtures use local mock routes, not live API. Authors using Nominatim are responsible for compliance. Should be documented.
2. **No suggestions link fallback** — typing waits for Enter. Recommendation: this is correct behavior.
3. **Search vs. suggestions visual distinction** — same treatment in Phase 2; can differentiate in Phase 3.

---
