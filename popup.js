// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    console.log("Popup loaded");

    // Get the toggle button
    const toggleButton = document.getElementById('toggle-button');
    const closeButton = document.getElementById('close-button');

    // Add click event listener for toggle button
    if (toggleButton) {
        toggleButton.addEventListener('click', async function () {
            console.log("Toggle button clicked");

            try {
                // Query for the active tab
                const tabs = await chrome.tabs.query({ active: true, currentWindow: true });

                if (!tabs || tabs.length === 0) {
                    console.error("No active tab found");
                    return;
                }

                const activeTab = tabs[0];

                // Check if we can inject the content script
                try {
                    // Try to send a message first
                    await chrome.tabs.sendMessage(activeTab.id, { action: "ping" });
                    // If successful, send the toggle message
                    await chrome.tabs.sendMessage(activeTab.id, { action: "toggle" });
                    console.log("Sent toggle message to tab", activeTab.id);
                } catch (error) {
                    // If the content script isn't loaded, inject it
                    console.log("Content script not found, injecting it now...");
                    await chrome.scripting.executeScript({
                        target: { tabId: activeTab.id },
                        files: ['content.js']
                    });
                    await chrome.scripting.insertCSS({
                        target: { tabId: activeTab.id },
                        files: ['styles.css']
                    });
                    // Now try to send the toggle message again
                    await chrome.tabs.sendMessage(activeTab.id, { action: "toggle" });
                    console.log("Content script injected and toggle message sent");
                }
            } catch (error) {
                console.error("Error:", error.message);
            }
        });
    } else {
        console.error('Toggle button not found in popup');
    }

    // Add click event listener for close button
    if (closeButton) {
        closeButton.addEventListener('click', async function () {
            console.log("Close button clicked");

            try {
                // Query for the active tab
                const tabs = await chrome.tabs.query({ active: true, currentWindow: true });

                if (!tabs || tabs.length === 0) {
                    console.error("No active tab found");
                    return;
                }

                const activeTab = tabs[0];

                // Try to send the close message
                try {
                    await chrome.tabs.sendMessage(activeTab.id, { action: "close" });
                    console.log("Sent close message to tab", activeTab.id);
                    window.close(); // Close the popup
                } catch (error) {
                    console.error("Error sending close message:", error.message);
                }
            } catch (error) {
                console.error("Error:", error.message);
            }
        });
    }
});