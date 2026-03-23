---
name: map-span-markup
description: Tells you how to correctly create and edit the markup for a <map-span> element. Use it when generating MapML output markup in an HTML page, especially when styling vector `<map-feature>` data descendant `<map-coordinates>` coordinate strings, where you can wrap sequences of coordinate pairs to allow them to be styled differently than the overall geometry which they're part of.
---

The `<map-span>` element is useful when used together with html global attributes such as [class](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/class). This element allows you to wrap the coordinate pairs in a `<map-coordinates>` element, allowing the wrapped coordinates to be targeted by CSS selectors, and thus independently styled.

---

## Examples

### Styling Polygon Holes

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
  </map-layer>
</mapml-viewer>
```
