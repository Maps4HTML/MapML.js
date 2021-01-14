# &lt;mapml-viewer&gt; custom element

![Build Status](https://api.travis-ci.com/Maps4HTML/Web-Map-Custom-Element.svg?branch=master)
![Continuous Testing](https://github.com/Maps4HTML/Web-Map-Custom-Element/workflows/Continuous%20Testing/badge.svg)

The `<mapml-viewer>` custom element is a prototype implementation of the
[`<map>` media element](https://maps4html.org/MapML/spec/#web-maps)
defined in the MapML (Map Markup Language)
[specification](https://maps4html.org/MapML/spec/).

<!-- ## Installation -->

## Usage

The HTML author can add MapML
sources (layers) by specifying one or more `<layer->` custom elements as
children of `<mapml-viewer>`.

The map provides a default set of controls which are turned on or off with the
map's `controls` boolean attribute.

The `width` and `height` attributes of the map should be specified,
and can be overriden using CSS properties.

The initial zoom and location of the map are controlled by the `zoom`,
`lat` and `lon` attributes.
The default `projection` is `OSMTILE` (Web Mercator).

### Example markup of a basic map

```html
<mapml-viewer zoom="3" lat="0" lon="0" width="800" height="400" controls>
  <layer- src="https://geogratis.gc.ca/mapml/en/osmtile/osm/" label="OpenStreetMap" checked></layer->
</mapml-viewer>
```

### Styling the map element

It is recommended to use the
[`:defined`](https://developer.mozilla.org/en-US/docs/Web/CSS/:defined)
pseudo-class to progressively style the map element.
It ensures styles only apply in
[browsers that support custom elements](https://caniuse.com/custom-elementsv1).

```css
mapml-viewer:defined {
  background-color: black; /* custom background color */
  border: none; /* remove default border */
  max-width: 100%; /* responsive map */
}
```

## A parellel customized built-in element

The `<map is="web-map">` customized built-in element is developed in parallel
to the `<mapml-viewer>` autonomous custom element.
Please note that `<map>` as a customized built-in element has proven to have
a critical [accessibility issue](https://github.com/w3c/html-aam/issues/292)
in some browsers, which causes screen readers not to announce any of the map
element's content,
it is therefore recommended not to use `<map is="web-map">` in production.

## Maps for HTML Community Group

MapML and the custom map elements are being developed by the
W3C [Maps for HTML Community Group](http://www.w3.org/community/maps4html/).
Membership in the group is encouraged, however you do not have to join to use
the information found here.
If you wish to contribute, please join the Maps For HTML Community Group,
and help us make the Web a map-friendly platform for everyone, everywhere!
