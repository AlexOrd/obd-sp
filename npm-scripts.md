# 📦 NPM Scripts Guide

## Available Commands

### Development

```bash
npm start
```
**Same as `npm run dev`** - Starts development server with:
- 🧹 Clean dist folder
- 🏗️ Build all files (templates, lectures, CSS, JS, images)
- 🚀 Start BrowserSync server at `http://localhost:3000`
- 👀 Watch for changes and auto-reload
- 🎨 Live CSS injection (no page reload needed)

**Best for:** Active development with instant feedback

---

```bash
npm run dev
```
Full development workflow (identical to `npm start`)

---

### Production Build

```bash
npm run build
```
Standard build without minification:
- Clean and rebuild all files
- No HTML minification
- No console.log removal
- Faster build time

**Best for:** Testing build process

---

```bash
npm run build:prod
```
Production-optimized build:
- 🗜️ HTML minification (whitespace, comments removed)
- 🎨 CSS minification (level 2 optimization)
- ⚡ JS minification (console.log removed, code compressed)
- 📦 Smallest file sizes

**Best for:** Deployment to production

---

### Utilities

```bash
npm run clean
```
Removes the entire `dist/` folder

---

```bash
npm run serve
```
Only start BrowserSync server (requires dist/ to exist)

---

```bash
npm run watch
```
Only watch files for changes (requires dist/ to exist)

---

## Quick Reference

| Command | Build | Server | Watch | Minify |
|---------|-------|--------|-------|--------|
| `npm start` | ✅ | ✅ | ✅ | ❌ |
| `npm run dev` | ✅ | ✅ | ✅ | ❌ |
| `npm run build` | ✅ | ❌ | ❌ | ❌ |
| `npm run build:prod` | ✅ | ❌ | ❌ | ✅ |
| `npm run serve` | ❌ | ✅ | ❌ | ❌ |
| `npm run watch` | ❌ | ❌ | ✅ | ❌ |

---

## Typical Workflow

### 1. First Time Setup
```bash
npm install
npm start
```

### 2. Daily Development
```bash
npm start
# Edit files in src/
# Browser auto-reloads at http://localhost:3000
```

### 3. Before Deployment
```bash
npm run build:prod
# Upload dist/ folder to server
```

---

## What Gets Built?

### Source Files (src/)
- `templates/*.mustache` → `dist/*.html`
- `templates/slides/*.mustache` → (used as partials)
- `data/lectures.json` → data for index.html
- `data/lectures/*.json` → `dist/lectures/*.html`
- `css/*.css` → `dist/css/*.css` (minified in prod)
- `js/*.js` → `dist/js/*.js` (minified in prod)
- `images/*` → `dist/images/*` (copied)

---

## Build Features

### Development Mode (`npm start`)
- 🎨 **CSS**: Autoprefixer, no minification
- ⚡ **JS**: No minification, console.log kept
- 📄 **HTML**: Readable, formatted
- 🔥 **Live Reload**: Instant browser updates
- 💨 **Fast**: Optimized for speed

### Production Mode (`npm run build:prod`)
- 🎨 **CSS**: Autoprefixer + minification (level 2)
- ⚡ **JS**: Minification, console.log removed
- 📄 **HTML**: Minified (whitespace/comments removed)
- 📦 **Size**: ~30% smaller files
- 🚀 **Optimized**: Ready for deployment

---

## File Watching

The watch task monitors:
- `src/templates/**/*.mustache` → Rebuilds all templates and lectures
- `src/templates/slides/**/*.mustache` → Rebuilds lectures only
- `src/data/**/*.json` → Rebuilds templates and lectures
- `src/css/**/*.css` → Rebuilds CSS (live injection)
- `src/js/**/*.js` → Rebuilds JS (with reload)
- `src/images/**/*` → Copies images (with reload)

---

## BrowserSync Features

When running `npm start`:
- 📱 **Responsive testing** - UI at `http://localhost:3001`
- 🔄 **Auto-reload** on file changes
- 💉 **CSS injection** without reload
- 🌐 **Network access** at `http://192.168.x.x:3000`
- 🔕 **No notifications** - clean UI

---

## Troubleshooting

### Server won't start
```bash
npm run clean
npm start
```

### Changes not reflecting
- Check terminal for errors
- Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+F5)
- Restart with `npm start`

### Port 3000 already in use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
npm start
```

---

## Performance

### Build Times
- **Development build**: ~80ms
- **Production build**: ~140ms (with minification)
- **Watch rebuild**: ~20-50ms (incremental)

### File Sizes (Production)
- Index HTML: ~6 KB
- Lecture 0 (demo): ~27 KB
- CSS (total): ~13 KB
- All HTML: ~29 KB (minified)

---

**Updated:** October 22, 2025
**Version:** 2.0.0
