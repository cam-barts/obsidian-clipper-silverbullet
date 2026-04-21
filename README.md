# SilverBullet Web Clipper

A browser extension for clipping web content directly into [SilverBullet](https://silverbullet.md). Highlight and capture pages, save them as Markdown notes via SilverBullet's HTTP API, and use powerful templates and variables to control exactly what gets saved.

## Installation

Download the latest signed extension from the [Releases](../../releases) page:

- **Firefox** — install the `.xpi` file directly via `about:addons` → gear icon → **Install Add-on From File**
- **Chrome / Brave / Edge / Arc** — unzip the `.zip` and load unpacked via `chrome://extensions` → **Load unpacked**

## Setup

1. Open the extension settings (gear icon in the popup)
2. Under **Server**, enter your SilverBullet instance URL (e.g. `https://bullet.example.com`)
3. Choose **Username & password** or **Bearer token** and enter your credentials
4. Click **Test** to verify the connection
5. Optionally set a **Daily note path** template (default: `Journal/{date:YYYY-MM-DD}`)

Clipped notes are saved to `Inbox/` by default. You can change the path and behavior per template.

## Features

Inherited from the upstream Obsidian Web Clipper and adapted for SilverBullet:

- Clip web pages as Markdown notes via `PUT /.fs/<path>.md`
- Create, append, prepend, overwrite, or append/prepend to daily notes
- Reader mode for distraction-free reading before clipping
- Highlighter mode — annotate pages before saving
- Template system with variables, filters, and triggers
- Interpreter — use AI to extract structured data from pages

## Attribution

Built for [SilverBullet](https://silverbullet.md), created by [Zef Hemel](https://github.com/zefhemel).

This is a vibe-coded fork of [obsidian-clipper](https://github.com/obsidianmd/obsidian-clipper) by [Obsidian](https://obsidian.md), used under the [MIT License](LICENSE). The core content extraction, template compiler, reader mode, highlighter, and filter system are unchanged from upstream. This fork replaces the Obsidian URI save mechanism with direct HTTP calls to SilverBullet's REST API and removes the CLI, API, and Safari targets.

Upstream changes are periodically merged from `obsidianmd/obsidian-clipper:main`.


Most of this project was vibe coded with [Claude Opus 4.6](https://docs.anthropic.com/en/docs/about-claude/models) via [Claude Code](https://docs.anthropic.com/en/docs/claude-code) to meet one person's specific requirements (mine).
Credit to the enormous body of open source software the models were trained on, this project wouldn't exist without it.

## Developers

### Build

```
npm install
npm run build          # builds both Chrome and Firefox
npm run build:chrome   # Chrome only → dist/chrome/
npm run build:firefox  # Firefox only → dist/firefox/
```

Built zips land in `builds/`.

### Install locally

**Firefox:**
1. `about:debugging` → **This Firefox** → **Load Temporary Add-on**
2. Select `dist/firefox/manifest.json`

**Chrome/Brave/Edge:**
1. `chrome://extensions` → enable **Developer mode**
2. **Load unpacked** → select `dist/chrome/`

### Run tests

```
npm test
npm run test:watch
```

### Release

Push a version tag to trigger the release workflow:

```
git tag v1.5.2
git push origin v1.5.2
```

The workflow builds both targets, signs the Firefox extension via AMO, and publishes a GitHub Release with both artifacts. Requires `AMO_API_KEY` and `AMO_API_SECRET` secrets set in the repository settings.

## Third-party libraries

- [webextension-polyfill](https://github.com/mozilla/webextension-polyfill) — browser compatibility
- [defuddle](https://github.com/kepano/defuddle) — content extraction and Markdown conversion
- [dayjs](https://github.com/iamkun/dayjs) — date parsing and formatting
- [lz-string](https://github.com/pieroxy/lz-string) — template compression
- [lucide](https://github.com/lucide-icons/lucide) — icons
- [dompurify](https://github.com/cure53/DOMPurify) — HTML sanitization
