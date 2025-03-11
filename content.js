// Global flag to track if we've already initialized
// Use window property instead of let to avoid duplicate declaration errors
if (typeof window.duckNoteInitialized === 'undefined') {
    window.duckNoteInitialized = false;

    // Check if we're on a valid page (not chrome:// or other restricted URLs)
    if (!window.location.protocol.startsWith('chrome') &&
        !window.location.protocol.startsWith('about') &&
        !window.location.protocol.startsWith('data')) {

        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initOnce);
        } else {
            // Small delay to ensure the page is ready
            setTimeout(initOnce, 100);
        }
    }
}

// Global variables to access across functions
let container, note, header, textarea, toggleBtn, closeBtn;
let mouseMoveHandler, mouseUpHandler, touchStartHandler, touchMoveHandler, touchEndHandler;

// Only initialize once
function initOnce() {
    if (window.duckNoteInitialized) return;

    try {
        initializeStickyNote();
        window.duckNoteInitialized = true;
        console.log("Duck Note: Successfully initialized");
    } catch (error) {
        console.error("Duck Note: Initialization failed", error);
    }
}

function initializeStickyNote() {
    console.log("Duck Note: Initializing");

    // Clean up any existing notes first
    const existingContainer = document.getElementById('sticky-note-container');
    if (existingContainer) {
        try {
            existingContainer.parentNode.removeChild(existingContainer);
            console.log("Duck Note: Removed existing note");
        } catch (e) {
            console.error("Failed to remove existing note:", e);
        }
    }

    // Create the container
    container = document.createElement('div');
    container.id = 'sticky-note-container';

    // Set container styles directly
    Object.assign(container.style, {
        all: 'initial',
        position: 'absolute',
        top: '0',
        left: '0',
        zIndex: '2147483647', // Maximum z-index
        width: '0',
        height: '0',
        margin: '0',
        padding: '0',
        border: 'none',
        background: 'transparent',
        pointerEvents: 'none'
    });

    // Create note container
    note = document.createElement('div');
    note.id = 'floating-note';

    // Set HTML content with duck icon
    note.innerHTML = `
      <div id="duck-container">
        <img id="duck-icon" src="${chrome.runtime.getURL('icon.png')}" alt="Duck Icon">
      </div>
      <div id="note-bubble">
        <div id="note-header">
          Duck Note
          <div class="note-controls">
            <span id="toggle-btn">_</span>
            <span id="close-btn">×</span>
          </div>
        </div>
        <textarea id="note-content" placeholder="Type your note here..."></textarea>
      </div>
    `;

    // Initially hide the note to prevent flicker
    note.style.display = 'none';

    // Add note to container, then add container to body
    container.appendChild(note);
    document.body.appendChild(container);

    console.log("Duck Note: Note created and appended");

    // Get references to elements
    const duckContainer = document.getElementById('duck-container');
    const duckIcon = document.getElementById('duck-icon');
    const noteBubble = document.getElementById('note-bubble');
    header = document.getElementById('note-header');
    textarea = document.getElementById('note-content');
    toggleBtn = document.getElementById('toggle-btn');
    closeBtn = document.getElementById('close-btn');

    // Note pointerEvents to auto so it can be interacted with
    note.style.pointerEvents = 'auto';

    // Track toggle state explicitly with a variable
    let isNoteVisible = true; // Default to visible

    // Function to update UI based on toggle state
    function updateToggleUI() {
        // Update UI based on current toggle state
        if (isNoteVisible) {
            noteBubble.style.display = 'block';
            toggleBtn.textContent = '_';
            console.log("Note shown - toggle state:", isNoteVisible);
        } else {
            noteBubble.style.display = 'none';
            toggleBtn.textContent = '▢';
            console.log("Note hidden - toggle state:", isNoteVisible);
        }

        // Save state to Chrome storage
        try {
            chrome.storage.sync.set({ noteVisible: isNoteVisible }, function () {
                console.log("Toggle state saved:", isNoteVisible);
            });
        } catch (e) {
            console.warn("Could not save visibility state:", e);
        }
    }

    // Toggle function that flips the state variable
    function toggleNote() {
        console.log("Toggle called, current state:", isNoteVisible);
        isNoteVisible = !isNoteVisible; // Flip the state
        updateToggleUI(); // Update UI based on new state
    }

    // Simple duck click handler - uses the toggle function
    duckIcon.onclick = function (event) {
        event.preventDefault();
        event.stopPropagation();
        console.log("Duck clicked!");
        toggleNote();
    };

    // Simple toggle button handler - uses the same toggle function
    toggleBtn.onclick = function (event) {
        event.preventDefault();
        event.stopPropagation();
        console.log("Toggle button clicked!");
        toggleNote();
    };

    // Position the note and load settings
    try {
        chrome.storage.sync.get(['notePositionX', 'notePositionY', 'noteVisible', 'stickyNote'], function (data) {
            // Load note position if available
            if (data.notePositionX !== undefined && data.notePositionY !== undefined) {
                note.style.left = data.notePositionX + 'px';
                note.style.top = data.notePositionY + 'px';
                note.style.right = 'auto';
                note.classList.add('manual-position');
                console.log("Duck Note: Position restored from storage");
            } else {
                // Default position in upper right corner
                note.style.top = '20px';
                note.style.right = '20px';
                console.log("Duck Note: Using default position");
            }

            // Load visibility state from storage - with explicit check
            if (data.noteVisible !== undefined) {
                isNoteVisible = data.noteVisible;
                console.log("Loaded visibility state:", isNoteVisible);
            }

            // Apply the loaded visibility state
            updateToggleUI();

            // Load note content
            if (data.stickyNote) {
                textarea.value = data.stickyNote;
            }

            // Show the note after loading settings
            note.style.display = 'flex';
        });
    } catch (e) {
        console.error("Failed to load note settings:", e);
        // Default fallback position
        note.style.top = '20px';
        note.style.right = '20px';
        note.style.display = 'flex';

        // Apply default visibility state
        updateToggleUI();
    }

    // Save note content on change
    textarea.addEventListener('input', () => {
        try {
            // Wrap in try-catch to handle possible connection errors
            try {
                chrome.storage.sync.set({ stickyNote: textarea.value });
            } catch (storageError) {
                console.warn("Could not save note content:", storageError);
            }
        } catch (e) {
            console.error("Error saving note content:", e);
        }
    });

    // IMPROVED DRAG AND DROP
    let isDragging = false;
    let offsetX, offsetY;
    let initialLeft, initialTop, dragStartX, dragStartY;

    function handleMouseDown(e) {
        // Skip if clicking on buttons or textarea
        if (e.target === toggleBtn || e.target === closeBtn || e.target === textarea) {
            return;
        }

        isDragging = true;

        // Calculate the offset from the pointer to the top-left of the note
        const rect = note.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;

        // Store initial position for potential calculations
        initialLeft = rect.left;
        initialTop = rect.top;
        dragStartX = e.clientX;
        dragStartY = e.clientY;

        // Visual feedback
        document.body.style.cursor = 'grabbing';
        note.classList.add('dragging');

        // Ensure the note is in manual position mode
        note.classList.add('manual-position');
        note.style.right = 'auto';

        e.preventDefault();
    }

    function handleMouseMove(e) {
        if (!isDragging) return;

        // Apply new position
        note.style.left = (e.clientX - offsetX) + 'px';
        note.style.top = (e.clientY - offsetY) + 'px';

        e.preventDefault();
    }

    function handleMouseUp() {
        if (!isDragging) return;

        isDragging = false;

        // Reset cursor and visual feedback
        document.body.style.cursor = '';
        note.classList.remove('dragging');

        // Save the position
        const rect = note.getBoundingClientRect();
        try {
            // Wrap in try-catch to handle possible connection errors
            try {
                chrome.storage.sync.set({
                    notePositionX: rect.left,
                    notePositionY: rect.top
                });
                console.log("Position saved:", rect.left, rect.top);
            } catch (storageError) {
                console.warn("Could not save position:", storageError);
            }
        } catch (e) {
            console.error("Failed to save position:", e);
        }
    }

    // Attach mouse events for dragging
    duckContainer.addEventListener('mousedown', handleMouseDown);
    header.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // Close function to completely remove the note
    function closeNote() {
        try {
            // Remove event listeners first (before elements become null)
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchmove', touchMoveHandler);
            document.removeEventListener('touchend', touchEndHandler);

            // Now remove element-specific event listeners with null checks
            if (header) {
                header.removeEventListener('mousedown', handleMouseDown);
                header.removeEventListener('touchstart', touchStartHandler);
            }

            if (duckContainer) {
                duckContainer.removeEventListener('mousedown', handleMouseDown);
                duckContainer.removeEventListener('touchstart', touchStartHandler);
            }

            // Remove the container from DOM
            if (container && container.parentNode) {
                container.parentNode.removeChild(container);
            }

            // Reset global variables
            container = null;
            note = null;
            header = null;
            textarea = null;
            toggleBtn = null;
            closeBtn = null;

            // Reset initialized flag so note can be recreated
            window.duckNoteInitialized = false;

            console.log("Duck Note: Note closed and removed");
        } catch (e) {
            console.error("Error closing note:", e);
        }
    }

    // Button event listeners - FIXED DUPLICATE ISSUE
    // NOTE: We now use direct onclick handlers instead of addEventListener
    closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeNote();
    });

    // Also handle touch events for mobile
    touchStartHandler = (e) => {
        // Skip if touching buttons or textarea
        if (e.target === toggleBtn || e.target === closeBtn || e.target === textarea) {
            return;
        }

        const touch = e.touches[0];
        isDragging = true;

        // Get current position
        const rect = note.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;

        // Calculate the offset from the pointer to the top-left of the note
        offsetX = touch.clientX - rect.left;
        offsetY = touch.clientY - rect.top;

        // Get touch start position
        dragStartX = touch.clientX;
        dragStartY = touch.clientY;

        // Visual feedback
        note.classList.add('dragging');
        header.style.cursor = 'grabbing';

        // Ensure the note is in manual position mode
        note.classList.add('manual-position');
        note.style.right = 'auto';

        // Prevent default to avoid scrolling
        e.preventDefault();
    };

    touchMoveHandler = (e) => {
        if (!isDragging) return;

        const touch = e.touches[0];

        // Apply new position directly using offset approach (more consistent with mouse behavior)
        note.style.left = (touch.clientX - offsetX) + 'px';
        note.style.top = (touch.clientY - offsetY) + 'px';

        // Prevent scrolling
        e.preventDefault();
    };

    touchEndHandler = (e) => {
        if (!isDragging) return;

        isDragging = false;

        // Reset cursor and visual feedback
        header.style.cursor = 'move';
        note.classList.remove('dragging');

        // Save the position
        const rect = note.getBoundingClientRect();
        try {
            // Wrap in try-catch to handle possible connection errors
            try {
                chrome.storage.sync.set({
                    notePositionX: rect.left,
                    notePositionY: rect.top
                });
                console.log("Position saved:", rect.left, rect.top);
            } catch (storageError) {
                console.warn("Could not save position:", storageError);
            }
        } catch (err) {
            console.error("Failed to save position:", err);
        }
    };

    // Add touch event listeners
    duckContainer.addEventListener('touchstart', touchStartHandler, { passive: false });
    header.addEventListener('touchstart', touchStartHandler, { passive: false });
    document.addEventListener('touchmove', touchMoveHandler, { passive: false });
    document.addEventListener('touchend', touchEndHandler);
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Duck Note: Received message", message);

    // Make sure we're initialized
    if (!window.duckNoteInitialized) {
        try {
            initOnce();
        } catch (error) {
            console.error("Failed to initialize on message:", error);
            sendResponse({ status: "error", message: "Failed to initialize" });
            return true;
        }
    }

    // Handle message actions
    if (message.action === "toggle") {
        try {
            // Find the elements again in case they were removed
            const noteBubble = document.getElementById('note-bubble');
            const toggleBtn = document.getElementById('toggle-btn');

            if (noteBubble && toggleBtn) {
                if (noteBubble.style.display === 'none') {
                    noteBubble.style.display = 'flex';
                    toggleBtn.textContent = '_';
                    chrome.storage.sync.set({ noteVisible: true });
                } else {
                    noteBubble.style.display = 'none';
                    toggleBtn.textContent = '▢';
                    chrome.storage.sync.set({ noteVisible: false });
                }
                sendResponse({ status: "ok" });
            } else {
                // Elements not found, try to re-initialize
                initOnce();
                sendResponse({ status: "reinitialized" });
            }
        } catch (e) {
            console.error("Error handling toggle message:", e);
            sendResponse({ status: "error", message: e.toString() });
        }
    } else if (message.action === "ping") {
        sendResponse({ status: "ok" });
    } else if (message.action === "close") {
        try {
            const container = document.getElementById('sticky-note-container');
            if (container && container.parentNode) {
                container.parentNode.removeChild(container);
            }

            // Clear all saved data
            chrome.storage.sync.remove(['notePositionX', 'notePositionY', 'noteVisible', 'stickyNote']);

            // Reset initialization flag
            window.duckNoteInitialized = false;

            sendResponse({ status: "ok" });
        } catch (e) {
            console.error("Error handling close message:", e);
            sendResponse({ status: "error", message: e.toString() });
        }
    }

    return true; // Keep message channel open for async response
}); 