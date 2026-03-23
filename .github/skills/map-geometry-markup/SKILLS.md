---
name: mapml-geometry-markup
description: Tells you how to correctly create and edit the markup for a <map-geometry> element. Use it when generating MapML output markup in an HTML page.
---

A `<map-geometry>` element is a child of `<map-feature>` and is used to describe the geometry of the feature.

A `<map-geometry>` element has one child element, which can be a `<map-point>`, `<map-linestring>`, `<map-polygon>`, `<map-multipoint>`, `<map-multilinestring>`, `<map-multipolygon>`, or `<map-geometrycollection>`.

## Attributes

### `cs`

Defines the Coordinate System of the geometry. When no `cs` is provided, the coordinate system of descendant `<map-coordinates>` elements is determined by a fallback to any in-scope `<map-meta name="cs" content="...">`. If no fallback coordinate system is specified by a `<map-meta>` element, the default coordinate system of the `map-layer` is used; if none is defined, `gcrs` (geographic coordinates) is used.

| CRS | Description |
|------|-------------|
| tcrs | For each zoom level (i.e. at a pre-defined scale denominator value), locations are expressed in terms of scaled pixels, with the origin of pixel space at the upper left corner.  The pixel coordinates of a location at a single zoom level are independent of the pixel coordinates of a location any other zoom level.  In other words, you need to know the zoom level of a tcrs coordinate in order to locate it on a map or otherwise process it. |
| tilematrix | Each zoom level has an array of tiles, called a tilematrix.  The individual tiles constitute the coordinates in this CRS, and the axes are know as `row` and `column`.  The tiles are defined as squares of 256 pixels in the associated tcrs of the particular zoom level. |
| pcrs | Projected CRS (pcrs) are defined by a mathematical relationship with an underlying gcrs, using a technique called "projection". pcrs coordinates are scale- and zoom level-independent, and are designed to represent geographic coordinates on a planar surface, such as a device screen. The measurement units of pcrs coordinates is _usually_ meters (a notable exception being pcrs coordinates in the `WGS84` projection). |
| gcrs | Geographic coordinates are referenced to various ellipsoids, and are not necessarily comparable across projections.  A common ellipsoid today is WGS 84, which is defined and used by the global positioning satellite (GPS) constellation. |
| map | The map CRS is dynamic, in the sense that it has its origin at the upper left of the user's viewport, with scaled pixels as units.  This is used to identify image coordinates for use, typically by WMS and similar services which use a virtual image to enable query of map feature property information, without necessarily transferring the features over the network. |
| tile | Each tile in any zoom level has an implicit scaled-pixel coordinate system ranging from 0 to 255 in both horizontal and vertical directions. These coordinates are used by WMTS and similar services to identify a pixel for query of feature property values, without transferring the feature geometry over the network. |

---

## Child Elements


### `<map-point>`

This element contains a `<map-coordinates>` element containing a single position. Axis order - x followed by y, separated by whitespace. Note that longitude and latitude (gcrs coordinates) are listed in that order, always, in all geometry types.

---

### `<map-linestring>`

This element contains a `<map-coordinates>` element containing two or more positions. Axis order - x followed by y, separated by whitespace.

---

### `<map-polygon>`

This element contains one or more `<map-coordinates>` elements, each containing three or more positions. Axis order - x followed by y, separated by whitespace.

The first and last positions in every child `<map-coordinates>` element are equal / at the same position.

The first `<map-coordinates>` element represents the outside of the polygon, and subsequent `<map-coordinates>` elements represent holes. The "winding order" of positions in child `<map-coordinates>` should depend on the axis orientation of the coordinate reference system in use, and whether the `<map-coordinates>` element represents the exterior of a polygon, or a hole. For WGS84, the exterior should be counterclockwise and holes should be clockwise.

---

### `<map-multipoint>`

This element contains a `<map-coordinates>` element, containing one or more positions. Axis order - x followed by y, separated by whitespace.

---

### `<map-multilinestring>`

This element contains one or more `<map-coordinates>` elements, each containing two or more positions. Axis order - x followed by y, separated by whitespace.

---

### `<map-multipolygon>`

This element contains the contents one or more `<map-polygon>` elements. Axis order - x followed by y, separated by whitespace.

