const fs = require('fs');

let cssCode = fs.readFileSync('frontend/src/index.css', 'utf8');

// 1. Update body background
const oldBodyStart = `body {
  font-family: 'Inter', 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background-color: var(--bg-color);`;

const newBodyStart = `body {
  font-family: 'Inter', 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background: radial-gradient(circle at top left, var(--secondary-bg-color) 0%, var(--bg-color) 60%);
  background-attachment: fixed;`;

if (cssCode.includes(oldBodyStart)) {
  cssCode = cssCode.replace(oldBodyStart, newBodyStart);
}

// 2. Update button
const oldButtonStart = `button {
  background-color: var(--button-color);`;

const newButtonStart = `button {
  background-color: color-mix(in srgb, var(--button-color) 85%, transparent);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);`;

if (cssCode.includes(oldButtonStart)) {
  cssCode = cssCode.replace(oldButtonStart, newButtonStart);
}

// 3. Update .card
const oldCardStart = `.card {
  background-color: var(--card-bg-color);`;

const newCardStart = `.card {
  background-color: color-mix(in srgb, var(--card-bg-color) 75%, transparent);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);`;

if (cssCode.includes(oldCardStart)) {
  cssCode = cssCode.replace(oldCardStart, newCardStart);
}

fs.writeFileSync('frontend/src/index.css', cssCode);
console.log("Updated index.css");
