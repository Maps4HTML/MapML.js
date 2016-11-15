
# Customized Built-In &lt;map&gt; Element

[![Build Status](https://travis-ci.org/prushforth/Web-Map-Custom-Element.svg?branch=master)](https://travis-ci.org/prushforth/Web-Map-Custom-Element)

##&lt;map is="web-map"&gt;

The Customized Built-In &lt;map&gt; Element is a prototype [implementation](http://maps4html.github.io/Web-Map-Custom-Element/) of the [HTML-Map-Element specification](http://maps4html.github.io/HTML-Map-Element/spec/).

`map is="web-map"` is a map. The HTML author can add MapML sources by specifying the &lt;`layer- src="..."`&gt; src attribute.

Example:
<!---
```
<custom-element-demo>
  <template>
    <script src="../webcomponentsjs/webcomponents-lite.js"></script>
    <link rel="import" href="web-map.html">
    <next-code-block></next-code-block>
  </template>
</custom-element-demo>
```
-->
```html
<map is="web-map" projection="OSMTILE" zoom="3" lat="0" lon="0" width="800" height="400" controls>
    <layer- src="https://geogratis.gc.ca/mapml/en/osmtile/osm/" label="OpenStreetMap" checked></layer->
</map>
```

## Maps4HTML Community Group

MapML and the web-map custom element area being developed by the W3C [Maps For HTML Community Group](http://www.w3.org/community/maps4html/).  Membership in that group is encouraged, however you do not have to join to use the information found here.  However, if you wish to contribute, please join the Maps For HTML Community Group, and help us make the Web a map-friendly platform for everyone, everywhere!
