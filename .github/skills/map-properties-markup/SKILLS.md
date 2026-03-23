---
name: mapml-properties-markup
description: Tells you how to correctly create and edit the markup for a `<map-properties>` element. Use it when generating MapML output markup in an HTML page.
---

A `<map-properties>` element is a child of `<map-feature>` and is used to define the content of the popup associated to a given feature.

A `<map-properties>` element can contain any HTML Element to describe the feature's content. 

---

## Examples

### Properties Table

The following example displays the popup as an HTML [table](https://html.spec.whatwg.org/multipage/tables.html#the-table-element).

```html
<mapml-viewer projection="OSMTILE" zoom="12" lat="45.42" lon="-75.70">
  <map-layer label="OpenStreetMap" src="../data/osm.mapml" checked></map-layer>
  <map-layer label="Ottawa" checked>
    <map-meta name="projection" content="OSMTILE"></map-meta>
    <map-meta name="cs" content="gcrs"></map-meta>
    <map-feature>
      <map-featurecaption>Ottawa</map-featurecaption>
      <map-geometry>
        <map-point class="ottawa">
          <map-coordinates>-75.697193 45.421530</map-coordinates>
        </map-point>
      </map-geometry>
      <map-properties>
        <table>
          <thead>
            <tr>
              <th role="columnheader" scope="col">Property name</th>
              <th role="columnheader" scope="col">Property value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Name</th>
              <td itemprop="amenity">Ottawa</td>
            </tr>
            <tr>
              <th scope="row">Type</th>
              <td itemprop="name">City</td>
            </tr>
            <tr>
              <th scope="row">Website</th>
              <td itemprop="website"><a href="https://ottawa.ca/" target="_blank">Ottawa</a></td>
            </tr>
          </tbody>
        </table>
      </map-properties>
    </map-feature>
  </map-layer>
</mapml-viewer>
```


