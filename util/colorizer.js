import {
  hexToRgb,
  parseRgb,
  calculateHueAngle,
  adjustHue,
} from "./color.util.js";

/** Colorizes an entire SVG with the target color.
 * @param {SVGElement} svgElement - The SVG element to colorize.
 * @param {string} targetColor - The target color to apply.
 */
export function colorizeSVG(svgElement, targetColor) {
  if (svgElement instanceof SVGGraphicsElement) {
    traverseAndColorize(svgElement, targetColor);
  }
}

/**
 * Calculates new color based on original and target color
 * @param {string} currentColor
 * @param {string} targetColor - The target color to apply.
 * @returns {string} - rgb string of the new color
 */
function calcNewColor(currentColor, targetColor) {
  if (
    currentColor &&
    (currentColor.startsWith("#") || currentColor.startsWith("rgb"))
  ) {
    const currentColorRGB = currentColor.startsWith("#")
      ? hexToRgb(currentColor)
      : parseRgb(currentColor);

    const targetColorRGB = targetColor.startsWith("#")
      ? hexToRgb(targetColor)
      : parseRgb(targetColor);

    const angle = calculateHueAngle(currentColorRGB, targetColorRGB);
    const newColor = adjustHue(currentColorRGB, angle);
    const rgbString = `rgb(${newColor.r}, ${newColor.g}, ${newColor.b})`;
    return rgbString;
  }
  return null;
}

/** Traverse all child elements recursively to colorize
 * @param {Element} element - The SVG element to colorize.
 * @param {string} targetColor - The target color to apply.
 */
function traverseAndColorize(element, targetColor) {
  let currentFillStyleColor = element.style.fill;
  let currentStrokeStyleColor = element.style.stroke;
  let currentFillColor = element.getAttribute("fill");
  let currentStrokeColor = element.getAttribute("stroke");
  let currentStopColor = element.getAttribute("stop-color");

  if (currentFillStyleColor && currentFillStyleColor !== "none") {
    const rgbString = calcNewColor(currentFillStyleColor, targetColor);
    if (rgbString) element.style.fill = rgbString;
  }
  if (currentStrokeStyleColor) {
    const rgbString = calcNewColor(currentStrokeStyleColor, targetColor);
    if (rgbString) element.style.stroke = rgbString;
  }
  if (currentFillColor) {
    const rgbString = calcNewColor(currentFillColor, targetColor);
    if (rgbString) element.setAttribute("fill", rgbString);
  }
  if (currentStrokeColor) {
    const rgbString = calcNewColor(currentStrokeColor, targetColor);
    if (rgbString) element.setAttribute("stroke", rgbString);
  }
  if (currentStopColor) {
    const rgbString = calcNewColor(currentStopColor, targetColor);
    if (rgbString) element.setAttribute("stop-color", rgbString);
  }

  // Recursively traverse child elements
  const children = element.children;
  for (let i = 0; i < children.length; i++) {
    traverseAndColorize(children[i], targetColor);
  }
}
