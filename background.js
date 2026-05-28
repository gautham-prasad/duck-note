// Helper to check if content script is loaded by sending a ping message
async function isContentScriptLoaded(tabId) {
    try {
        const response = await chrome.tabs.sendMessage(tabId, { action: "ping" });
        return response && response.status === "ok";
    } catch (error) {
        // "Could not establish connection. Receiving end does not exist" is expected if not injected
        return false;
    }
}

// Function to inject the content script and styles into the active tab
async function injectStickyNote(tabId) {
    if (!tabId || tabId <= 0) return;

    try {
        const tab = await chrome.tabs.get(tabId);

        // Skip injection for restricted URLs
        if (!tab.url ||
            tab.url.startsWith('chrome://') ||
            tab.url.startsWith('about:') ||
            tab.url.startsWith('chrome-extension://') ||
            tab.url.startsWith('data:') ||
            tab.url === '') {
            console.log('Skipping injection on restricted URL:', tab.url);
            return;
        }

        // Try to check if already injected
        const loaded = await isContentScriptLoaded(tabId);
        if (loaded) {
            console.log('Content script already injected in tab', tabId);
            return;
        }

        console.log('Injecting content script and styles into tab', tabId);
        
        await chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
        });

        await chrome.scripting.insertCSS({
            target: { tabId: tabId },
            files: ['styles.css']
        });
        
        console.log('Content script successfully injected in tab', tabId);
    } catch (error) {
        console.error('Error during script/style injection:', error);
    }
}

// Toggle note visibility or inject on action click
chrome.action.onClicked.addListener(async (tab) => {
    if (!tab || !tab.id) return;

    // Skip restricted URLs
    if (!tab.url ||
        tab.url.startsWith('chrome://') ||
        tab.url.startsWith('about:') ||
        tab.url.startsWith('chrome-extension://') ||
        tab.url.startsWith('data:') ||
        tab.url === '') {
        console.log('Cannot toggle on restricted URL:', tab.url);
        return;
    }

    try {
        // Ensure content script and styles are injected
        await injectStickyNote(tab.id);

        // Send the toggle message to the content script
        const response = await chrome.tabs.sendMessage(tab.id, { action: "toggle" });
        console.log('Successfully sent toggle command. Response:', response);
    } catch (error) {
        console.error('Failed to toggle sticky note:', error);
    }
});