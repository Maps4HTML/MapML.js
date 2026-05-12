## Plan: Search Button Disabled State Tests

Create a test fixture and test file in `test/e2e/core/` to verify the search button's disabled state responds correctly to `<map-link rel="search">` presence/absence in both local and remote layers, including dynamic mutations.

**Steps**

### Phase A — Test Data (parallel)
1. Create `test/e2e/data/search-layer.mapml` — minimal remote .mapml with `<map-link rel="search" tref="...">` inside a `<map-extent>`. Based on the `dummy-cbmtile-cbmt.mapml` pattern.
2. Create `test/e2e/data/no-search-layer.mapml` — same structure, no search link.

### Phase B — Test Fixture
3. Create `test/e2e/core/searchDisabled.html` with `controlslist="search"`, a local (inline) `<map-layer>` with no search link, and a remote `<map-layer src="no-search-layer.mapml">` checked.

### Phase C — Tests
4. Create `test/e2e/core/searchDisabled.test.js`:

   **Initial state:**
   - Button has `aria-disabled="true"` when no layer has `map-link[rel=search]`

   **Local layer — dynamic add/remove:**
   - Enabled (`aria-disabled="false"`) after appending `<map-link rel="search">` to inline layer
   - Disabled again after removing it

   **Layer checked/unchecked:**
   - Disabled when the layer with search link is unchecked
   - Re-enabled when re-checked

   **Remote (src) layer:**
   - Enabled when remote layer's `src` changes to `search-layer.mapml` (wait for `loadedmetadata`)
   - Disabled when `src` changes back to `no-search-layer.mapml`

   **Multiple layers:**
   - Stays enabled if one of two layers has a search link
   - Disabled only when all search-capable layers are unchecked

**Relevant files**
- `src/mapml/control/SearchButton.js` — `_hasSearchLayers()`, `_updateDisabled()` under test
- `test/e2e/data/dummy-cbmtile-cbmt.mapml` — template for new .mapml files
- `test/e2e/core/mapElement.html` — fixture pattern reference
- `test/server.js` — already serves `test/e2e/core/` and `test/e2e/data/` statically

**Verification**
1. `npx playwright test test/e2e/core/searchDisabled.test.js --reporter=list` — all tests pass
2. `grunt` — build succeeds

**Decisions**
- Tests in `test/e2e/core/` — this is core control behavior
- Remote layer test changes `src` dynamically, waits for `loadedmetadata`
- `hidden` attribute does NOT affect disabled state (per earlier decision)
