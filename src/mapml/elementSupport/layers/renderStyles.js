export function renderStyles(mapStyleOrLink) {
  let e = mapStyleOrLink.link || mapStyleOrLink.styleElement;
  if (e === undefined) return;

  const getStylePositionAndNode = (styleOrLink) => {
    // Get all already rendered <style> or <link> elements in the shadow DOM container
    const renderedSiblingStyles = Array.from(
      this._container.querySelectorAll('style, link[rel="stylesheet"]')
    );

    // If there are no rendered styles or links yet, insert before any content
    if (renderedSiblingStyles.length === 0) {
      return this._container.lastChild &&
        (this._container.lastChild.nodeName.toUpperCase() === 'SVG' ||
          this._container.lastChild.classList.contains(
            'mapml-vector-container'
          ))
        ? { position: 'beforebegin', node: this._container.lastChild }
        : this._container.lastChild
        ? { position: 'afterend', node: this._container.lastChild }
        : { position: 'afterbegin', node: this._container };
    }

    // Peek into the light DOM context for comparison
    const mapStyleOrLinkLightDOMElement =
      styleOrLink.mapStyle || styleOrLink.mapLink;

    // Traverse the rendered siblings in the shadow DOM
    for (let i = 0; i < renderedSiblingStyles.length; i++) {
      const rendered = renderedSiblingStyles[i];
      const siblingMapStyleOrLinkLightDOMElement =
        rendered.mapStyle || rendered.mapLink;

      // Compare the light DOM order
      if (
        siblingMapStyleOrLinkLightDOMElement &&
        mapStyleOrLinkLightDOMElement.compareDocumentPosition(
          siblingMapStyleOrLinkLightDOMElement
        ) & Node.DOCUMENT_POSITION_FOLLOWING
      ) {
        // Insert the new style or link before the already-rendered sibling element
        return { position: 'beforebegin', node: rendered };
      }
    }

    // If no preceding sibling was found, insert after the last rendered element
    return { position: 'afterend', node: renderedSiblingStyles.at(-1) };
  };

  let positionAndNode = getStylePositionAndNode(e);
  positionAndNode.node.insertAdjacentElement(positionAndNode.position, e);
}
