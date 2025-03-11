// Keep track of tabs where content script is loaded
const injectedTabs = new Set();

// Function to inject the content script into the active tab
async function injectStickyNote(tabId) {
    // Don't try to inject if we don't have a valid tab ID
    if (!tabId || tabId <= 0) {
        console.log('Invalid tab ID:', tabId);
        return;
    }

    // Check if the tab has a supported URL
    try {
        const tab = await chrome.tabs.get(tabId);

        // Skip injection for chrome:// pages, about:, and other restricted URLs
        if (!tab.url ||
            tab.url.startsWith('chrome://') ||
            tab.url.startsWith('about:') ||
            tab.url.startsWith('chrome-extension://') ||
            tab.url.startsWith('data:') ||
            tab.url === '') {
            console.log('Skipping injection on restricted or empty URL:', tab.url);
            return;
        }

        // If we've already injected into this tab, don't do it again
        if (injectedTabs.has(tabId)) {
            console.log('Content script already injected in tab', tabId);
            return;
        }

        // Try to inject the content script
        console.log('Injecting content script into tab', tabId);

        try {
            await chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['content.js']
            });

            await chrome.scripting.insertCSS({
                target: { tabId: tabId },
                files: ['styles.css']
            });

            // Mark this tab as injected
            injectedTabs.add(tabId);
            console.log('Content script successfully injected in tab', tabId);
        } catch (injectError) {
            console.error('Error during script injection:', injectError);
            // If injection fails, don't mark tab as injected
        }
    } catch (error) {
        console.error('Error accessing tab information:', error);
    }
}

// When a tab is closed, remove it from our tracking
chrome.tabs.onRemoved.addListener((tabId) => {
    if (injectedTabs.has(tabId)) {
        injectedTabs.delete(tabId);
        console.log('Removed tab from injection tracking:', tabId);
    }
});

// Try to toggle note on extension click
chrome.action.onClicked.addListener(async (tab) => {
    // Don't attempt to toggle on restricted URLs
    if (!tab.url ||
        tab.url.startsWith('chrome://') ||
        tab.url.startsWith('about:') ||
        tab.url.startsWith('chrome-extension://') ||
        tab.url.startsWith('data:') ||
        tab.url === '') {
        console.log('Cannot toggle on restricted URL:', tab.url);
        return;
    }

    // First make sure we've injected into this tab
    if (!injectedTabs.has(tab.id)) {
        try {
            await injectStickyNote(tab.id);
            // Give it time to initialize
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            console.error('Error injecting before toggle:', error);
            return;
        }
    }

    // Now try to toggle
    try {
        await chrome.tabs.sendMessage(tab.id, { action: "toggle" });
        console.log('Successfully toggled sticky note');
    } catch (error) {
        console.error('Error toggling sticky note:', error);

        // If toggling failed, try re-injecting and toggling after a longer delay
        try {
            // Force re-injection
            injectedTabs.delete(tab.id);
            await injectStickyNote(tab.id);

            // Wait a bit longer
            setTimeout(async () => {
                try {
                    await chrome.tabs.sendMessage(tab.id, { action: "toggle" });
                    console.log('Successfully toggled sticky note after re-injection');
                } catch (retryError) {
                    console.error('Failed to toggle even after re-injection:', retryError);
                }
            }, 1000);
        } catch (reinjectionError) {
            console.error('Error during re-injection attempt:', reinjectionError);
        }
    }
}); 