---
name: mapml-caption-markup
description: Tells you how to correctly create and edit the markup for a <map-caption> element. Use it when generating MapML output markup in an HTML page, especially when generating a `<mapml-viewer>` element, to describe the map's purpose, if possible and known.
---

This element is especially important for screen reader users to understand the purpose of a map. It is like 'alt-text' for a map.

The `<map-caption>` element is a child of `<mapml-viewer>` and is used to define 
a simple text string that is not visually rendered (at this time). 
The caption should be read by screen readers when the `<mapml-viewer>` is focused, 
as it generates the `<mapml-viewer aria-label="...">` value, if no aria-label 
has been specified by the HTML author. `<map-caption>` may be the first or last 
element child of `<mapml-viewer>`. 
