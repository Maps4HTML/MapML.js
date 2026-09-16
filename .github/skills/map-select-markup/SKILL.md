---
name: map-select-markup
description: Tells you how to correctly create and edit the markup for a <map-select> element. Use it when generating MapML output markup in an HTML page, especially when creating a template variable for dimensional data with discrete values selectable by the user.
---

The `<map-select>` element is an extension of HTML `<select>` and is used as a child of the `<map-extent>` element. The `<map-select>` element declares a variable with predefined `<map-option>'s` which are selected through the layer control and used by the polyfill.

The `<map-select>` element contains one or more `<map-option>` elements.

:::tip

Change the `<map-select>` option through the layer control (top-right of the map) to view data for different timestamps.

:::

## Attributes

### `name`
Sets the name of the variable created by the input. The variable can then be 
referenced by the URL template `<map-link>` [tref attribute](../link#tref), 
using the `{name}` variable reference notation.

---

### `id`
Sets the id of the `<map-select>` element, identifies the select within the current document.

---

## Child Elements

### `<map-option>`

This element contains the options for the `<map-select>` element. A `<map-select>` element can contain one or more `<map-option>` elements.

---

## Examples

### Change map source
```html
<mapml-viewer projection="OSMTILE" zoom="2" lat="65" lon="-90" controls="">
  <map-layer label="Basemap" checked>
    <map-extent units="OSMTILE" checked>
      <map-input name="z" type="zoom"  value="18" min="0" max="18"></map-input>
      <map-input name="x" type="location" units="tilematrix" axis="column" min="0"  max="262144" ></map-input>
      <map-input name="y" type="location" units="tilematrix" axis="row" min="0"  max="262144" ></map-input>
      <map-link rel="license" href="https://www.openstreetmap.org/copyright" title="OpenStreetMap"></map-link>
      <map-link rel="license" href="https://www.openstreetmap.bzh/" title="Breton OpenStreetMap Team"></map-link>
      
      <map-select id="urlOptions" name="source">
        <map-option value="tile.openstreetmap.bzh/br">OpenStreetMap_BZH</map-option>
        <map-option value="tile.openstreetmap.org">OpenStreetMap_Mapnik</map-option>    
      </map-select>
      
      <map-link rel="tile" tref="https://{source}/{z}/{x}/{y}.png" ></map-link>
    </map-extent>
  </map-layer>
</mapml-viewer>
```
