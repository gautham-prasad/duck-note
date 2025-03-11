# Duck Note Chrome Extension

A simple Chrome extension that adds a persistent floating sticky note to your browser. The note content is synced across all tabs and persists between browser sessions.

## Features

- Floating duck note that appears on all websites
- Drag and drop functionality for repositioning
- Collapsible interface to minimize when not in use
- Persistent notes across tabs and browser sessions
- Lightweight and non-intrusive design

## Installation

1. Download or clone this repository to your computer
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" by clicking the toggle switch in the top-right corner
4. Click "Load unpacked" and select the directory containing this extension
5. The duck note will now appear when you click the extension icon

## Usage

- **Move the note**: Click and drag the yellow header
- **Edit the note**: Click on the text area and start typing
- **Collapse/Expand**: Click the "_" button in the header to toggle visibility
- **Your notes are automatically saved** as you type and will be available in all tabs

## Files

- `manifest.json`: Extension configuration
- `content.js`: Main functionality for the duck note
- `styles.css`: Styling for the duck note
- `background.js`: Background script for extension functionality

## License

MIT 