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
      const lastChild = this._container.lastChild;
      if (!lastChild) {
        return { position: 'afterbegin', node: this._container };
      }

      const isSVG = lastChild.nodeName === 'SVG';
      const isContainer =
        lastChild.classList?.contains('mapml-vector-container') ||
        lastChild.classList?.contains('mapml-extentlayer-container');

      return isSVG || isContainer
        ? { position: 'beforebegin', node: lastChild }
        : { position: 'afterend', node: lastChild };
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
