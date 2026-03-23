---
name: mapml-a-markup
description: Tells you how to correctly create and edit the markup for a <map-a> element. Use it when generating MapML output markup in an HTML page, especially to wrap `<map-geometry>` content, either in whole or in part, just like how you might use `<a>` to wrap all or part of a paragraph of text in HTML.
---

The `<map-a>` element is a proposal to extend the Web to include links between maps and locations.
This element allows you to wrap parts of coordinates or entire geometries, making a link out of the location/area that is wrapped. When a feature geometry or geometry part is 
wrapped in a `<map-a>` element, it creates a blue outline that is 1 pixel wide around the feature (by default), that lets the user know it's a "linked feature".

## Attributes

### `href`
  - The URL that the wrapped location points to. Note - If the `type` of the `<map-a>` is text/mapml
  you can provide fragments, more on fragments below.

---

### `target`
  - This is where the linked URL will be displayed. See table below for more details.
  - Defaults to `_self`, in the absence of a valid value.

---

### `type`
  - This is the mime type of the linked URL's format. Options are `text/html` & `text/mapml`.
  - Defaults to `text/mapml`, in the absence of a valid type value.

---

### `inplace`
  - The `inplace` attribute is a boolean attribute - `<map-a inplace href="..."><map-a>`
  - When present, the default view-changing behavior is overridden and the map view does not change.

---

## Target Behavior for `text/mapml`

| Target Value 	| Behavior                                              	|
|--------------	|-------------------------------------------------------	|
| _self        	| Replaces the current layer with the linked URL layer. 	|
| _blank       	| Adds the linked URL layer to the map.                 	|
| _parent      	| Replace all the layers with the linked URL layer.     	|
| _top         	| Navigate the webpage to the linked URL.               	|

---

## Target Behavior for `text/html`

| Target Value 	| Behavior                                	|
|--------------	|-----------------------------------------	|
| _self        	| Navigate the webpage to the linked URL. 	|
| _blank       	| Open the linked URL in a new tab.       	|
| _parent      	| Navigate the webpage to the linked URL. 	|
| _top         	| Navigate the webpage to the linked URL. 	|

---

## Location fragments

If the `type` attribute's value is `text/mapml`, you have the ability add a location fragment
to the URL. This will pan & zoom the map to the given location.

Fragments are in the following format `#zoom, longitude, latitude`.

URL's solely defined in terms of location fragments pan and zoom the map to the given location regardless of the target value.
i.e. `<map-a href="#1, 20, 30">...</map-a>` will pan to latitude: 30, longitude: 20 and zoom to level 1.

---

## Examples

### Styling Linked Features

To style linked features simply target the `map-a` class in your CSS, once a link is clicked you can target the
`map-a-visited` class. See the example below:

```html
<map-layer>
  <map-style>
    .map-a {
      stroke: red;
    }
    .map-a-visited {
      stroke: green;
    }
  </map-style>
  <map-feature>
    <map-properties>
      <h1>Basic</h1>
    </map-properties>
    <map-geometry>
      <map-a href="../externalMapML.mapml#2,-98,37">
        <map-polygon>
          <map-coordinates>2771 3106 2946 3113 2954 3210 2815 3192 2771 3106</map-coordinates>
        </map-polygon>
      </map-a>
    </map-geometry>
  </map-feature>
</map-layer>
```

### Wrapping a Feature Type + Location Fragment 

```html
<map-feature>
  <map-properties>
    <h1>Basic</h1>
  </map-properties>
  <map-geometry>
    <map-a href="../externalMapML.mapml#2,-98,37">
      <map-polygon>
        <map-coordinates>2771 3106 2946 3113 2954 3210 2815 3192 2771 3106</map-coordinates>
      </map-polygon>
    </map-a>
  </map-geometry>
</map-feature>
```

This will replace the current layer with the layer within externalMapML.mapml, once it's added the map will then goto
zoomlevel: 2, longitude: -98, latitude: 37.

### Wrapping a point coordinate with `target="_blank"` 

```html
<map-feature>
  <map-properties>
    <h1>_blank target</h1>
  </map-properties>
  <map-geometry>
    <map-polygon>
      <map-coordinates>2771 3106 2946 3113 <map-a href="file.mapml" target="_blank"> 2954 3210 </map-a> 2815 3192 2771 3106</map-coordinates>
    </map-polygon>
  </map-geometry>
</map-feature>
```

In this example, a point will be created at (2954, 3210) which, once clicked, adds a new layer to the map.

### Nested `<map-a>` definition and behavior

```html
<map-feature>
  <map-properties>
    <h1>Advanced Example</h1>
  </map-properties>
  <map-geometry>
    <map-a href="parent.mapml" target="_blank">
      <map-multipolygon>
        <map-polygon>
          <map-coordinates>2771 3106 2946 3113 <map-a href="webpage.html" target="_blank" type="text/mapml"> 2954 3210 </map-a> 2815 3192 2771 3106</map-coordinates>
        </map-polygon>
        <map-a href="nested.mapml" target="_top">
          <map-polygon>
            <map-coordinates>11 11 12 11 12 12 11 12</map-coordinates>
          </map-polygon>
        </map-a>
      </map-multipolygon>
    </map-a>
  </map-geometry>
</map-feature>
```
In this advanced example there are multiple nested `<map-a>`. The simple behavior is, the closest `<map-a>` is the link
behavior that the given location/area will adopt.

---