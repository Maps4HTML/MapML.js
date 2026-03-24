This project is "MapML.js", the central polyfill implementation of the MapML vocabulary.  MapML is implemented as a suite of autonomous custom elements that come together as a package.

For instructions on the markup rules of MapML, which are especially important to follow when _generating_ either standalone MapML documents or MapML html markup within an HTML document, see the .github/skills folder child folders named `map-something-markup` generally, where `map-something` is the custom element name.  These skills may also be useful when considering the design of new markup-driven features.

This project uses playwright for e2e tests. There are multiple generations of test, so consistency is lacking.  We are trying to move away from testing the content rendered by Leaflet where possible, towards even screenshot based tests, even though they can be tricky.

Further information will go below, as appropriate.