---
name: mapml-feature-markup
description: Tells you how to correctly create and edit the markup for a <map-feature> element. Use it when generating MapML output markup in an HTML page.
---

Map [features](https://en.wikipedia.org/wiki/Geographical_feature) are real or imaginary location objects represented in 2D according to a standard model, called the [Simple Features model](https://en.wikipedia.org/wiki/Simple_Features). There exists a wide variety of formats that allow the encoding of the Simple Features model, famously including: GeoJSON, Keyhole Markup Language (KML), and shape files (.shp), among many others.

Map features are represented in HTML MapML using a `<map-feature>` element, which is rendered on the map through translation to SVG. This allows the feature to scale without distortion, as you zoom in and out. 

A `<map-feature>` element is a container for a feature's accessible name (`<map-featurecaption>`), scalar properties (`<map-properties>`) and its geometry (`<map-geometry>`).  The `<map-feature>` element can be modeled as inline HTML content as a child of the `<map-layer>` element, or in an XHTML MapML document, as a child of the `<map-body>` element.

## Attributes

### `zoom`

This allows you to set the zoom level the feature is rendered at. The zoom value 
should fall within the range of 0 to the maximum zoom level of the map's 
[projection](../meta/#attributes).

### `min`

The `min` (zoom) attribute gets or sets the native minimum zoom of the feature.
Map features' geometry and other properties are scale-dependent. The `min` value 
is a rendering zoom value cut-off; at map zoom values less than `min`, the feature 
will not be rendered. 

If `min` is not provided, a fallback value will be calculated; the fallback value
will be the minimum zoom value of the layer, or if that is not specified, of the 
map viewer `projection`'s minimum value i.e. 0.

### `max`

The `max` (zoom) attribute gets or sets the native maximum zoom of the feature.
Map features' geometry and other properties are scale-dependent. The `max` value 
is a rendering zoom value cut-off; at map zoom values greater than `max`, the 
feature will not be rendered. 

If `max` is not provided, a fallback value will be calculated; the fallback value
will be the maximum zoom value of the layer, or if that is not specified, of the 
map viewer `projection`'s maximum value e.g. 25 (depending on the projection).

---

## Child Elements

### `<map-featurecaption>`

This element contains the feature's accessible name, which is displayed when the feature is in focus or hovered.

---

### `<map-properties>`

This element contains the contents of the popup associated to a given feature. Details on the properties elements and it's syntax can be found [here](../properties/).

---

### `<map-geometry>`

This element contains the different points, lines and polygons that will be drawn. Details on the geometry elements and it's syntax can be found [here](../geometry/).

#### Attributes

- `cs`
  - This allows you to set the [coordinate system](../meta/#attributes) of geometries.
  - Defaults to pcrs (projected coordinates), but can be set to tilematrix | pcrs | gcrs explicitly.

---

## Related Elements

Other elements may be important to provide context for feature data:


### `<map-meta name="zoom">`

Sets the native minimum and maximum [native zoom](../meta/#attributes). It also allows you to set a value, this is the default zoom of all features in the case the `<map-feature>` is missing a zoom attribute.

```html
<map-meta name="zoom" content="min=1,max=5,value=0"></map-meta>
```

---

### `<map-meta name="projection">`

Sets the [projection](../meta/#attributes) of the layer. 

```html
<map-meta name="projection" content="CBMTILE"></map-meta>
```

---

### `<map-meta name="cs">`

Sets the default [coordinate system](../meta/#attributes) of the layer. If a feature is missing the cs attribute it will 'fall back' to the value provided by a `map-meta` element, or `pcrs` if no `map-meta` element is in scope.

```html
<map-meta name="cs" content="gcrs"></map-meta>
```

---

### `<map-meta name="extent">`

Sets the [extent](../meta/#attributes) of the layer.

```html
<map-meta name="extent" content="zoom=0,top-left-column=0,top-left-row=0,bottom-right-column=5,bottom-right-row=5"></map-meta>
```

---

## Examples

```html
  <mapml-viewer projection="CBMTILE" zoom="2" lat="45.5052040" lon="-75.2202344"
    controls>

    <map-layer label="Arizona" checked>
      <map-meta name="projection" content="CBMTILE"></map-meta>
      <map-meta name="zoom" content="min=1,max=5,value=0"></map-meta>
      <map-meta name="cs" content="gcrs"></map-meta>
      <map-meta name="extent" content="zoom=0,top-left-column=0,top-left-row=0,bottom-right-column=5,bottom-right-row=5"></map-meta>
      <map-link id="first" rel="stylesheet" type="text/css" href="first.css"></map-link>
      <map-feature zoom="2" class="refDiff">
        <map-properties>
          <h1>Test</h1>
          <a href="https://example.org/">test</a>
        </map-properties>
        <map-geometry cs="tilematrix">
          <map-polygon>
            <map-coordinates>11 11 12 11 12 12 11 12</map-coordinates>
          </map-polygon>
        </map-geometry>
      </map-feature>

      <map-feature zoom="2" class="refDiff">
        <map-properties>
          <h1>Test</h1>
        </map-properties>
        <map-geometry cs="pcrs">
          <map-polygon>
            <map-coordinates>257421 -3567196 -271745 1221771 -3896544 242811 -3183549 -2613313</map-coordinates>
          </map-polygon>
        </map-geometry>
      </map-feature>

      <map-feature zoom="2" class="refDiff">
        <map-properties>
          <h1>Test</h1>
        </map-properties>
        <map-geometry cs="tcrs">
          <map-polygon>
            <map-coordinates>2771 3106 2946 3113 2954 3210 2815 3192</map-coordinates>
          </map-polygon>
        </map-geometry>
      </map-feature>

      <map-feature zoom="2" class="refDiff">
        <map-properties>
          <h1>Arizona</h1>
        </map-properties>
        <map-geometry>
          <map-polygon>
            <map-coordinates>-109.042503 37.000263 -109.04798 31.331629 -111.074448 31.331629 -112.246513 31.704061
              -114.815198 32.492741 -114.72209 32.717295 -114.524921 32.755634 -114.470151 32.843265 -114.524921
              33.029481 -114.661844 33.034958 -114.727567 33.40739 -114.524921 33.54979 -114.497536 33.697668
              -114.535874 33.933176 -114.415382 34.108438 -114.256551 34.174162 -114.136058 34.305608 -114.333228
              34.448009 -114.470151 34.710902 -114.634459 34.87521 -114.634459 35.00118 -114.574213 35.138103
              -114.596121 35.324319 -114.678275 35.516012 -114.738521 36.102045 -114.371566 36.140383 -114.251074
              36.01989 -114.152489 36.025367 -114.048427 36.195153 -114.048427 37.000263 -110.499369 37.00574
              -109.042503 37.000263</map-coordinates>
          </map-polygon>
        </map-geometry>
      </map-feature>
    </map-layer>
  </mapml-viewer>
```
### An inline HTML map-feature

```html
<map-layer label="My Feature Layer" checked>
    <map-feature id="mem35059" zoom="17">
      <map-properties>
        <table>
          <tr><th>code</th><td>1200020</td></tr>
          <tr><th>accuracy</th><td>26</td></tr>
          <tr><th>valdate</th><td>1995</td></tr>          
          <tr>
            <th>image</th>
            <td>
              <a href="https://www.veterans.gc.ca/eng/remembrance/memorials/national-inventory-canadian-memorials/details/9304">
                <img src="https://www.veterans.gc.ca/images/remembrance/memorials/national-inventory-canadian-memorials/mem/35059-173a.jpg" width="60" height="60">
              </a>
            </td>
          </tr>
          <tr><th>theme</th><td>FO</td></tr>
          <tr><th>type</th><td>2</td></tr>
          <tr><th>elevation</th><td>61</td></tr>
          <tr><th>altiaccu</th><td>5</td></tr>
        </table>
      </map-properties>
      <map-geometry>
        <map-point>
          <map-coordinates>-75.705278 45.397778</map-coordinates>
        </map-point>
      </map-geometry>
    </map-feature>
</map-layer>
```

### A map-feature in a fetched XHTML MapML document

```html
<map-layer label="My Feature Layer" src="https://example.org/mem/35059.mapml"></map-layer>
```

### 35059.mapml:

```html
<mapml- lang="en" xmlns="http://www.w3.org/1999/xhtml">
  <map-head>
    <map-title>The Man With Two Hats</map-title>
    <map-meta http-equiv="Content-Type" content="text/mapml"></map-meta>
    <map-meta charset="utf-8"></map-meta>
    <map-meta name="projection" content="OSMTILE"></map-meta>
    <map-meta name="cs" content="gcrs"></map-meta>
    <map-link rel="license" href="https://open.canada.ca/en/open-government-licence-canada" title="Open Government License"/>
  </map-head>
  <map-body>
    <map-feature id="mem35059">
      <map-properties>
        <table>
          <tr><th>code</th><td>1200020</td></tr>
          <tr><th>accuracy</th><td>26</td></tr>
          <tr><th>valdate</th><td>1995</td></tr>          
          <tr>
            <th>image</th>
            <td>
              <a href="https://www.veterans.gc.ca/eng/remembrance/memorials/national-inventory-canadian-memorials/details/9304">
                <img src="https://www.veterans.gc.ca/images/remembrance/memorials/national-inventory-canadian-memorials/mem/35059-173a.jpg" width="60" height="60" />
              </a>
            </td>
          </tr>
          <tr><th>theme</th><td>FO</td></tr>
          <tr><th>type</th><td>2</td></tr>
          <tr><th>elevation</th><td>61</td></tr>
          <tr><th>altiaccu</th><td>5</td></tr>
        </table>
      </map-properties>
      <map-geometry>
        <map-point>
          <map-coordinates>-75.705278 45.397778</map-coordinates>
        </map-point>
      </map-geometry>
    </map-feature>
  </map-body>
</mapml->
```
