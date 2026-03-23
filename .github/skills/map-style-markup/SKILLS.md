
---
name: map-style-markup
description: Tells you how to correctly create and edit the markup for a <map-style> element. Use it when generating MapML output markup in an HTML page, especially when creating styling vector `<map-feature>` data.
---

The `<map-style>` element allows map authors to embed CSS into map layers. The CSS can be used to style the geometry of the layer using [`<map-span>`](../../elements/span/), and by setting the class attribute to the [child elements](../geometry/#child-elements) of the geometry.

## Attributes

### `media`

The `media` attribute is used to express media conditions under which the contained 
styles should be applied.  Media conditions evaluate to `true` or `false`. A map-style 
for which the media condition evaluates to `false` is not loaded / is removed. Styles 
contained in a `<map-style>` for which the media condition evaluates to `true` 
are applied; when the condition subsequently evaluates to `false`, the styles are removed.
An invalid media condition evaluates to `false`.

Map media queries can include map properties including: [projection](../../api/mapml-viewer-api#projection), [zoom](../../api/mapml-viewer-api#zoom), 
and [extent](../../api/mapml-viewer-api#extent).

---

:::note

All the demo's on the documentation pages contain a "CSS" tab which adds the CSS using the `<map-style>` element dynamically.

:::

---

## Examples

### Styling using `<map-span>`

```html
<mapml-viewer projection="OSMTILE" zoom="10" lon="-75.7" lat="45.4" controls>
  <map-layer label="OpenStreetMap" src="../data/osm.mapml" checked></map-layer>
  <map-layer label="Polygon" checked>
    <map-meta name="projection" content="OSMTILE"></map-meta>
    <map-feature>
      <map-featurecaption>Polygon</map-featurecaption>
      <map-geometry cs="gcrs">
        <map-polygon>
          <map-coordinates>-75.5859375 45.4656690 -75.6813812 45.4533876 -75.6961441 45.4239978 -75.7249832 45.4083331 -75.7792282 45.3772317 -75.7534790 45.3294614 -75.5831909 45.3815724 -75.6024170 45.4273712 -75.5673981 45.4639834 -75.5859375 45.4656690</map-coordinates>
          <map-coordinates><map-span class="hole">-75.6467062 45.4215881 -75.6889363 45.4049585 -75.6693647 45.3767494 -75.6270640 45.3924229 -75.6467062 45.4215881</map-span></map-coordinates>
        </map-polygon>
      </map-geometry>
      <map-properties><h2>This is a Polygon</h2></map-properties>
    </map-feature>
    <map-style>.hole {stroke: #73A9AD;stroke-width: 4px;fill: none;fill-opacity: 1;}</map-style>
  </map-layer>
</mapml-viewer>
```
