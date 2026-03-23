---
name: mapml-link-markup
description: Tells you how to correctly create and edit the markup for a <map-link> element. Use it when generating MapML output markup in an HTML page.
---

The `<map-link>` element is an extended HTML `link` element, for use in Web 
maps.  Most of the extensions center on proposed new values of the `rel` attribute.

`<map-link>` has several uses:

- include layer data attribution / licensing links in the bottom right-hand corner of the map
- provide links to different styles of the layer, via `style` and `self` rel values. These links are rendered as user affordances, and can be used to switch, for example, from satellite to map view of a layer.
- provide links to alternate projections for a layer, via the `alternate` rel value, in conjunction with the `projection="..."` attribute. Such links are automatically followed by the polyfill when appropriate.
- provide a URL template that is processed and converted to a URL and fetched by the polyfill, each time the map requires new content to render, such as a tile, via the `tile`, `image`, `feature` and `query` rel values, in conjunction with the `tref="..."` attribute. Such links are automatically created and followed / imported when appropriate.
- include links to legend graphics for a layer.  Currently such links are rendered as hyperlinks, not as graphics.
- provide links to CSS stylesheets via the `stylesheet` rel value, which are imported by the polyfill automatically.
- provide links to layers at next native zoom level via `zoomin`, `zoomout` rel values.  Such links are automatically followed by the polyfill when appropriate.


## Attributes

### `rel`

The `rel` attribute designates the type of resource that is linked to. MapML 
defines several uses of existing and new `rel` keyword values.

| Value         | Description                                          	  |
|--------------	|--------------------------------------------------------	|
| `license`       | The `href` value links to a license description resource for the layer. The `title` attribute is used as the text to display for the link. The hyperlink is presented in the attribution control, at the lower right corner of the map viewport.
| `alternate`     | The `alternate` rel value is used with the `projection` attribute to provide the link to an equivalent layer resource in a different projection than that provided by the current resource.  This can be very useful for providing an author-friendly experience, where a map document may be added as a layer to a map that declares a different projection than that of the layer.  The polyfill will automatically "redirect" to the alternate projection document that matches that of the map. |
| `self`       | The `self style` (or `style self`) link rel indicates that the current document is one of a set of named alternate styles for a layer.  Other members of the set are `<map-link>` elements tagged with the `style` link relation. Other members of the set of alternate / different styles for the layer are presented to the user as a set of mutually exclusive choices.  User selection of one of the choices replaces the current layer entirely. |
| `style`      | The `style` link relation by itself designates that link as an alternate or different style of the current layer style. This is often used to switch between, for example, satellite and cartographic views of the same layer. When used in conjunction with the `self` link relation, i.e. `rel="self style"`, the current document is identified as a member of the set of alternate styles, and is selected in the layer control affordance for changing styles. |
| `tile`       | This link relation is used in conjunction with the `tref="..."` attribute to define a URL template that identifies native (server) tile resources. Can be used in conjunction with the `type="..."` attribute to indicate the media type of the remote resource, for example: `type="text/mapml"` tells the polyfill to parse and render the fetched resource as map feature content. This link relation is used with standard Web Map Tile Services (WMTS), and its non-standard equivalents. |
| `image`      | The `image` link relation is used similarly to the `tile` link relation, except it tells the polyfill that the remote resources to be fetched are images that will be trimmed (by the server) to exactly match the width and height of the map viewport.  This link relation is used with standard Web Map Services (WMS) and its non-standard equivalents. |
| `features`    | The `features` link relation tells the polyfill to parse and render the fetched resource as map feature content. |
| `zoomin`     | The link `href` is followed automatically by the polyfill when the map is zoomed in by the user to a value greater than the maximimum value of the zoom range of the current layer.  The referenced map layer resource replaces the current map layer.  The polyfill does not represent this link as a user-visible affordance, it is followed automatically. If the remote resource does not contain a reciprocal `zoomout` link, the map state change is one-way i.e. the layer is permanently replaced. |
| `zoomout`    | The link `href` is followed automatically by the polyfill when the map is zoomed out by the user to a value less than the minimum value of the zoom range of the current layer.  The referenced map layer resource replaces the current map layer.  The polyfill does not represent this link as a user-visible affordance, it is followed automatically.  If the remote resource does not contain a reciprocal `zoomin` link, the map state change is one-way i.e. the layer is permanently replaced.  |
| `legend`     | The `legend` link relation designates a link to metadata, typically an image, describing the symbology used by the current layer.  Currently, the polyfill creates a hyperlink for the label of the layer in the layer control, which opens in a new browsing context. |
| `query`      | The `query` link relation is used in combination with the `tref="..."` attribute to establish a URL template that composes a map query URL based on user map gestures such as click or touch. These URLs are fetched and the response presented on top of the map as a popup. Such queries can return text/html or text/mapml responses. In the latter case, the response may contain more than one feature, in which case a 'paged' popup is generated, allowing the user to cycle through the features' individual metadata. |
| `stylesheet` | The link imports a CSS stylesheet from the `href` value. |


