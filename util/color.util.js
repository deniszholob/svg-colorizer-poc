/** Converts hex color to RGB.
 * @param {string} hex - The hex color code.
 * @returns {Object} - The RGB object.
 */
export function hexToRgb(hex) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => {
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

/** Converts RGB to HSL.
 * @param {number} r - The red value.
 * @param {number} g - The green value.
 * @param {number} b - The blue value.
 * @returns {Array} - The HSL array.
 */
export function rgbToHsl(r, g, b) {
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

/**
 * Converts Hue to RGB value
 * @param {number} p
 * @param {number} q
 * @param {number} t
 * @returns {number} - RGB value
 */
export function hue2rgb(p, q, t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

/** Converts HSL to RGB.
 * @param {number} h - The hue value.
 * @param {number} s - The saturation value.
 * @param {number} l - The lightness value.
 * @returns {Array} - The RGB array.
 */
export function hslToRgb(h, s, l) {
  let r, g, b;
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/** Parses rgb() string to object.
 * @param {string} color - The rgb color string.
 * @returns {Object} - The RGB object.
 */
export function parseRgb(color) {
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

/** Calculates the hue angle between two colors.
 * @param {Object} currentColor - The current color object.
 * @param {Object} targetColor - The target color object.
 * @returns {number} - The hue angle.
 */
export function calculateHueAngle(currentColor, targetColor) {
  const currentHSL = rgbToHsl(currentColor.r, currentColor.g, currentColor.b);
  const targetHSL = rgbToHsl(targetColor.r, targetColor.g, targetColor.b);

  // Calculate hue difference in degrees
  let angle = targetHSL[0] - currentHSL[0];
  if (angle < 0) {
    angle += 360;
  }
  return angle;
}

/** Adjusts hue while preserving saturation and lightness.
 * @param {Object} currentColor - The current color object.
 * @param {number} angle - The hue angle.
 * @returns {Object} - The adjusted color object.
 */
export function adjustHue(currentColor, angle) {
  // Convert RGB to HSL
  const [h, s, l] = rgbToHsl(currentColor.r, currentColor.g, currentColor.b);

  // Adjust hue for each component while preserving shade
  const newHue = (h + angle) % 360;

  // Convert back to RGB
  const [newR, newG, newB] = hslToRgb(newHue / 360, s, l);

  return { r: newR, g: newG, b: newB };
}
