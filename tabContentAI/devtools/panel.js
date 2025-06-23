document.addEventListener('DOMContentLoaded', function() {
  const captureBtn = document.getElementById('captureBtn');
  const promptInput = document.getElementById('promptInput');
  const resultsDiv = document.getElementById('results');
  const imageContainer = document.getElementById('imageContainer');
  const fullscreenImage = document.getElementById('fullscreenImage');
  const enlargedImage = document.getElementById('enlargedImage');
  const closeFullscreen = document.getElementById('closeFullscreen');
  
  // Connect to the background script
  const backgroundPageConnection = chrome.runtime.connect({
    name: "panel-" + chrome.devtools.inspectedWindow.tabId
  });

  // Handle messages from the background script
  backgroundPageConnection.onMessage.addListener(function(message) {
    if (message.type === 'processing-result') {
      // Clear previous content
      imageContainer.innerHTML = '';
      resultsDiv.innerHTML = '';
      
      // Display thumbnail if available
      if (message.imageUrl) {
        const thumbnail = document.createElement('img');
        thumbnail.id = 'thumbnail';
        thumbnail.src = message.imageUrl;
        thumbnail.alt = 'Captured screenshot';
        thumbnail.addEventListener('click', () => {
          enlargedImage.src = message.imageUrl;
          fullscreenImage.style.display = 'flex';
        });
        imageContainer.appendChild(thumbnail);
      }
      
      // Display results
      const resultContent = document.createElement('div');
      resultContent.className = 'result-content';
      resultContent.textContent = message.data;
      resultsDiv.appendChild(resultContent);
    } 
    else if (message.type === 'error') {
      resultsDiv.textContent = `Error: ${message.data}`;
    } 
    else if (message.type === 'processing') {
      resultsDiv.textContent = 'Processing image and text...';
    }
    else if (message.type === 'capturing') {
      resultsDiv.textContent = 'Capturing screen...';
    }
  });

  // Close fullscreen image
  closeFullscreen.addEventListener('click', () => {
    fullscreenImage.style.display = 'none';
  });

  // Send capture command
  captureBtn.addEventListener('click', function() {
    const prompt = promptInput.value.trim();
    resultsDiv.textContent = 'Starting processing...';
    imageContainer.innerHTML = '';
    
    backgroundPageConnection.postMessage({
      type: 'capture-and-process',
      tabId: chrome.devtools.inspectedWindow.tabId,
      prompt: prompt || undefined
    });
  });
});