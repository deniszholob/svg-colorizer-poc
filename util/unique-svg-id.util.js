/**
 * Replaces all the id's in the svg to unique id's to avoid id conflicts
 * @param {SVGElement} svgElement
 */
export function makeSVGIdsUnique(svgElement) {
  const idMap = new Map();

  /**
   * @returns {string} unique id string
   */
  function generateGUID() {
    // Simple function to generate a GUID
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0,
          v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  /**
   * @param {Element} element
   */
  function traverseAndReplaceIds(element) {
    if (element.id) {
      const originalId = element.id;
      const newId = originalId + "-" + generateGUID();
      idMap.set(originalId, newId);
      element.id = newId;
    }

    const children = element.children;
    for (let i = 0; i < children.length; i++) {
      traverseAndReplaceIds(children[i]);
    }
  }

  /**
   * @param {Element} element
   */
  function updateIdReferences(element) {
    const urlAttributes = ["fill", "stroke", "href", "style"];
    urlAttributes.forEach((attr) => {
      let value = element.getAttribute(attr);
      if (value) {
        for (const [originalId, newId] of idMap.entries()) {
          const regex = new RegExp(`url\\(#${originalId}\\)`, "g");
          if (value.match(regex)) {
            value = value.replace(regex, `url(#${newId})`);
            break;
          }
        }
        element.setAttribute(attr, value);
      }
    });

    const hashAttributes = ["xlink:href"];
    hashAttributes.forEach((attr) => {
      let value = element.getAttribute(attr);
      if (value) {
        for (const [originalId, newId] of idMap.entries()) {
          const xlinkRegex = new RegExp(`#${originalId}`, "g");
          if (value.match(xlinkRegex)) {
            value = value.replace(xlinkRegex, `#${newId}`);
            break;
          }
        }
        element.setAttribute(attr, value);
      }
    });

    const children = element.children;
    for (let i = 0; i < children.length; i++) {
      updateIdReferences(children[i]);
    }
  }

  traverseAndReplaceIds(svgElement);
  updateIdReferences(svgElement);
}
