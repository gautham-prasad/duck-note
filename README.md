# 🦆 Duck Note Chrome Extension

A premium, lightweight, and delightful Chrome extension that adds a persistent, draggable floating sticky note directly to your browser windows. Take notes, jot down thoughts, or store reference links seamlessly as you browse.

---

## ✨ Features

* **Persistent Across Tabs**: Write or edit notes on one website, and watch them sync instantly to any other tab or browser window.
* **Draggable & Coordinates-Aware**: Grab the yellow header or the duck container to position the note anywhere on your screen. The coordinates persist automatically between tabs and restarts.
* **Compact Launcher Mode**: Minimize the note card into a tiny, cute floating duck. Place it anywhere on the edge of your screen and click it when you are ready to expand and type.
* **Premium Glassmorphic Design**: Refined with modern layout aesthetics, smooth micro-animations, drop shadows, and system typography.
* **🎨 Beautiful Theme Customization**: Click the gear icon to toggle between four custom HSL styles:
  * 💛 **Classic Yellow** (Default)
  * 💚 **Mint Green**
  * 💜 **Lavender Purple**
  * 💙 **Slate Dark**
* **🔒 Privacy First**: Zero third-party scripts, zero servers, and zero data tracking. Your notes stay inside your browser and synchronize safely via standard Google Chrome Sync.

---

## 🚀 Installation & Local Development

Since this extension is open source, you can load and run it locally in developer mode:

1. **Clone or Download** this repository to your local machine:
   ```bash
   git clone https://github.com/gautham-prasad/duck-note.git
   ```
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** using the toggle switch in the top-right corner.
4. Click **Load unpacked** in the top-left corner.
5. Select the `duck-note` project directory.
6. The Duck Note extension is now ready! Pin it to your extensions bar for easy access.

---

## 🛠️ Codebase Structure

The project is structured simply and efficiently using Manifest V3 guidelines:

* [manifest.json](file:///Users/gautham/Code/duck-note/manifest.json): Extension configuration including action hooks, storage declarations, and injected resources.
* [background.js](file:///Users/gautham/Code/duck-note/background.js): The service worker script managing extension toolbar clicks and injecting content resources securely via a ping-before-inject messaging flow.
* [content.js](file:///Users/gautham/Code/duck-note/content.js): Script injected on target web pages. Manages the DOM lifecycle of the note card, handles dragging mechanics (mouse & touch events), and handles theme updates.
* [styles.css](file:///Users/gautham/Code/duck-note/styles.css): Stylesheet defining the premium visual guidelines, glassmorphic filters, keyframes, scrollbars, and core theme properties.
* `icons/`: Subdirectory containing square optimized PNG assets (`icon-16.png`, `icon-32.png`, `icon-48.png`, `icon-128.png`).

---

## 🏛️ Project Documentation & Listing

* **Store Listing Prep**: [CHROMEWEBSTORE.md](file:///Users/gautham/Code/duck-note/CHROMEWEBSTORE.md) — Tracks the copy, category, assets status, and permissions justifications required for the Chrome Developer Dashboard.
* **Privacy Policy**: [PRIVACY_POLICY.md](file:///Users/gautham/Code/duck-note/PRIVACY_POLICY.md) — Explains sync mechanism and privacy compliance.
* **License**: [LICENSE](file:///Users/gautham/Code/duck-note/LICENSE) — Licensed under the permissive MIT License.

---

## 🤝 Contributing

Contributions are welcome! If you have suggestions for new features, bug fixes, or enhancements, please feel free to:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/cool-new-feature`
3. Commit your changes: `git commit -m 'Add some cool feature'`
4. Push to the branch: `git push origin feature/cool-new-feature`
5. Open a Pull Request.