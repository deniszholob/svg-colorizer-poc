const repoOwner = "PKief";
const repoName = "vscode-material-icon-theme";
const folderPath = "icons";
const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${folderPath}`;
const svgSize = 128;

// ========================================================================== //
// ============================== API Data ================================== //
// ========================================================================== //
/**
 * @typedef {Object} GitHubFile
 * @property {string} name - The name of the file.
 * @property {string} type - The type of the file (e.g., "file").
 * @property {string} download_url - The URL to download the file.
 */

/** Fetches data from the specified URL.
 * @param {string} url - The URL to fetch data from.
 * @param {string} [dataType="json"] - The type of data to fetch ("json" or "text").
 * @returns {Promise<any>} - A promise that resolves with the fetched data.
 */
function fetchData(url, dataType = "json") {
    return fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return dataType === "json" ? response.json() : response.text();
      })
      .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
      });
}

/** Displays icons in the specified list.
 * @param {GitHubFile[]} data - The data containing file information.
 */
function displayIcons(data) {
  const svg_container = document.getElementById("svg_container");

  data.forEach(item => {
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
  listItem.className = "flex items-center gap-4";

  const svgUrl = item.download_url;

  const svgElement = createSvgElement();
  const copySvgElement = createSvgElement();


  fetchData(svgUrl, "text")
    .then(svgContent => {
        svgElement.id = `${item.name}_original`
        svgElement.innerHTML = svgContent;
        copySvgElement.id = `${item.name}_copy`
        copySvgElement.innerHTML = svgContent;

        const newColor = colorPicker.value;
        colorizeSVG(copySvgElement, newColor);
    });

  const spanElement = document.createElement('span');
  spanElement.className = "text-white";

  const textElement = document.createTextNode(item.name);
  spanElement.appendChild(textElement);

  listItem.appendChild(svgElement);
  listItem.appendChild(copySvgElement);
  listItem.appendChild(spanElement);

  return listItem;
}

/** Creates an SVG element for the specified SVG URL.
 * @returns {SVGElement} - The created SVG element.
 */
function createSvgElement() {
  const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svgElement.setAttribute("width", svgSize);
  svgElement.setAttribute("height", svgSize);
  return svgElement;
}

// ========================================================================== //
// ============================ SVG Colorizer =============================== //
// ========================================================================== //

/** Function to convert hex color to RGB.
 * @param {string} hex - The hex color code.
 * @returns {Object} - The RGB object.
 */
function hexToRgb(hex) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function (m, r, g, b) {
    return r + r + g + g + b + b;
  });

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/** Function to convert RGB to HSL.
 * @param {number} r - The red value.
 * @param {number} g - The green value.
 * @param {number} b - The blue value.
 * @returns {Array} - The HSL array.
 */
function rgbToHsl(r, g, b) {
  (r /= 255), (g /= 255), (b /= 255);
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [h * 360, s, l];
}

/** Function to convert HSL to RGB.
 * @param {number} h - The hue value.
 * @param {number} s - The saturation value.
 * @param {number} l - The lightness value.
 * @returns {Array} - The RGB array.
 */
function hslToRgb(h, s, l) {
  let r, g, b;
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/** Function to parse rgb() string to object.
 * @param {string} color - The rgb color string.
 * @returns {Object} - The RGB object.
 */
function parseRgb(color) {
  const match = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (match) {
    return {
      r: parseInt(match[1]),
      g: parseInt(match[2]),
      b: parseInt(match[3]),
    };
  }
  return null;
}

/** Function to calculate the hue angle between two colors.
 * @param {Object} currentColor - The current color object.
 * @param {Object} targetColor - The target color object.
 * @returns {number} - The hue angle.
 */
function calculateHueAngle(currentColor, targetColor) {
  const currentHSL = rgbToHsl(currentColor.r, currentColor.g, currentColor.b);
  const targetHSL = rgbToHsl(targetColor.r, targetColor.g, targetColor.b);

  // Calculate hue difference in degrees
  let angle = targetHSL[0] - currentHSL[0];
  if (angle < 0) {
    angle += 360;
  }
  return angle;
}

/** Function to adjust hue while preserving saturation and lightness.
 * @param {Object} currentColor - The current color object.
 * @param {number} angle - The hue angle.
 * @returns {Object} - The adjusted color object.
 */
function adjustHue(currentColor, angle) {
  // Convert RGB to HSL
  const [h, s, l] = rgbToHsl(currentColor.r, currentColor.g, currentColor.b);

  // Adjust hue for each component while preserving shade
  const newHue = (h + angle) % 360;

  // Convert back to RGB
  const [newR, newG, newB] = hslToRgb(newHue / 360, s, l);

  return { r: newR, g: newG, b: newB };
}

/** Function to colorize an entire SVG with the target color.
 * @param {SVGElement} svgElement - The SVG element to colorize.
 * @param {string} targetColor - The target color to apply.
 */
function colorizeSVG(svgElement, targetColor) {
  const elements = svgElement.querySelectorAll("*");

  // Convert target color to RGB
  const targetColorRGB = targetColor.startsWith("#")
    ? hexToRgb(targetColor)
    : parseRgb(targetColor);

  elements.forEach(function (element) {
    if (element instanceof SVGGraphicsElement) {
      let currentColor = element.style.fill;
      if (!currentColor) {
        currentColor = window.getComputedStyle(element).fill;
      }
      if (
        currentColor &&
        (currentColor.startsWith("#") || currentColor.startsWith("rgb"))
      ) {
        const currentColorRGB = currentColor.startsWith("#")
          ? hexToRgb(currentColor)
          : parseRgb(currentColor);
        const angle = calculateHueAngle(currentColorRGB, targetColorRGB);
        const newColor = adjustHue(currentColorRGB, angle);
        element.style.fill = `rgb(${newColor.r}, ${newColor.g}, ${newColor.b})`;
      }
    }
  });
}

// ========================================================================== //

/** Function to colorize an entire SVG with the target color.
 * @param {SVGElement} svgElement - The SVG element to colorize.
 * @param {string} targetColor - The target color to apply.
 */
function updateSvgColors(){
    const newColor = colorPicker.value;

    const copiedSvgs = svgContainer.querySelectorAll('svg[id*="_copy"]');

    copiedSvgs.forEach(function (copiedSvg) {
      colorizeSVG(copiedSvg, newColor);
    });
  }

// ========================================================================== //

const colorPicker = document.getElementById("input_color");
colorPicker.addEventListener("change", updateSvgColors );

const svgContainer = document.getElementById("svg_container");

// Fetch SVG icons and display them
fetchData(apiUrl)
  .then(data => {
    displayIcons(data);
  });

