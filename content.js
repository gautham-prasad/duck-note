(function () {
    // Global safety guard to prevent duplicate initialization
    if (window.duckNoteInitialized) {
        console.log("Duck Note: Already initialized in this page context.");
        return;
    }
    window.duckNoteInitialized = true;

    // Global elements
    let container = null;
    let note = null;
    let header = null;
    let textarea = null;
    let closeBtn = null;
    let settingsBtn = null;
    let themeMenu = null;
    let isNoteVisible = true; // Default to visible
    let currentTheme = 'yellow'; // Default theme

    // Dragging state
    let isDragging = false;
    let offsetX = 0, offsetY = 0;
    let initialLeft = 0, initialTop = 0;
    let dragStartX = 0, dragStartY = 0;

    // Event listeners references for cleanup
    let mouseMoveHandler = null;
    let mouseUpHandler = null;
    let touchStartHandler = null;
    let touchMoveHandler = null;
    let touchEndHandler = null;

    // Initialize sticky note
    function initializeStickyNote() {
        console.log("Duck Note: Initializing elements");

        // Clean up any existing notes
        const existingContainer = document.getElementById('sticky-note-container');
        if (existingContainer) {
            try {
                existingContainer.parentNode.removeChild(existingContainer);
                console.log("Duck Note: Cleaned up pre-existing elements");
            } catch (e) {
                console.error("Failed to remove existing note container:", e);
            }
        }

        // Create the container
        container = document.createElement('div');
        container.id = 'sticky-note-container';

        // Set container styles
        Object.assign(container.style, {
            all: 'initial',
            position: 'absolute',
            top: '0',
            left: '0',
            zIndex: '2147483647', // Max z-index
            width: '0',
            height: '0',
            margin: '0',
            padding: '0',
            border: 'none',
            background: 'transparent',
            pointerEvents: 'none'
        });

        // Create note wrapper
        note = document.createElement('div');
        note.id = 'floating-note';
        note.className = 'theme-yellow'; // Initial theme class

        // Render HTML content
        note.innerHTML = `
          <div id="duck-container">
            <img id="duck-icon" src="${chrome.runtime.getURL('icons/icon-128.png')}" alt="Duck Icon">
          </div>
          <div id="note-bubble">
            <div id="note-header">
              <span class="note-title">Duck Note</span>
              <div class="note-controls">
                <span id="settings-btn" title="Choose Theme">⚙</span>
                <span id="close-btn" title="Remove Note">×</span>
              </div>
            </div>
            <div id="theme-menu">
              <span class="theme-option yellow" data-theme="yellow" title="Classic Yellow"></span>
              <span class="theme-option green" data-theme="green" title="Mint Green"></span>
              <span class="theme-option purple" data-theme="purple" title="Lavender Purple"></span>
              <span class="theme-option dark" data-theme="dark" title="Slate Dark"></span>
            </div>
            <textarea id="note-content" placeholder="Type your note here..."></textarea>
          </div>
        `;

        // Initially hide the note to prevent layout flickering while loading settings
        note.style.display = 'none';
        note.style.pointerEvents = 'auto';

        // Append to body
        container.appendChild(note);
        document.body.appendChild(container);

        // Get references to elements
        const duckContainer = document.getElementById('duck-container');
        const duckIcon = document.getElementById('duck-icon');
        const noteBubble = document.getElementById('note-bubble');
        header = document.getElementById('note-header');
        textarea = document.getElementById('note-content');
        closeBtn = document.getElementById('close-btn');
        settingsBtn = document.getElementById('settings-btn');
        themeMenu = document.getElementById('theme-menu');

        // Function to update UI based on visibility state
        function updateToggleUI() {
            if (isNoteVisible) {
                noteBubble.style.display = 'flex';
            } else {
                noteBubble.style.display = 'none';
            }

            // Save visibility state
            try {
                chrome.storage.sync.set({ noteVisible: isNoteVisible });
            } catch (e) {
                console.warn("Could not save visibility state:", e);
            }
        }

        // Toggle visibility action
        function toggleNote() {
            isNoteVisible = !isNoteVisible;
            updateToggleUI();
        }

        // Action listeners
        duckIcon.onclick = function (event) {
            event.preventDefault();
            event.stopPropagation();
            toggleNote();
        };

        // Theme switching logic
        settingsBtn.onclick = function (event) {
            event.preventDefault();
            event.stopPropagation();
            themeMenu.classList.toggle('active');
        };

        // Handle click outside theme menu to close it
        document.addEventListener('click', function (event) {
            if (themeMenu && themeMenu.classList.contains('active')) {
                if (!themeMenu.contains(event.target) && event.target !== settingsBtn) {
                    themeMenu.classList.remove('active');
                }
            }
        });

        // Add event listeners to theme option circles
        const themeOptions = themeMenu.querySelectorAll('.theme-option');
        themeOptions.forEach(option => {
            option.onclick = function (event) {
                event.preventDefault();
                event.stopPropagation();
                
                const selectedTheme = this.getAttribute('data-theme');
                applyTheme(selectedTheme);
                
                // Save theme choice
                try {
                    chrome.storage.sync.set({ noteTheme: selectedTheme });
                } catch (e) {
                    console.warn("Could not save theme preference:", e);
                }

                // Close theme menu
                themeMenu.classList.remove('active');
            };
        });

        // Function to apply a specific theme class
        function applyTheme(themeName) {
            if (!note) return;
            // Remove previous theme classes
            note.classList.remove('theme-yellow', 'theme-green', 'theme-purple', 'theme-dark');
            // Add new theme class
            note.classList.add(`theme-${themeName}`);
            currentTheme = themeName;
        }

        // Load settings from Chrome sync storage
        try {
            chrome.storage.sync.get(['notePositionX', 'notePositionY', 'noteVisible', 'stickyNote', 'noteTheme'], function (data) {
                // Restore theme
                if (data.noteTheme) {
                    applyTheme(data.noteTheme);
                } else {
                    applyTheme('yellow');
                }

                // Restore note position
                if (data.notePositionX !== undefined && data.notePositionY !== undefined) {
                    note.style.left = data.notePositionX + 'px';
                    note.style.top = data.notePositionY + 'px';
                    note.style.right = 'auto';
                    note.classList.add('manual-position');
                } else {
                    // Default position (upper-right)
                    note.style.top = '25px';
                    note.style.right = '25px';
                }

                // Restore visibility state
                if (data.noteVisible !== undefined) {
                    isNoteVisible = data.noteVisible;
                }
                updateToggleUI();

                // Restore text content
                if (data.stickyNote) {
                    textarea.value = data.stickyNote;
                }

                // Display note after settings are loaded
                note.style.display = 'flex';
            });
        } catch (e) {
            console.error("Failed to load note settings:", e);
            applyTheme('yellow');
            note.style.top = '25px';
            note.style.right = '25px';
            note.style.display = 'flex';
            updateToggleUI();
        }

        // Save note content on input change
        textarea.addEventListener('input', () => {
            try {
                chrome.storage.sync.set({ stickyNote: textarea.value });
            } catch (storageError) {
                console.warn("Could not save note text content:", storageError);
            }
        });

        // Drag and drop implementation
        function handleMouseDown(e) {
            // Skip dragging if user clicked on button controls or textarea
            if (e.target === closeBtn || e.target === settingsBtn || e.target === textarea || e.target.classList.contains('theme-option')) {
                return;
            }

            isDragging = true;

            const rect = note.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;

            initialLeft = rect.left;
            initialTop = rect.top;
            dragStartX = e.clientX;
            dragStartY = e.clientY;

            // Visual feedback
            document.body.style.cursor = 'grabbing';
            note.classList.add('dragging');
            note.classList.add('manual-position');
            note.style.right = 'auto';

            e.preventDefault();
        }

        function handleMouseMove(e) {
            if (!isDragging) return;

            // Update position based on pointer coordinates and offset
            note.style.left = (e.clientX - offsetX) + 'px';
            note.style.top = (e.clientY - offsetY) + 'px';

            e.preventDefault();
        }

        function handleMouseUp() {
            if (!isDragging) return;

            isDragging = false;
            document.body.style.cursor = '';
            note.classList.remove('dragging');

            // Save new position
            const rect = note.getBoundingClientRect();
            try {
                chrome.storage.sync.set({
                    notePositionX: rect.left,
                    notePositionY: rect.top
                });
                console.log("Position saved successfully:", rect.left, rect.top);
            } catch (storageError) {
                console.warn("Could not save drag position:", storageError);
            }
        }

        // Mouse Drag event listeners
        mouseMoveHandler = handleMouseMove;
        mouseUpHandler = handleMouseUp;

        duckContainer.addEventListener('mousedown', handleMouseDown);
        header.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);

        // Mobile Touch Drag implementation
        touchStartHandler = (e) => {
            if (e.target === closeBtn || e.target === settingsBtn || e.target === textarea || e.target.classList.contains('theme-option')) {
                return;
            }

            const touch = e.touches[0];
            isDragging = true;

            const rect = note.getBoundingClientRect();
            initialLeft = rect.left;
            initialTop = rect.top;
            offsetX = touch.clientX - rect.left;
            offsetY = touch.clientY - rect.top;
            dragStartX = touch.clientX;
            dragStartY = touch.clientY;

            note.classList.add('dragging');
            note.classList.add('manual-position');
            note.style.right = 'auto';

            e.preventDefault();
        };

        touchMoveHandler = (e) => {
            if (!isDragging) return;
            const touch = e.touches[0];
            note.style.left = (touch.clientX - offsetX) + 'px';
            note.style.top = (touch.clientY - offsetY) + 'px';
            e.preventDefault();
        };

        touchEndHandler = (e) => {
            if (!isDragging) return;

            isDragging = false;
            note.classList.remove('dragging');

            const rect = note.getBoundingClientRect();
            try {
                chrome.storage.sync.set({
                    notePositionX: rect.left,
                    notePositionY: rect.top
                });
            } catch (err) {
                console.warn("Failed to save mobile touch position:", err);
            }
        };

        // Touch drag event listeners
        duckContainer.addEventListener('touchstart', touchStartHandler, { passive: false });
        header.addEventListener('touchstart', touchStartHandler, { passive: false });
        document.addEventListener('touchmove', touchMoveHandler, { passive: false });
        document.addEventListener('touchend', touchEndHandler);

        // Remove element completely
        function closeNote() {
            try {
                // Remove document event listeners
                document.removeEventListener('mousemove', mouseMoveHandler);
                document.removeEventListener('mouseup', mouseUpHandler);
                document.removeEventListener('touchmove', touchMoveHandler);
                document.removeEventListener('touchend', touchEndHandler);

                // Clean up DOM elements
                if (container && container.parentNode) {
                    container.parentNode.removeChild(container);
                }

                // Reset references
                container = null;
                note = null;
                header = null;
                textarea = null;
                closeBtn = null;
                settingsBtn = null;
                themeMenu = null;

                // Reset initialization flag
                window.duckNoteInitialized = false;
                console.log("Duck Note: Note closed and removed from DOM");
            } catch (e) {
                console.error("Error closing note:", e);
            }
        }

        // Close button click handler
        closeBtn.onclick = function (e) {
            e.preventDefault();
            e.stopPropagation();
            closeNote();
        };
        
        // Expose closeNote function to outer scope via return or binding
        window.closeDuckNote = closeNote;
        window.toggleDuckNote = toggleNote;
    }

    // Run initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeStickyNote);
    } else {
        // Small delay to prevent issues with slow-loading DOM elements
        setTimeout(initializeStickyNote, 100);
    }

    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        console.log("Duck Note Content: Received message", message);

        if (message.action === "ping") {
            sendResponse({ status: "ok" });
            return true;
        }

        // Ensure notes are initialized if they somehow got destroyed or closed
        if (!container && message.action !== "ping") {
            initializeStickyNote();
            // Wait slightly for DOM creation
            setTimeout(() => {
                handleMessageAction(message, sendResponse);
            }, 150);
            return true;
        }

        handleMessageAction(message, sendResponse);
        return true;
    });

    function handleMessageAction(message, sendResponse) {
        try {
            if (message.action === "toggle") {
                if (window.toggleDuckNote) {
                    window.toggleDuckNote();
                    sendResponse({ status: "ok" });
                } else {
                    sendResponse({ status: "error", message: "Toggle function not bound" });
                }
            } else if (message.action === "close") {
                if (window.closeDuckNote) {
                    window.closeDuckNote();
                    // Clear sync storage settings to reset
                    chrome.storage.sync.remove(['notePositionX', 'notePositionY', 'noteVisible', 'stickyNote', 'noteTheme']);
                    sendResponse({ status: "ok" });
                } else {
                    sendResponse({ status: "error", message: "Close function not bound" });
                }
            }
        } catch (e) {
            console.error("Error in message handler:", e);
            sendResponse({ status: "error", message: e.toString() });
        }
    }
})();