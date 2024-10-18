# TAG Advice for polyfill authors

The table below is to document the extent of which the MapML polyfill
conforms to the W3C <abbr title="Technical Architecture Group">TAG</abbr>'s
[Advice for polyfill authors](https://www.w3.org/2001/tag/doc/polyfills/#advice-for-polyfill-authors).

<table>
  <tr>
    <th scope="col">TAG Advice</th>
    <th scope="col">Conforms</th>
    <th scope="col">Note</th>
  </tr>
  <tr>
    <th scope="row" align="left">
      <a href="https://www.w3.org/2001/tag/doc/polyfills/#encapsulate-as-a-module-or-umd">
      3.1 Encapsulate as a module or UMD
      </a>
    </th>
    <td align="center">
      <ul><li>- [x] </li></ul>
    </td>
    <td>
      ES Module
    </td>
  </tr>
  <tr>
    <th scope="row" align="left">
      <a href="https://www.w3.org/2001/tag/doc/polyfills/#use-smart-distribution">
      3.2 Use smart distribution
      </a>
    </th>
    <td align="center">
      <ul><li>- [x] </li></ul>
    </td>
    <td>
      <a href="https://www.npmjs.com/package/@maps4html/mapml">Published to npm</a>
      and
      <a href="https://unpkg.com/@maps4html/mapml@latest/dist/mapml.js">hosted on the UNPKG CDN</a>
    </td>
  </tr>
  <tr>
    <th scope="row" align="left">
      <a href="https://www.w3.org/2001/tag/doc/polyfills/#don-t-squat-on-proposed-names-in-speculative-polyfills">
      3.3 Don't squat on proposed names in speculative polyfills
      </a>
    </th>
    <td align="center">
      <ul><li>- [ ] </li></ul>
    </td>
    <td>
      TBD
    </td>
  </tr>
  <tr>
    <th scope="row" align="left">
      <a href="https://www.w3.org/2001/tag/doc/polyfills/#pass-web-platform-tests-if-they-exist">
      3.4 Pass web platform tests, if they exist
      </a>
    </th>
    <td align="center">
      <ul><li>- [ ] </li></ul>
    </td>
    <td>
      On the backlog of the
      <a href="https://github.com/Maps4HTML/MapML.js/projects/2#card-43799737">Road Map</a> project
    </td>
  </tr>
  <tr>
    <th scope="row" align="left">
      <a href="https://www.w3.org/2001/tag/doc/polyfills/#detect-and-defer-to-native-implementations">
      3.5 Detect and defer to native implementations
      </a>
    </th>
    <td align="center">
      <ul><li>- [ ] </li></ul>
    </td>
    <td>
      TBD
    </td>
  </tr>
  <tr>
    <th scope="row" align="left">
      <a href="https://www.w3.org/2001/tag/doc/polyfills/#work-with-spec-editors">
      3.6 Work with spec editors
      </a>
    </th>
    <td align="center">
      <ul><li>- [ ] </li></ul>
    </td>
    <td>
      TBD
    </td>
  </tr>
</table>