---

### `type`

The `type` attribute defines the expected 
[MIME media type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types) 
of the remote resource. Depending on the [`rel` value](#rel), the `type` may play a significant role in determining
the polyfill behaviour.

Common values of `type` include **text/html**, **text/mapml**, and **image/\***.

---
### `title`

The `title` of the linked resource is usually rendered or presented to the user, 
for example, the `<map-link rel="license" title="Copyright FooBar Inc.">` link
is rendered as a hyperlink in the attribution control entry for the current 
layer.

---
### `href`

The `href` of a `<map-link>` must be a URL value of a resource that can be fetched. 
The URL can be absolute or relative.

---
### `hreflang`

Advisory [language designation](https://datatracker.ietf.org/doc/html/rfc5646) about remote resource.

---
### `tref`

The `tref` attribute contains a string that, once processed, will be treated as 
a URL and fetched automatically by the polyfill. The string is known as a URL
template.  The processing that takes place prior to a URL template becoming a
valid URL is _variable reference substitution_.  Variables are created by 
`<map-input name="foo">` elements.  The name of the variable can be
referenced in the URL template string contained in the `tref` value, using the
`{foo}` syntax notation.  A URL template string can contain 0 or more variable
references.  Processing will remove variable references that are valid. That is,
all variables that have been created by `<map-input>`s that are referenced in the
template will be replaced with the value of the variable at the time of processing.

---
### `tms`

The `tms` boolean attribute tells the polyfill that the row (vertical) axis of the
remote tile server follows [the tms convention](https://wiki.osgeo.org/wiki/Tile_Map_Service_Specification)
of the y (row) axis being reversed (compared with [convention](https://gist.github.com/tmcw/4954720#converting)), 
with the positive direction of tile row values being up/north.  This convention is not a 
standard, yet has unfortunately become popular among open source GIS professionals.

---
### `projection`

The `projection` attribute identifies the projection of the remote layer resource.
This attribute is used in conjunction with the [`rel=alternate` rel value](#rel).

Projection values [defined by the polyfill](../mapml-viewer#projection) include: 
`OSMTILE`, `WGS84`, `CBMTILE` and `APSTILE`.  Projection values are case-sensitive.

---


| <!-- -->    | <!-- -->    |
|-------------|-------------|
| [Content categories](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Content_categories) | [Metadata content](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Content_categories#metadata_content) |
| Permitted content | None. Like the HTML `<link>` element `<map-link>` is an empty element.  |
| Tag omission | While the HTML `<link>` element is a void element, the polyfill must have an end tag. |
| Permitted parents | Any element that accepts metadata element children. |
| Implicit ARIA role   | [link](https://w3c.github.io/aria/#link) with `href` attribute. |
| Permitted ARIA roles | No roles permitted. |
| DOM Interface    | [HTMLLinkElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLLinkElement) |

---

## Examples

### Tile Mapping Specification (tms)

```html
<mapml-viewer  projection="OSMTILE" zoom="1" lat="0" lon="0" controls>
 <layer- label="OpenStreetMap" src="https://geogratis.gc.ca/mapml/en/osmtile/osm/" checked hidden  ></layer->
 <layer- label="TMS COG Source" checked>
   <map-extent units="OSMTILE">
       <map-input name="zoom" type="zoom"  min="1" max="12"></map-input>
       <map-input name="row" type="location" axis="row" units="tilematrix" ></map-input>
       <map-input name="col" type="location" axis="column" units="tilematrix"></map-input>
       <!-- use the tms attribute to indicate that remote tile cache follows tms conventions -->
       <map-link tms rel="tile" tref="https://s3-eu-west-1.amazonaws.com/vito-lcv/global/2019/cog-grass-colored-fraction_grass/{zoom}/{col}/{row}.png">
   </map-link>
   </map-extent>
   </layer->
</mapml-viewer>
```