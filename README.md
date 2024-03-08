![Continuous Testing](badge.svg)

# &lt;mapml-viewer>

The &lt;mapml-viewer> is a declarative vocabulary for Web mapping that extends
HTML to include modern Web maps.  It is a pilot / reference implementation of the
proposed and evolving [Map Markup Language](https://maps4html.org/web-map-doc/docs/) 
Web standard.

## Installation

```console
$ npm install @maps4html/web-map-custom-element
```

See [instructions](https://maps4html.org/web-map-doc/docs/installation#install-the-mapml-viewer-suite-of-custom-elements) for further details.

## Usage

You create a map with one or more layers via the &lt;mapml-viewer> HTML tag. Add
layers via the &lt;layer-> tag with content OR a src attribute pointing to a 
MapML document (must be served as either `text/mapml` or `application/xml` content
type):

```html
<mapml-viewer projection="OSMTILE" zoom="0" lat="0.0" lon="0.0" controls>
  <layer- label="OpenStreetMap" src="https://geogratis.gc.ca/mapml/en/osmtile/osm/" checked></layer->
</mapml-viewer>
```
OR inline content
```html
<mapml-viewer projection="OSMTILE" lat="10" lon="0" zoom="1" controls>
  <layer- label="OpenStreetMap" checked>
    <map-extent units="OSMTILE">
      <map-input name="z" type="zoom" value="18" min="0" max="18"></map-input>
      <map-input name="x" type="location" units="tilematrix" axis="column" min="0" max="262144"></map-input>
      <map-input name="y" type="location" units="tilematrix" axis="row" min="0" max="262144"></map-input>
      <map-link rel="tile" tref="https://tile.openstreetmap.org/{z}/{x}/{y}.png"></map-link>
    </map-extent>
  </layer->
</mapml-viewer>
```

## Contributing

See [CONTRIBUTING](https://github.com/Maps4HTML/Web-Map-Custom-Element/blob/main/CONTRIBUTING.md#contributing-to-mapml) for details, but generally:

0. Join our [Community Group](https://www.w3.org/community/wp-login.php?redirect_to=%2Fcommunity%2Fmaps4html%2Fjoin)
1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## History

TODO: Write history

## Credits

Map for HTML Community members and supporters past, present and future.

## License

All Reports in this Repository are licensed by Contributors under the 
[W3C Software and Document License](http://www.w3.org/Consortium/Legal/2015/copyright-software-and-document).  
Contributions to Specifications are made under the
[W3C CLA](https://www.w3.org/community/about/agreements/cla/).
