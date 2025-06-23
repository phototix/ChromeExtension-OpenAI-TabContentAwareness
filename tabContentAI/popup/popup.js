document.addEventListener('DOMContentLoaded', function() {
  const apiKeyInput = document.getElementById('apiKey');
  const promptInput = document.getElementById('prompt');
  const modelSelect = document.getElementById('model');
  const saveButton = document.getElementById('save');
  const statusDiv = document.getElementById('status');

  // Load saved settings
  chrome.storage.sync.get(['apiKey', 'prompt', 'model'], function(data) {
    if (data.apiKey) apiKeyInput.value = data.apiKey;
    if (data.prompt) promptInput.value = data.prompt;
    if (data.model) modelSelect.value = data.model;
  });

  // Save settings
  saveButton.addEventListener('click', function() {
    const apiKey = apiKeyInput.value.trim();
    const prompt = promptInput.value.trim();
    const model = modelSelect.value;

    if (!apiKey) {
      statusDiv.textContent = 'API Key is required';
      return;
    }

    chrome.storage.sync.set({ apiKey, prompt, model }, function() {
      statusDiv.textContent = 'Settings saved!';
      setTimeout(() => statusDiv.textContent = '', 2000);
    });
  });
});