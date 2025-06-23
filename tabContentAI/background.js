// Store connections by tabId
const connections = {};

// Handle connections from DevTools panels
chrome.runtime.onConnect.addListener(function(port) {
  if (port.name.startsWith("panel-")) {
    const tabId = port.name.replace("panel-", "");
    
    // Store the connection
    connections[tabId] = port;
    
    // Remove connection when panel closes
    port.onDisconnect.addListener(function() {
      delete connections[tabId];
    });
    
    // Listen for messages from the panel
    port.onMessage.addListener(function(message) {
      if (message.type === 'capture-and-process') {
        processTab(tabId, message.prompt);
      }
    });
  }
});

// Process the current tab
async function processTab(tabId, prompt) {
  const connection = connections[tabId];
  if (!connection) {
    console.error('No connection found for tabId:', tabId);
    return;
  }
  
  try {
    // Notify panel that we're capturing the screen
    connection.postMessage({ type: 'capturing' });
    
    // Get saved settings from storage
    const { apiKey, prompt: defaultPrompt, model } = await chrome.storage.sync.get(['apiKey', 'prompt', 'model']);
    if (!apiKey) {
      throw new Error('OpenAI API key not set. Please configure in the extension popup.');
    }
    
    // Use custom prompt if provided, otherwise use saved prompt
    const finalPrompt = prompt || defaultPrompt || "Analyze this image and provide insights:";
    
    // Get the active tab
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tabs.length) {
      throw new Error('No active tab found');
    }
    const tab = tabs[0];
    
    // Execute a dummy script to ensure we have permissions
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {}
      });
    } catch (e) {
      console.log('Dummy script execution (for permissions)');
    }
    
    // Capture visible tab as PNG
    let dataUrl;
    try {
      dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' });
      if (!dataUrl) {
        throw new Error('Failed to capture tab');
      }
    } catch (captureError) {
      throw new Error('Failed to capture tab: ' + captureError.message);
    }
    
    // Notify panel that we're processing with OpenAI
    connection.postMessage({ type: 'processing' });
    
    // Convert data URL to blob for API
    let blob;
    try {
      const response = await fetch(dataUrl);
      blob = await response.blob();
    } catch (blobError) {
      throw new Error('Failed to process image: ' + blobError.message);
    }
    
    // Call OpenAI API
    const visionResponse = await callOpenAIVisionAPI(blob, finalPrompt, apiKey, model);
    
    // Send result to panel with image URL
    connection.postMessage({
      type: 'processing-result',
      data: visionResponse,
      imageUrl: dataUrl
    });
    
  } catch (error) {
    console.error('Error processing tab:', error);
    if (connection) {
      connection.postMessage({
        type: 'error',
        data: error.message
      });
    }
  }
}

// Call OpenAI's Vision API
async function callOpenAIVisionAPI(imageBlob, prompt, apiKey, model = 'gpt-4-vision-preview') {
  // Validate model supports vision
  const visionModels = ['gpt-4-vision-preview', 'gpt-4-turbo'];
  if (!visionModels.includes(model)) {
    throw new Error(`Model ${model} doesn't support image processing. Please use gpt-4-vision-preview or gpt-4-turbo.`);
  }

  // Convert blob to base64
  const base64Image = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(imageBlob);
  });
  
  const messages = [
    {
      role: "user",
      content: [
        { type: "text", text: prompt },
        { 
          type: "image_url", 
          image_url: { 
            url: `data:image/png;base64,${base64Image}`,
            detail: "auto"
          }
        }
      ]
    }
  ];
  
  const requestBody = {
    model: model,
    messages: messages,
    max_tokens: 1000
  };
  
  let response;
  try {
    response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices[0]?.message?.content || 'No response content from OpenAI';
    
  } catch (apiError) {
    console.error('OpenAI API error:', apiError);
    throw new Error(`OpenAI API error: ${apiError.message}`);
  }
}

// Handle messages from other parts of the extension
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type === 'test-connection') {
    sendResponse({ success: true });
  }
  return true; // Required for async response
});