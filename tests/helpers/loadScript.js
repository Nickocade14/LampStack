const fs = require("fs");
const path = require("path");

// Loads a plain browser script (no modules) into the jsdom window,
// the same way a <script> tag does, so its top-level functions become globals.
function loadScript(relativePath) {
  const source = fs.readFileSync(path.join(__dirname, "..", "..", relativePath), "utf8");
  const script = document.createElement("script");
  script.textContent = source;
  document.head.appendChild(script);
}

module.exports = { loadScript };
