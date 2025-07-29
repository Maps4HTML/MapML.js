/**
 * Calculate the sequence position for map elements based on their position in a
 * sequence of target elements (map-tile, map-feature, map-extent).
 * - map-extent: Each element gets its own unique position (each is its own MapExtentLayer)
 * - map-tile/map-feature: Adjacent elements of same type share the same position (they share a MapTileLayer/MapFeatureLayer)
 * - used to set the zIndex for the LayerGroup's _container (rendering).
 *
 * @param {HTMLElement} element - The element to calculate position for (map-tile, map-extent, or map-feature)
 * @returns {number} The position of this element's LayerGroup
 */
export function calculatePosition(element) {
  const tagName = element.tagName.toLowerCase();
  const validTags = ['map-tile', 'map-extent', 'map-feature'];

  // Validate element type
  if (!validTags.includes(tagName)) {
    console.warn(`calculatePosition: Invalid element type ${tagName}`);
    return 0;
  }

  // Get parent - could be Element or ShadowRoot
  const parent = element.parentNode;
  if (!parent) return 1;

  // Get children - works for both Element and ShadowRoot
  // For ShadowRoot, we need to filter to get only element nodes
  const children =
    parent.children ||
    Array.from(parent.childNodes).filter(
      (node) => node.nodeType === Node.ELEMENT_NODE
    );

  if (!children || children.length === 0) return 1;

  let position = 0;
  let lastTag = null;
  let foundTarget = false;

  // Iterate through all child elements
  for (const child of children) {
    // Skip non-element nodes (shouldn't happen with .children, but safe for childNodes)
    if (child.nodeType !== Node.ELEMENT_NODE) continue;

    const childTag = child.tagName.toLowerCase();

    // Skip non-map elements
    if (!validTags.includes(childTag)) continue;

    // Check if we've reached our target element
    if (child === element) {
      foundTarget = true;

      // map-extent always needs a new z-index
      if (childTag === 'map-extent') {
        position++;
        return position;
      }

      // For map-tile and map-feature:
      // If this element continues a sequence of the same type, return the current z-index
      if (lastTag === childTag) {
        return position;
      }

      // This element starts a new layer group
      position++;
      return position;
    }

    // Before reaching target, count layer group transitions
    if (!foundTarget) {
      if (childTag === 'map-extent') {
        // Each map-extent increments z-index
        position++;
      } else if (lastTag !== null && lastTag !== childTag) {
        // Transition between different types (excluding map-extent)
        position++;
      } else if (lastTag === null) {
        // First valid element starts at z-index 1
        position = 1;
      }

      lastTag = childTag;
    }
  }
  // Element not found (shouldn't happen in normal usage)
  return 0;
}