For each member polygon, the same non-schema constraints apply to multipolygon descendant `<map-coordinates>` elements, as for polygon `<map-coordinates>` descendant elements.

---

### `<map-geometrycollection>`

This element contains one or more `<map-point>`, `<map-linestring>`, `<map-polygon>`, `<map-multipoint>`, `<map-multilinestring>`, `<map-multipolygon>` elements.

For each member geometry, the same non-schema constraints apply as to the unique geometry type above.

---


## Examples

### Point
```html
<mapml-viewer projection="OSMTILE" zoom="10" lon="-75.7" lat="45.4" controls>
  <map-layer label="OpenStreetMap" src="../data/osm.mapml" checked></map-layer>
  <map-layer label="Point Geometry" checked>
    <map-meta name="projection" content="OSMTILE"></map-meta>
    <map-feature>
      <map-featurecaption>Point</map-featurecaption>
      <map-geometry cs="gcrs">
        <map-point class="point">
          <map-coordinates>-75.6916809 45.4186964</map-coordinates>
        </map-point>
      </map-geometry>
      <map-properties><h2>This is a Point</h2></map-properties>
    </map-feature>
  </map-layer>
</mapml-viewer>
```

### LineString

```html
<mapml-viewer projection="OSMTILE" zoom="10" lon="-75.7" lat="45.4" controls>
  <map-layer label="OpenStreetMap" src="../data/osm.mapml" checked></map-layer>
  <map-layer label="Line Geometry" checked>
    <map-meta name="projection" content="OSMTILE"></map-meta>
    <map-feature>
      <map-featurecaption>Line</map-featurecaption>
      <map-geometry cs="gcrs">
        <map-linestring class="line">
          <map-coordinates>-75.6168365 45.471929 -75.6855011 45.458445 -75.7016373 45.4391764 -75.7030106 45.4259255 -75.7236099 45.4208652 -75.7565689 45.4117074 -75.7833481 45.384225 -75.8197403 45.3714435 -75.8516693 45.377714</map-coordinates>
        </map-linestring>
      </map-geometry>
      <map-properties><h2>This is a Line</h2></map-properties>
    </map-feature>
  </map-layer>
</mapml-viewer>
```

### Polygon

```html
<mapml-viewer projection="OSMTILE" zoom="10" lon="-75.7" lat="45.4" controls>
  <map-layer label="OpenStreetMap" src="../data/osm.mapml" checked></map-layer>
  <map-layer label="Polygon Geometry" checked>
    <map-meta name="projection" content="OSMTILE"></map-meta>
    <map-feature>
      <map-featurecaption>Polygon</map-featurecaption>
      <map-geometry cs="gcrs">
        <map-polygon class="polygon">
          <map-coordinates>-75.5859375 45.4656690 -75.6813812 45.4533876 -75.6961441 45.4239978 -75.7249832 45.4083331 -75.7792282 45.3772317 -75.7534790 45.3294614 -75.5831909 45.3815724 -75.6024170 45.4273712 -75.5673981 45.4639834 -75.5859375 45.4656690</map-coordinates>
          <map-coordinates>-75.6596588 45.4211062 -75.6338958 45.4254436 -75.6277127 45.4066458 -75.6572542 45.4097792 -75.6596588 45.4211062</map-coordinates>
        </map-polygon>
      </map-geometry>
      <map-properties><h2>This is a Polygon</h2></map-properties>
    </map-feature>
  </map-layer>
</mapml-viewer>
```

### MultiPoint

```html
<mapml-viewer projection="OSMTILE" zoom="10" lon="-75.7" lat="45.4" controls>
  <map-layer label="OpenStreetMap" src="../data/osm.mapml" checked></map-layer>
  <map-layer label="MultiPoint Geometry" checked>
    <map-meta name="projection" content="OSMTILE"></map-meta>
    <map-feature>
      <map-featurecaption>MultiPoint</map-featurecaption>
      <map-geometry cs="gcrs">
        <map-multipoint class="point">
          <map-coordinates>-75.7016373 45.4391764 -75.7236099 45.4208652 -75.7833481 45.384225</map-coordinates>
        </map-multipoint>
      </map-geometry>
      <map-properties><h2>This is a multipoint</h2></map-properties>
    </map-feature>
  </map-layer>
</mapml-viewer>
```

