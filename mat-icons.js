import { fetchData } from "./util/http.util.js";
import { makeSVGIdsUnique } from "./util/unique-svg-id.util.js";
import { colorizeSVG } from "./util/colorizer.js";

const repoOwner = "PKief";
const repoName = "vscode-material-icon-theme";
const folderPath = "icons";
const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${folderPath}`;
const svgSize = 128;

/**
 * @typedef {Object} GitHubFile
 * @property {string} name - The name of the file.
 * @property {string} type - The type of the file (e.g., "file").
 * @property {string} download_url - The URL to download the file.
 */

/** Displays icons in the specified list.
 * @param {GitHubFile[]} data - The data containing file information.
 */
function displayIcons(data) {
  const svg_container = document.getElementById("svg_container");

  data.forEach((item) => {
    if (item.type === "file" && item.name.endsWith(".svg")) {
      const listItem = createListItem(item);
      svg_container.appendChild(listItem);
    }
  });
}

/** Creates a list item for the specified file.
 * @param {GitHubFile} item - The file information.
 * @returns {HTMLLIElement} - The created list item element.
 */
function createListItem(item) {
  const listItem = document.createElement("li");
  listItem.className = "flex items-center gap-8";

  const tag = item.name.replace(".svg", "");
  listItem.id = tag;

  const svgUrl = item.download_url;

  const svgElement = createSvgElement();
  const copySvgElement = createSvgElement();

  fetchData(svgUrl, "text").then((svgContent) => {
    svgElement.innerHTML = svgContent;
    copySvgElement.innerHTML = svgContent;

    makeSVGIdsUnique(svgElement);
    makeSVGIdsUnique(copySvgElement);

    svgElement.id = `${item.name}_original`;
    copySvgElement.id = `${item.name}_copy`;

    const newColor = colorPicker.value;
    colorizeSVG(copySvgElement, newColor);
  });

  const anchorElement = document.createElement("a");
  anchorElement.className = "text-blue-500 hover:text-blue-300";
  anchorElement.href = svgUrl;
  anchorElement.innerHTML = item.name;
  anchorElement.target = "_blank";

  const tagElement = document.createElement("a");
  tagElement.className = "text-blue-500 hover:text-blue-300";
  tagElement.href = `#${tag}`;
  tagElement.innerHTML = `<i class="fa fa-link"></i>`;

  listItem.appendChild(tagElement);
  listItem.appendChild(svgElement);
  listItem.appendChild(copySvgElement);
  listItem.appendChild(anchorElement);

  return listItem;
}

/** Creates an SVG element for the specified SVG URL.
 * @returns {SVGElement} - The created SVG element.
 */
function createSvgElement() {
  const svgElement = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );
  svgElement.setAttribute("width", svgSize);
  svgElement.setAttribute("height", svgSize);
  return svgElement;
}

// ========================================================================== //

/** Updates all the copied svgs with selected color */
function updateSvgColors() {
  const newColor = colorPicker.value;

  const copiedSvgs = svgContainer.querySelectorAll('svg[id*="_copy"]');

  copiedSvgs.forEach(function (copiedSvg) {
    colorizeSVG(copiedSvg, newColor);
  });
}

// ========================================================================== //

const colorPicker = document.getElementById("input_color");
colorPicker.addEventListener("change", updateSvgColors);

const svgContainer = document.getElementById("svg_container");

// Fetch SVG icons and display them
fetchData(apiUrl).then((data) => {
  displayIcons(data);
});
