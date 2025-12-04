document.addEventListener('DOMContentLoaded', function() {
  const captureBtn = document.getElementById('captureBtn');
  const reloadBtn = document.getElementById('reloadBtn');
  const promptInput = document.getElementById('promptInput');
  const resultsDiv = document.getElementById('results');
  const imageContainer = document.getElementById('imageContainer');
  const fullscreenImage = document.getElementById('fullscreenImage');
  const enlargedImage = document.getElementById('enlargedImage');
  const closeFullscreen = document.getElementById('closeFullscreen');
  const copyImageBtn = document.getElementById('copyImage');
  const copyResultsBtn = document.getElementById('copyResults');
  
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

  // Reload current inspected page
  reloadBtn.addEventListener('click', function() {
    resultsDiv.textContent = 'Reloading page...';
    chrome.devtools.inspectedWindow.reload({ ignoreCache: true });
  });

  // Copy the displayed image to clipboard
  if (copyImageBtn) {
    copyImageBtn.addEventListener('click', async function() {
      try {
        const img = imageContainer.querySelector('img');
        if (!img || !img.src) return;

        const res = await fetch(img.src);
        const blob = await res.blob();
        const item = new ClipboardItem({ [blob.type || 'image/png']: blob });
        await navigator.clipboard.write([item]);
      } catch (err) {
        console.error('Copy image failed:', err);
      }
    });
  }

  // Copy the results text to clipboard
  if (copyResultsBtn) {
    copyResultsBtn.addEventListener('click', async function() {
      try {
        const text = resultsDiv.innerText || resultsDiv.textContent || '';
        if (!text) return;
        await navigator.clipboard.writeText(text);
      } catch (err) {
        console.error('Copy results failed:', err);
      }
    });
  }
});