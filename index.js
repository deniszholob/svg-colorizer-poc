import { colorizeSVG } from "./util/colorizer.js";
import { makeSVGIdsUnique } from "./util/unique-svg-id.util.js";

/** Colorize the copied SVG with the new color */
function updateColor() {
  const newColor = colorPicker.value;
  colorizeSVG(copiedSvg, newColor);
}

// ========================================================================== //

const colorPicker = document.getElementById("input_color");
colorPicker.addEventListener("change", updateColor);

const svgElement = document.querySelector("svg");
const copiedSvg = svgElement.cloneNode(true);
makeSVGIdsUnique(copiedSvg);
svgElement.parentNode.appendChild(copiedSvg);

updateColor();
