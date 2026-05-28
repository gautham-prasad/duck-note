# Chrome Web Store Listing — Duck Note

> Last Updated: 2026-05-28

## Store Listing

**Extension Name**
Duck Note

**Short Description**
A persistent floating sticky note that follows you across tabs and browser sessions.

**Detailed Description**
Duck Note is a delightful and persistent floating sticky note that accompanies you across the web. Whether you are conducting research, drafting notes, or keeping track of quick links, Duck Note floats unobtrusively on any webpage, ready at a single click.

Key Features:

* Persistent Across Tabs: Write a note on one page, and it instantly syncs to all other open tabs.
* Position-Aware & Draggable: Easily reposition the note by dragging the yellow header or the duck container. Its coordinates are remembered automatically.
* Compact Launcher: Collapse the note bubble to keep it out of the way, leaving just a cute, draggable duck launcher that you can click to expand.
* Beautiful Multi-Theme Support: Personalize your notes! Choose from Classic Yellow, Mint Green, Lavender Purple, or Slate Dark.
* 100% Secure & Private: Your data is saved locally on your device or synchronized securely across your browser profile via Chrome sync. No servers, no tracking, and no external data collection.

How to Use:

1. Click the Duck Note icon in your browser's extensions toolbar to show the note on your current tab.
2. Type inside the text area. Your content saves automatically in real-time.
3. Drag the note by clicking and holding the duck icon or the note's header.
4. Click the gear icon inside the header to toggle the theme menu and choose a style.
5. Click the underscore button to collapse the note, and click the duck icon to expand it back.
6. Click the cross button to remove the note from the page completely.

**Category**
Productivity

**Single Purpose**
Adds a persistent, draggable floating note bubble that syncs text and positions across browser tabs.

**Primary Language**
English (United States)


## Graphics & Assets

| Asset | Dimensions | Status | Filename |
|-------|-----------|--------|----------|
| Store Icon | 128×128 PNG | ✅ Ready | `icons/icon-128.png` |
| Screenshot 1 | 1280×800 | ⬜ Not created | |
| Screenshot 2 | 1280×800 | ⬜ Not created | |
| Screenshot 3 | 1280×800 | ⬜ Not created | |

### Screenshot Notes
- **Screenshot 1**: Show the Duck Note floating on a clean article or search engine page, showcasing the "Classic Yellow" theme with example text.
- **Screenshot 2**: Show the Duck Note collapsed, demonstrating the small, non-intrusive duck launcher on the edge of the screen.
- **Screenshot 3**: Show the settings theme panel open, displaying the Slate Dark theme as an alternative style.


## Permissions Justification

| Permission | Type | Justification |
|------------|------|---------------|
| `storage` | permissions | Used to persist the note text content, screen coordinates, theme preferences, and visible states. |
| `activeTab` | permissions | Grants temporary, secure permission to interact with the active page only when the user clicks the toolbar icon, allowing the card to render. |
| `scripting` | permissions | Used to inject the floating card logic (`content.js`) and style sheets (`styles.css`) on the active tab upon clicking the toolbar icon. |
| `tabs` | permissions | Used to query active tab metadata (specifically checking the URL scheme) to safeguard the script from executing on unsupported or restricted browser pages (such as `chrome://` settings). |


## Privacy & Data Use

### Data Collection

**Does the extension collect user data?** No

### Data Use Certification
- [x] Data is NOT sold to third parties
- [x] Data is NOT used for purposes unrelated to the extension's core functionality
- [x] Data is NOT used for creditworthiness or lending purposes


## Privacy Policy

**Privacy Policy URL**
https://github.com/gautham-prasad/duck-note/blob/main/PRIVACY_POLICY.md
*(Or point to your hosted GitHub pages site)*


## Distribution

**Visibility**: Public
**Regions**: All regions
**Pricing**: Free


## Developer Info

**Publisher Name**
Gautham Prasad

**Contact Email**
gautham@example.com
*(Update with your preferred developer contact email on the dashboard)*

**Support URL / Email**
https://github.com/gautham-prasad/duck-note/issues


## Version History

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 1.0.0 | 2026-05-28 | Initial store submission. Cleaned up code architecture, optimized icon sets, introduced HSL themes (Yellow, Green, Purple, Dark), and refactored service worker. | Draft |


## Review Notes

### Known Issues / Limitations
- Cannot be loaded on chrome:// URLs, extension detail pages, or the Chrome Web Store site itself due to browser security restrictions.
