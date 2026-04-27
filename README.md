# Responsive Lab Chrome Extension

Responsive Lab is a Chrome Extension that opens from the browser toolbar into a full extension page for previewing one URL across multiple responsive device iframes. The UI is rebuilt from the provided static mockups with Vite, React, TypeScript, Tailwind CSS, Zustand, and Zod.

## Reference mockups

- `1.html` is the main Responsive Lab screen reference. It defines the top toolbar, default device frame row, colors, spacing, default zoom, and core controls.
- `2.html` is the Add Device modal reference. It defines the modal layout, preset device list, search field, and custom size form.

These mockup files are intentionally kept in the project root as visual and behavioral references. They are not the production extension UI.

## Features

- Opens as a full extension page from the Chrome toolbar icon.
- Loads a user-entered URL into multiple horizontally scrollable responsive iframe previews.
- Starts with six Tailwind-oriented default breakpoints: `380px`, `sm` `640px`, `md` `768px`, `lg` `1024px`, `xl` `1280px`, and `2xl` `1536px`.
- Includes the Add Device modal from `2.html` with searchable presets and custom device sizes.
- Supports global and per-frame rotate, reload, close, drag reorder, reset, zoom, settings, GitHub notice, and Sync Scroll controls.
- Provides a Capture Mode fallback for iframe-blocked pages by capturing a responsive screenshot from a temporary top-level Chrome tab.
- Persists layout state with Chrome storage, with a localStorage/in-memory fallback for normal Vite development mode.

## Setup

Install dependencies from the project root:

```bash
npm install
```

## Development

Run the Vite development server for UI work:

```bash
npm run dev
```

The development server is useful for working on React/Tailwind UI. Chrome-extension-only behavior, such as toolbar launch, `chrome.storage`, extension service worker behavior, and content-script-based iframe scroll sync, should be verified from the built extension in Chrome.

## Validation commands

Run TypeScript validation:

```bash
npm run typecheck
```

Build the production extension bundle:

```bash
npm run build
```

Preview the built web app shell locally if needed:

```bash
npm run preview
```

## Load as an unpacked Chrome extension

1. Build the extension:

   ```bash
   npm run build
   ```

2. Open Chrome and go to:

   ```text
   chrome://extensions
   ```

3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select this folder:

   ```text
   /Users/yoon/Desktop/labs/chrome-responsive-ui-extension/dist
   ```

6. After Chrome loads the extension, click the Responsive Lab toolbar icon.
7. Verify that Chrome opens a new tab with the Responsive Lab extension page.

The extension is intentionally configured as a toolbar action that opens a page tab. It does not use a popup and does not inject an overlay on the currently viewed website.

## Usage

1. Open Responsive Lab from the Chrome toolbar icon.
2. Enter a URL in the toolbar input. For example:

   ```text
   https://example.com
   ```

3. Click **Go** or press Enter.
4. The URL loads inside every active device frame.
5. Use the horizontal canvas scroll to inspect all device previews.
6. Use **Add** to open the Add Device modal, search presets, or add a custom device.
7. Use **Rotate**, **Reload**, **Reset**, **Zoom**, and per-frame controls to adjust the preview layout.



## Tailwind default breakpoints

The default preview row uses six Tailwind-oriented viewport widths:

| Label | Viewport |
| --- | --- |
| `380px` | `380 × 844` |
| `sm` | `640 × 900` |
| `md` | `768 × 1024` |
| `lg` | `1024 × 768` |
| `xl` | `1280 × 900` |
| `2xl` | `1536 × 960` |

The Add Device modal keeps the existing freeform/preset device list, so the Tailwind breakpoints are the default layout rather than the only available sizes.

## Privacy policy

The public privacy policy for Responsive Lab is hosted on GitHub Pages:

```text
https://airman5573.github.io/chrome-responsive-ui-extension-privacy/
```

## Known limitations

### Iframe blocking

Some websites intentionally prevent iframe embedding with security headers such as `X-Frame-Options` or Content Security Policy `frame-ancestors`. When a site blocks iframe rendering, Responsive Lab cannot force it to display inside a frame. The app shows a blocked or maybe-blocked fallback state and provides **Capture screenshot**, **Open in new tab**, and retry actions.

Capture Mode is a fallback, not the primary renderer. It opens the URL in a temporary top-level Chrome tab, applies the target device viewport through Chrome's debugger API, captures a screenshot, closes the temporary tab, and displays the captured image in the device frame. This avoids iframe embedding restrictions for many pages, but the result is a static screenshot rather than a live interactive page.

Examples of sites that may block iframe embedding include many login pages, banking pages, admin dashboards, large social platforms, and other security-sensitive websites.

### Sync Scroll is best-effort

Sync Scroll is implemented as a best-effort feature using a content script and message bridge. It works best on normal pages where the top-level document scrolls vertically. It may not work perfectly when:

- the target site blocks iframe embedding;
- Chrome does not inject the content script into a page or frame;
- the site uses nested custom scroll containers instead of window/document scrolling;
- the site is a complex SPA that virtualizes or overrides scroll behavior;
- the iframe is cross-origin and browser security prevents direct parent-page access.

The content script is intentionally privacy-preserving: it sends only readiness and scroll ratio messages. It does not transmit page text, form values, cookies, or DOM content.

### Host permissions and debugger permission

The extension declares `http://*/*` and `https://*/*` host permissions so the Sync Scroll content script can run in eligible iframe pages. This is required for the best-effort scroll synchronization behavior.

The extension also requests Chrome's `debugger` permission for Capture Mode fallback. It is used only after the user requests a fallback capture for an iframe-blocked preview, so Responsive Lab can emulate the selected device viewport and capture a screenshot from a temporary tab.

## Project structure

```text
1.html                         Original main screen mockup reference
2.html                         Add Device modal mockup reference
public/manifest.json           Manifest V3 extension manifest
public/icons/                  Extension icons
src/                           React, store, schemas, components, extension scripts
src/extension/background.ts    Toolbar click handler that opens index.html in a tab
src/extension/scrollContentScript.ts
                               Best-effort iframe scroll sync content script
vite.config.ts                 Multi-entry Vite build for app, background, and content script
dist/                          Production extension output after npm run build
```
