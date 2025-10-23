# 🎓 OBD-SP | Cyberpunk Education Platform

> **Основи Баз Даних та Спеціалізовані мови програмування**
> Modern educational presentation system with Reveal.js and Cyberpunk 2077 aesthetics

[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Code Style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io/)

---

## 📚 Documentation

- **[AI_LECTURE_CREATION.md](AI_LECTURE_CREATION.md)** - Guide for creating new lectures (for AI agents)
- **[SLIDE_TYPES_GUIDE.md](SLIDE_TYPES_GUIDE.md)** - Complete reference for all 14 slide types (Ukrainian)
- **[CODE_QUALITY.md](CODE_QUALITY.md)** - Code formatting, linting, and quality standards

---

## 📖 Table of Contents

- [Features](#-features)
- [Quick Start](#-quick-start)
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

### 📚 **14 Slide Types**

- Title, Roadmap, Definition, Code Examples
- Live Coding with animated terminal
- Step-by-step code breakdown
- Debugger workflows, Common mistakes
- Diagrams, Comparisons, Summaries

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

## 📁 Project Structure

```
obd-sp/
├── src/
│   ├── templates/
│   │   ├── index.html              # Main page template
│   │   ├── lecture-slide.html      # Lecture wrapper
│   │   └── slides/                 # 14 slide type templates
│   ├── data/
│   │   ├── lectures.json           # Lectures list
│   │   └── lectures/
│   │       ├── _template.json      # Template for new lectures
│   │       ├── lecture0.json       # Demo (all slide types)
│   │       └── lecture1.json       # Your lectures
│   ├── css/                        # Stylesheets
│   ├── js/                         # JavaScript files
│   └── images/                     # Static assets
├── dist/                           # Built files (auto-generated)
├── gulpfile.js                     # Build configuration
└── package.json                    # Dependencies & scripts
```

---

## 📝 Creating Lectures

### Quick Steps

1. **Create lecture data file**: `src/data/lectures/lectureN.json`
2. **Add to lectures list**: Edit `src/data/lectures.json`
3. **Build**: Run `npm run build`
4. **View**: Open `http://localhost:3000`

### Example Lecture

```json
{
  "lectureNumber": "2",
  "lectureTitle": "SQL Basics",
  "courseTitle": "Основи Баз Даних",
  "year": "2025",
  "slides": [
    {
      "type": "title",
      "title": "ЛЕКЦІЯ 2",
      "subtitle": "SQL Basics",
      "meta": {
        "course": "Основи Баз Даних",
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

**Note**: All lecture content must be in **Ukrainian**.

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

### Animations

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
├── index.html              # Minified
├── lectures/
│   ├── lecture0.html      # Minified
│   └── lecture1.html      # Minified
├── css/                    # Minified, prefixed
└── js/                     # Minified, console removed
```

**Optimizations:**

- ✅ HTML minification
- ✅ CSS minification (level 2)
- ✅ JS minification with Terser
- ✅ Console statements removed
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
- [Cyberpunk 2077](https://www.cyberpunk.net/) - Design inspiration
- [Typed.js](https://mattboldt.com/demos/typed-js/) - Terminal animations
- [Gulp](https://gulpjs.com/) - Build automation

---

<div align="center">

**Made with** 💜 **and** ⚡ **cyberpunk aesthetics**

</div>