### MultiLineString

```html
<mapml-viewer projection="OSMTILE" zoom="10" lon="-75.7" lat="45.4" controls>
  <map-layer label="OpenStreetMap" src="../data/osm.mapml" checked></map-layer>
  <map-layer label="MultiLineString Geometry" checked>
    <map-meta name="projection" content="OSMTILE"></map-meta>
    <map-feature>
      <map-featurecaption>MultiLineString</map-featurecaption>
      <map-geometry cs="gcrs">
        <map-multilinestring class="line">
          <map-coordinates>-75.6168365 45.471929 -75.6855011 45.458445 -75.7016373 45.4391764 -75.7030106 45.4259255</map-coordinates>
          <map-coordinates>-75.7565689 45.4117074 -75.7833481 45.384225 -75.8197403 45.3714435 -75.8516693 45.377714</map-coordinates>
        </map-multilinestring>
      </map-geometry>
      <map-properties><h2>This is a MultiLineString</h2></map-properties>
    </map-feature>
  </map-layer>
</mapml-viewer>
```

### MultiPolygon

```html
<mapml-viewer projection="OSMTILE" zoom="10" lon="-75.7" lat="45.4" controls>
  <map-layer label="OpenStreetMap" src="../data/osm.mapml" checked></map-layer>
  <map-layer label="MultiPolygon Geometry" checked>
    <map-meta name="projection" content="OSMTILE"></map-meta>
    <map-feature>
      <map-featurecaption>MultiPolygon</map-featurecaption>
      <map-geometry cs="gcrs">
        <map-multipolygon class="polygon">
          <map-polygon>
          	<map-coordinates>-75.5859375 45.4656690 -75.6813812 45.4533876 -75.6961441 45.4239978 -75.7249832 45.4083331 -75.7792282 45.3772317 -75.7534790 45.3294614 -75.5831909 45.3815724 -75.6024170 45.4273712 -75.5673981 45.4639834 -75.5859375 45.4656690</map-coordinates>
          </map-polygon>
          <map-polygon>
          	<map-coordinates>-75.6744295 45.4728920 -75.7053451 45.4439942 -75.7063756 45.4249616 -75.7489704 45.4177324 -75.7788555 45.4003785 -75.7943133 45.4321899 -75.6744295 45.4728920</map-coordinates>
          </map-polygon>
        </map-multipolygon>
      </map-geometry>
      <map-properties><h2>This is a MultiPolygon</h2></map-properties>
    </map-feature>
  </map-layer>
</mapml-viewer>
```

### GeometryCollection

```html
<mapml-viewer projection="OSMTILE" zoom="10" lon="-75.7" lat="45.4" controls>
  <map-layer label="OpenStreetMap" src="../data/osm.mapml" checked></map-layer>
  <map-layer label="Geometry Collection" checked>
    <map-meta name="projection" content="OSMTILE"></map-meta>
    <map-feature>
      <map-featurecaption>Geometry Collection</map-featurecaption>
      <map-geometry cs="gcrs">
        <map-geometrycollection>
          <map-polygon class="polygon">
            <map-coordinates>-75.5859375 45.4656690 -75.6813812 45.4533876 -75.6961441 45.4239978 -75.7249832 45.4083331 -75.7792282 45.3772317 -75.7534790 45.3294614 -75.5831909 45.3815724 -75.6024170 45.4273712 -75.5673981 45.4639834 -75.5859375 45.4656690</map-coordinates>
          </map-polygon>
          <map-linestring class="line">
            <map-coordinates>-75.6168365 45.471929 -75.6855011 45.458445 -75.7016373 45.4391764 -75.7030106 45.4259255 -75.7236099 45.4208652 -75.7565689 45.4117074 -75.7833481 45.384225 -75.8197403 45.3714435 -75.8516693 45.377714</map-coordinates>
          </map-linestring>
          <map-point class="point">
            <map-coordinates>-75.6916809 45.4186964</map-coordinates>
          </map-point>
        </map-geometrycollection>
      </map-geometry>
      <map-properties><h2>This is a Geometry Collection</h2></map-properties>
    </map-feature>
  </map-layer>
</mapml-viewer>
```
