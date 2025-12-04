# README for Chrome Extension: Passive Web Learning Tool

## Overview

This Google Chrome extension adds a new tab inside Chrome DevTools, designed to passively learn the contents of web pages and responses. This extension can be used for various use cases, such as answering quizzes or retrieving information without leaving the current browser tab. The extension interfaces with OpenAI's API to process content, offering a seamless user experience for enhancing browsing productivity.

## Features

* **DevTools Tab Integration**: The extension adds a new tab in Chrome DevTools, where it processes web content and responses.
* **Passive Learning**: The extension learns from the contents of the current web page without interrupting the user’s workflow. This can be used for tasks such as answering quizzes or retrieving information while staying within the same tab.
* **Customizable Prompt**: Users can set a custom prompt via the extension's popup interface, tailoring the learning process based on their needs.
* **Local Storage Integration**: API responses and user preferences are saved in the browser’s local storage for persistence across sessions.

## Dependencies

* **OpenAI API**: The extension interacts with OpenAI's API to process and analyze the web content. Ensure you have an API key set up for integration.
* **Local Storage**: Information about user preferences and API responses are saved in the browser’s local storage for future reference.
* **Popup Interface**: The extension includes a popup interface where users can configure their custom prompt and interact with the learning tool.

## Installation Instructions

1. Clone or download the repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" in the top right corner.
4. Click "Load unpacked" and select the folder containing the extension files.
5. The extension will be installed and the new tab will be added to Chrome DevTools.

## Usage

* After installation, open Chrome DevTools (Right-click → Inspect or press `Ctrl + Shift + I` on Windows/Linux or `Cmd + Option + I` on macOS).
* A new tab will appear in the DevTools window where the extension operates.
* You can interact with the extension via the popup to set a custom prompt.
* The extension will begin processing the web content in the active tab and provide insights or answers based on the current page.

## Customizing the Prompt

* Click the extension icon in the Chrome toolbar to open the popup.
* Enter a custom prompt that the extension will use to interact with the OpenAI API.
* The prompt is stored in local storage, so it persists even after you close the browser.

## Contributing
- We welcome contributions to improve the extension. Please fork the repository, make your changes, and submit a pull request with a clear description of what was changed and why.

## License
- This project is open source. Feel free to modify, distribute, and use it for your own purposes.
- For any issues or questions, please open an issue in the repository.
