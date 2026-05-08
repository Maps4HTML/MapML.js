# MapML Search Draft

Status: draft notes for agreed direction.

## UI Control Notes

- Search widget is part of map controls.
- Tentative control placement: first in controls order, above zoom control.
- Default affordance is a magnifying-glass icon that expands on pointer click or keyboard enter to a text input on a slide out panel.
- Tentative expanded UI: left-to-right slide-out panel.
- Panel layout: text input at top, panel height equals map height.
- Panel close affordance: left-pointing close button/handle at mid-right edge.
- Control is opt-in via `controlslist="search"` (like geolocation), not shown by default.
- One control per map; multiple layers may participate in requests.
- Accessibility note: sliding over other controls may cause conflicts; mitigation remains TBD.

## Markup and API Notes

- Use `<map-link rel="search" ...>` for search endpoints.
- Use `<map-link rel="suggestions" ...>` for suggestion endpoints.
- Only the first `<map-link rel="search">` in a `<map-layer>` is honored.
- Fixed template variable: `{searchTerms}`.
- Do not require `type="text/mapml"` for this draft.

### Suggestions

- Media type: `application/json`.
- Response body: array of objects with source-layer identification.

Example:

```json
[
  { "text": "kate spade", "layer": "poi" },
  { "text": "katy perry", "layer": "events" }
]
```

- `text` (string, required): suggestion label.
- `layer` (string, required): source layer identifier/name.

### Search Results

- Preferred media type: `application/geo+json`.
- Response body: GeoJSON `FeatureCollection`.
- Each `Feature` must include `geometry` and `bbox`.
- Required `properties` members:
  - `zoom` (number)
  - `center` (`[longitude, latitude]`)
  - `layer` (string; semantics TBD)

## Design Decisions

1. **Handler rendering:** control passes a container reference via event detail (`e.detail.container`); handler appends HTML directly.
2. **Fetch behavior:** control always fetches. A default handler supports a canonical JSON response format for each link type. Handler is overridable via `preventDefault()` on the event.
3. **Multi-layer dispatch:** batched — one event fires after all layer responses arrive. May revisit for progressive dispatch later.
4. **Search submit scope:** query only the source layer of the selected suggestion, not all layers. TBD empirically.

## TBD

- Final semantics/allowed values for `properties.layer`.
- Whether `application/geo+json` is required or recommended.
- Deduping/ranking for merged suggestions/results.
- Canonical JSON response formats for default suggestion/search handlers.
- Future enhancement: permit `<map-link rel="search">` in `<map-extent>` for viewport/spatial search.
- Such enhanced search could use in-scope sibling `<map-input type="location">` variables in `tref` for parameters such as center point or bbox.
