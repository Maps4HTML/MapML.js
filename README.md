
# Customized built-in &lt;map&gt; element

![Build Status](https://api.travis-ci.com/Maps4HTML/Web-Map-Custom-Element.svg?branch=master)

The customized built-in `<map>` element is a prototype [implementation](http://maps4html.github.io/Web-Map-Custom-Element/)
of the [HTML-Map-Element specification](http://maps4html.github.io/HTML-Map-Element/spec/).

The HTML author can add <span title="Map Markup Language">[MapML](https://maps4html.org/MapML/spec/)</span>
sources/layers by specifying one or more `<layer->` elements as children of `<map>`.
The map provides a default set of controls which are turned on or off with the map's `controls` boolean attribute.
The `width` and `height` attributes of the map should be specified, and can be overriden using CSS properties.
The initial zoom and location of the map are controlled by the `zoom`, `lat` and `lon` attributes.
The default `projection` is `OSMTILE` (Web Mercator).

Example:

```html
<map is="web-map" zoom="3" lat="0" lon="0" width="800" height="400" controls>
    <layer- src="https://geogratis.gc.ca/mapml/en/osmtile/osm/" label="OpenStreetMap" checked></layer->
</map>
```

## Maps for HTML Community Group

MapML and the &lt;map&gt; custom element are being developed by the W3C [Maps for HTML Community Group](http://www.w3.org/community/maps4html/).
Membership in the group is encouraged, however you do not have to join to use the information found here.
If you wish to contribute, please join the Maps For HTML Community Group,
and help us make the Web a map-friendly platform for everyone, everywhere!
