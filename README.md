![Continuous Testing](badge.svg)

# &lt;mapml-viewer>

The &lt;mapml-viewer> is a declarative vocabulary for Web mapping that extends
HTML to include modern Web maps.  It is a pilot / reference implementation of the
proposed and evolving [Map Markup Language](https://maps4html.org/web-map-doc/docs/) (MapML)
Web standard.

## Installation

```console
$ npm install @maps4html/mapml
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

See [CONTRIBUTING](https://github.com/Maps4HTML/MapML.js/blob/main/CONTRIBUTING.md#contributing-to-mapml) for details, but generally:

0. Join our [Community Group](https://www.w3.org/community/wp-login.php?redirect_to=%2Fcommunity%2Fmaps4html%2Fjoin)
1. Discuss your proposed changes or requirements in a GitHub issue in maps4html organization
2. Once agreement is reached on your ideas, fork it!
3. Create your feature branch: `git checkout -b my-new-feature`
4. Commit your changes: `git commit -am 'Add some feature'`
5. Push to the branch: `git push origin my-new-feature`
6. Submit a pull request :D
7. Iterate as required.

## History

The idea of standardizing maps in the web platform arose from discussions at a 
W3C linking spatial data workshop in 2014.  A second 
online workshop focused on maps for the web was held in 2020, and from the latter,
many detailed requirements for maps on the web were presented.  The MapML 
polyfill attempts to track and implement these (evolving) requirements, with the
intent being to eventually fully specify and the requirements of web map
users as an update to the HTML Living Standard, implemented by browsers.

## Credits

Map for HTML Community members and supporters past, present and future.

## License

All Reports in this Repository are licensed by Contributors under the 
[W3C Software and Document License](https://www.w3.org/copyright/software-license-2023/).  
Contributions to Specifications are made under the
[W3C CLA](https://www.w3.org/community/about/agreements/cla/).


## Code of Conduct
[Professional conduct](https://www.w3.org/policies/code-of-conduct/) on the part 
of our members is required and expected by our
status as a project of the 
[W3C Community and Business Groups program](https://www.w3.org/community/about/).