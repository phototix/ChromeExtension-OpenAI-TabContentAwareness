// Create a new panel in the DevTools
chrome.devtools.panels.create(
  "ContentAI",                  // Panel title
  "icons/icon48.png",           // Icon
  "devtools/panel.html",        // Panel HTML file
  function(panel) {
    console.log("ContentAI panel created");
  }
);