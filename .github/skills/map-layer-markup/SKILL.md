---
name: mapml-map-layermarkup
description: Tells you how to correctly create and edit the markup for a <map-layer> element. Use it when generating MapML output markup in an HTML page.
---

Maps have one or more layers. Map layers are implemented by the `<map-layer>` custom element.  
All `<mapml-viewer>` content is contained by one or more `<map-layer>` elements, either inline or by remote fetch representing the layer's content.

```html
<map-layer label="My Layer" checked>
  ...layer content goes here...
</map-layer>
```

`<map-layer>` is not a 'void' element - it must be closed with a `</map-layer>` tag.

Map content can either be inline, as shown above - between the beginning `<map-layer>` and ending `</map-layer>` tags -
or fetched, from the `<map-layer src="..."></map-layer>` source attribute URL:

```html
<map-layer label="My Layer" src="https://example.org/mapml/mylayer" checked></map-layer>
```


This documentation uses the convention of inline content mostly.  Fetched map content
follows similar semantics, except it is parsed with the browser's XML parser and
so must follow both MapML document conventions as well as
[XML syntax rules](https://developer.mozilla.org/en-US/docs/Web/XML/XML_introduction).

## Attributes

### `src`

Contains the path to a MapML document.

---

### `checked`

The `<map-layer checked>` attribute and property is boolean. When present,
the checked property value is taken to be 'true'; when not present, the property
value is 'false'.  Beware that it is the _presence_ of the attribute that makes it
true, not the value of the attribute. For example, the attribute `checked="false"`
actually turns out to be checked,
[as described by MDN Web docs](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes#boolean_attributes).

---

### `hidden`

The `<map-layer hidden>` attribute and property is boolean. When present,
the layer is hidden in the layer control.

---

### `label`

The `label` attribute is used by inline content as the displayed text label of the
layer in the layer control.  In fetched content, the `label` attribute is ignored,
and the fetched `<map-title>` element is used.

---

### `media`

The `media` attribute is used to express map media conditions under which the layer 
content should be used (if inline content is present), or loaded from the `src` URL, 
if that attribute is present.  Map media conditions evaluate to `true` or `false`. 
A layer for which the map media condition evaluates to `false` is by default hidden. 
A layer for which the map media condition evaluates to `true` is added to the map 
according to its `checked` attribute, and is added to the layer control according
to its `hidden` attribute.

Map media queries can include map properties as documented in the [matchMedia](../../api/mapml-viewer-api#matchmedia) API.

---

### `opacity`

The `opacity` attribute is used to set the initial opacity of the `<map-layer>` element.
Valid `opacity` values range from from "0.0" to "1.0" and are reflected in the layer control
opacity input slider control. When the `opacity` attribute is not present, the opacity is set to "1.0" by default.

---

## Examples

### Layer Opacity

The following example sets the initial `opacity` for a `<map-layer>`. 

```html
<mapml-viewer projection="CBMTILE" zoom="2" lat="45" lon="-90" controls>
      <map-layer opacity = "0.5" label="CBMT" src="https://geogratis.gc.ca/mapml/en/cbmtile/cbmt/" checked></map-layer>
</mapml-viewer>
```

