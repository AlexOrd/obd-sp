# 🎓 OBD-SP | Dual-Track Education Platform

> **Основи Баз Даних та Спеціалізовані мови програмування**
> Modern educational presentation system with dual themes: Cyberpunk 2077 & Harry Potter

[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Code Style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io/)

---

## 📚 Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - GitHub Actions & GitHub Pages deployment guide
- **[AI_PROJECT_SUMMARY.md](AI_PROJECT_SUMMARY.md)** - Architecture and rules (read first)
- **[AI_LECTURE_CREATION.md](AI_LECTURE_CREATION.md)** - Guide for creating new lectures (AI agents)
- **[SLIDE_TYPES_GUIDE.md](SLIDE_TYPES_GUIDE.md)** - Complete reference for all 19 slide types
- **[CODE_QUALITY.md](CODE_QUALITY.md)** - Code formatting, linting, and quality standards

---

## 🎭 Dual-Track System

The platform supports two independent lecture tracks with distinct themes:

### 🌃 SP Track - System Programming (Cyberpunk 2077)

- **Theme**: Neon colors, glitch effects, circuit animations
- **Focus**: C/C++, memory management, system architecture, processes
- **URL**: `/sp/`
- **Colors**: Cyan (#00f0ff), Yellow (#fcee0a), Magenta (#ff00ff)

### 📚 DB Track - Databases (Harry Potter Magical)

- **Theme**: Parchment, gold accents, magical particles, pixel art
- **Focus**: SQL, NoSQL, database design, query optimization
- **URL**: `/db/`
- **Colors**: Scarlet (#740001), Gold (#d3a625), Purple (#6b2d5c)

### 🏠 Landing Page

- **Vertical split** with Vanta.js animations
- **Left side**: Cyberpunk NET effect with animated network nodes (SP)
- **Right side**: Harry Potter BIRDS effect with golden birds flying (DB)
- Interactive hover effects and themed sections
- Real-time 3D graphics powered by Three.js r134

---

## 📖 Table of Contents

- [Features](#-features)
- [Quick Start](#-quick-start)
- [Deployment & GitHub Pages](#-deployment--github-pages)
- [Project Structure](#-project-structure)
- [Creating Lectures](#-creating-lectures)
- [Slide Types](#-slide-types)
- [Development](#-development)
- [Technologies](#-technologies)

---

## ✨ Features

### 🎨 **Cyberpunk 2077 Design**

- Custom neon color palette (yellow, cyan, magenta)
- Glitch animations and scanline effects
- Pixel art SVG icons
- Animated terminal with Typed.js

### 📚 **19 Slide Types**

- Title, Roadmap, Previous-lecture, Definition, Syntax
- Code Example, Code Breakdown, Debugger, Common Mistake
- Diagram (Mermaid/ASCII), Comparison, Summary, Next Steps
- Live Coding, Content, List, Table, Timeline, Quiz

### 🛠 **Modern Build System**

- **Gulp 5.0** - Task automation
- **Mustache** - Template engine
- **BrowserSync** - Live reload
- **Prettier & ESLint** - Code quality
- **Production optimization** - Minification

### 🌐 **Internationalization**

- Full Cyrillic support
- Ukrainian language interface

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0

### Installation

```bash
# Clone the repository
git clone https://github.com/AlexOrd/obd-sp.git
cd obd-sp

# Install dependencies
npm install

# Start development server
npm start
```

The site will open at `http://localhost:3000` with live reload enabled.

---

## 🌐 Deployment & GitHub Pages

### Automated Deployment

This project uses **GitHub Actions** for automatic deployment to GitHub Pages.

**How it works:**

- Push to `master` branch → Automatic build & deploy
- Build runs `npm run build:prod`
- Deploys to `gh-pages` branch
- Site goes live at GitHub Pages URL

### GitHub Pages Configuration

#### 1. Configure Actions Permissions (Required First!)

**Settings** → **Actions** → **General**

1. Go to: https://github.com/AlexOrd/obd-sp/settings/actions
2. Scroll to **"Workflow permissions"**
3. Select **"Read and write permissions"**
4. Click **Save**

> **Note**: The `GITHUB_TOKEN` is automatically provided. This setting allows the workflow to push to your repository.

#### 2. Enable GitHub Pages

**Settings** → **Pages**

1. Go to: https://github.com/AlexOrd/obd-sp/settings/pages
2. Under **"Build and deployment"**:
   - **Source**: Deploy from a branch
   - **Branch**: `gh-pages` / `root`
3. Click **Save**

#### 3. Custom Domain (Optional)

To use a custom domain like `vtfk.ordynski.com`:

**Step 3a: Create Subdomain in GoDaddy**

1. Log in to your GoDaddy account at https://www.godaddy.com
2. Go to **My Products** → **Domains**
3. Click on your domain (e.g., `ordynski.com`)
4. Select **DNS** or **Manage DNS**
5. Scroll to **DNS Records** section
6. Click **Add** or **Add New Record**
7. Configure the CNAME record:
   - **Type**: CNAME
   - **Name**: `vtfk` (this creates vtfk.ordynski.com)
   - **Value**: `alexord.github.io`
   - **TTL**: 600 seconds (or 1 hour)
8. Click **Save**
9. Wait 10-30 minutes for DNS propagation

**Step 3b: Configure GitHub Pages**

1. Go to GitHub Pages settings: https://github.com/AlexOrd/obd-sp/settings/pages
2. Under **"Custom domain"**, enter: `vtfk.ordynski.com`
3. Click **Save** (GitHub will create a CNAME file in your repository)
4. Wait a few minutes, then check **"Enforce HTTPS"**

> **Note**: DNS propagation can take 10-30 minutes (sometimes up to 48 hours). You can check status at https://dnschecker.org

### Deployment Status

Check deployment status: https://github.com/AlexOrd/obd-sp/actions

### Live Site

- **GitHub Pages**: https://alexord.github.io/obd-sp/
- **Custom Domain**: https://vtfk.ordynski.com (if configured)

> 📖 **Detailed setup guide**: See [DEPLOYMENT.md](DEPLOYMENT.md) for complete instructions

---

## 📁 Project Structure

```
obd-sp/
├── src/                            # Shared resources
│   ├── templates/
│   │   └── landing.html            # Landing page (dual-theme)
│   ├── css/
│   │   └── landing.css             # Landing styles
│   ├── js/
│   │   └── landing.js              # D3.js animations
│   └── images/                     # Shared images
├── sp/                             # System Programming track
│   ├── data/
│   │   ├── lectures.json           # SP lectures list
│   │   └── lectures/
│   │       ├── lecture0.json       # Demo
│   │       └── lecture1.json       # SP lectures
│   ├── templates/
│   │   ├── index.html              # SP index page
│   │   ├── lecture-slide.html      # SP lecture wrapper
│   │   └── slides/                 # 19 slide templates
│   ├── css/
│   │   └── cyberpunk-theme.css     # Cyberpunk theme
│   └── images/                     # SP-specific images
├── db/                             # Databases track
│   ├── data/
│   │   ├── lectures.json           # DB lectures list
│   │   └── lectures/
│   │       └── lecture1.json       # DB lectures
│   ├── templates/
│   │   ├── index.html              # DB index page
│   │   ├── lecture-slide.html      # DB lecture wrapper
│   │   └── slides/                 # 19 slide templates
│   ├── css/
│   │   └── harry-potter-theme.css  # Harry Potter theme
│   └── images/                     # DB-specific images
├── dist/                           # Built files (auto-generated)
│   ├── index.html                  # Landing page
│   ├── sp/                         # SP track output
│   └── db/                         # DB track output
├── gulpfile.js                     # Dual-track build system
└── package.json                    # Dependencies & scripts
```

---

## 📝 Creating Lectures

### Quick Steps

1. **Choose track**: SP (system programming) or DB (databases)
2. **Create lecture data file**:
   - SP: `sp/data/lectures/lectureN.json`
   - DB: `db/data/lectures/lectureN.json`
3. **Add to lectures list**:
   - SP: Edit `sp/data/lectures.json`
   - DB: Edit `db/data/lectures.json`
4. **Build**: Run `npm run build`
5. **View**: Open `http://localhost:3000`, click on track section

### Example Lecture (DB Track)

```json
{
  "track": "db",
  "lectureNumber": "2",
  "lectureTitle": "SQL Basics",
  "courseTitle": "Основи баз даних",
  "year": "2025",
  "slides": [
    {
      "type": "title",
      "title": "ЛЕКЦІЯ 2",
      "subtitle": "SQL Basics",
      "meta": {
        "course": "Основи баз даних",
        "institution": "VTFK • 2025"
      }
    },
    {
      "type": "definition",
      "title": "Що таке SQL?",
      "term": "SQL",
      "definition": "Structured Query Language для управління базами даних",
      "analogy": "SQL - це універсальна мова для спілкування з базами даних"
    }
  ]
}
```

**Note**: All lecture content must be in **Ukrainian**. The `track` field is **required**.

> 📖 **For AI agents**: See [AI_LECTURE_CREATION.md](AI_LECTURE_CREATION.md) for detailed instructions

---

## 🎬 Slide Types

### Overview

| Type               | Description                      | Use Case             |
| ------------------ | -------------------------------- | -------------------- |
| `title`            | Lecture title page               | Opening slide        |
| `roadmap`          | Lecture plan with checkboxes     | Outline topics       |
| `previous-lecture` | Recap of previous material       | Review               |
| `definition`       | Term + definition + analogy      | Concepts             |
| `syntax`           | Syntax breakdown with highlights | Language features    |
| `code-example`     | Code block with description      | Examples             |
| `code-breakdown`   | Code + step-by-step explanation  | Detailed walkthrough |
| `diagram`          | ASCII art or images + labels     | Visual explanations  |
| `comparison`       | Two-column comparison            | Contrasts            |
| `debugger`         | Code + GDB commands              | Debugging            |
| `common-mistake`   | Wrong vs correct code            | Error prevention     |
| `live-coding`      | Animated terminal + action items | Interactive coding   |
| `summary`          | Key takeaways with stars         | Conclusion           |
| `next-steps`       | Resources and next lecture       | Closing              |

> 📖 **Full documentation**: See [SLIDE_TYPES_GUIDE.md](SLIDE_TYPES_GUIDE.md) for all JSON schemas and examples

---

## 💻 Development

### NPM Scripts

```bash
# Development
npm start              # Start dev server with live reload
npm run dev            # Same as start
npm run watch          # Watch files only (no server)
npm run serve          # Serve dist/ folder only

# Building
npm run build          # Build with validation
npm run build:prod     # Production build (minified)
npm run clean          # Clean dist/ folder

# Code Quality
npm run format         # Format all code with Prettier
npm run format:check   # Check formatting (CI)
npm run lint           # Lint JavaScript with ESLint
npm run lint:fix       # Auto-fix linting issues
npm run validate       # Lint + format check
```

### Development Workflow

1. **Start dev server**: `npm start`
2. **Edit files** in `src/`
3. **Changes auto-reload** in browser
4. **Before commit**: `npm run validate`
5. **Build for production**: `npm run build:prod`

### File Watching

The dev server automatically watches and rebuilds:

- Templates (`.html`, `.mustache`)
- Data files (`.json`)
- Styles (`.css`)
- Scripts (`.js`)
- Images

### Code Quality

**Prettier** - Code formatting with auto-format on save
**ESLint** - JavaScript linting with auto-fix
**Husky** - Pre-commit hooks for validation

> 📖 **Details**: See [CODE_QUALITY.md](CODE_QUALITY.md)

---

## 🛠 Technologies

### Core

- **[Reveal.js](https://revealjs.com/)** 5.0.4 - Presentation framework
- **[Mustache](https://mustache.github.io/)** 5.0.0 - Logic-less templates
- **[Gulp](https://gulpjs.com/)** 5.0.0 - Task automation

### Build Tools

- **[BrowserSync](https://browsersync.io/)** 3.0.3 - Live reload
- **[Terser](https://terser.org/)** - JavaScript minification
- **[CleanCSS](https://github.com/clean-css/clean-css)** - CSS minification
- **[Autoprefixer](https://github.com/postcss/autoprefixer)** - CSS vendor prefixes

### Code Quality

- **[Prettier](https://prettier.io/)** - Code formatter
- **[ESLint](https://eslint.org/)** - JavaScript linter
- **[Husky](https://typicode.github.io/husky/)** - Git hooks
- **[lint-staged](https://github.com/okonet/lint-staged)** - Staged file linting

### Animations & 3D Graphics

- **[Three.js](https://threejs.org/)** r134 - 3D graphics library
- **[Vanta.js](https://www.vantajs.com/)** 0.5.24 - Animated 3D backgrounds
  - NET effect for Cyberpunk theme (SP)
  - BIRDS effect for Harry Potter theme (DB)
- **[Typed.js](https://github.com/mattboldt/typed.js/)** 2.1.0 - Terminal typing
- **[Highlight.js](https://highlightjs.org/)** 11.9.0 - Syntax highlighting

### Fonts

- **Orbitron** - Headings (cyberpunk style)
- **Chakra Petch** - Body text (Cyrillic support)
- **Share Tech Mono** - Code blocks

---

## 🎯 Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ⚠️ Mobile: Responsive design included

---

## 📦 Production Build

```bash
# Build optimized version
npm run build:prod

# Output in dist/
dist/
├── index.html              # Landing (minified)
├── sp/
│   ├── index.html          # Track index
│   └── lectures/lectureN.html
├── db/
│   ├── index.html          # Track index
│   └── lectures/lectureN.html
└── static/ ...             # Static assets
```

**Optimizations:**

- ✅ HTML/CSS/JS minification
- ✅ Autoprefixer
- ✅ Console stripping
- ✅ File size reporting

---

## 🐛 Troubleshooting

### Build fails with lint errors

```bash
npm run validate      # Check what's wrong
npm run lint:fix      # Auto-fix
npm run format        # Format code
npm run build         # Rebuild
```

### BrowserSync won't start

```bash
killall node          # Kill existing processes
npm run clean         # Clean dist/
npm start             # Restart
```

### Typed.js animation not working

- Check browser console for errors
- Verify `lectureNumber` is unique in JSON
- Clear browser cache

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 👨‍💻 Author

**VTFK Education Team**

- Repository: [AlexOrd/obd-sp](https://github.com/AlexOrd/obd-sp)
- Course: Основи Баз Даних та Спеціалізовані мови програмування

---

## 🙏 Acknowledgments

- [Reveal.js](https://revealjs.com/) - Amazing presentation framework
- [Three.js](https://threejs.org/) - Powerful 3D graphics library
- [Vanta.js](https://www.vantajs.com/) - Beautiful animated 3D backgrounds
- [Cyberpunk 2077](https://www.cyberpunk.net/) - Cyberpunk theme design inspiration
- [Harry Potter](https://www.wizardingworld.com/) - Magical theme design inspiration
- [Typed.js](https://mattboldt.com/demos/typed-js/) - Terminal animations
- [Gulp](https://gulpjs.com/) - Build automation

---

<div align="center">

**Made with** 💜 **and** ⚡ **cyberpunk aesthetics**

</div>
