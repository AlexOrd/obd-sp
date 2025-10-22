# 🎓 OBD-SP | Cyberpunk Education Platform

> **Основи Баз Даних та Спеціалізовані мови програмування**
> Modern educational presentation system with Reveal.js and Cyberpunk 2077 aesthetics

[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Code Style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io/)

---

## 📖 Table of Contents

- [Features](#-features)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Creating Lectures](#-creating-lectures)
- [Slide Types](#-slide-types)
- [Development](#-development)
- [Code Quality](#-code-quality)
- [Technologies](#-technologies)
- [License](#-license)

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

### � **Modern Build System**

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
│   │   ├── index.mustache              # Main page template
│   │   ├── lecture-slide.mustache      # Lecture wrapper
│   │   └── slides/                     # Individual slide types (14 templates)
│   ├── data/
│   │   ├── lectures.json               # Lectures list
│   │   └── lectures/
│   │       ├── lecture0.json          # Demo lecture (all slide types)
│   │       └── lecture1.json          # Your lectures
│   ├── css/
│   │   ├── cyberpunk-theme.css        # Reveal.js theme
│   │   └── main.css                   # Index page styles
│   ├── js/                            # JavaScript files
│   └── images/                        # Static assets
├── dist/                              # Built files (auto-generated)
├── gulpfile.js                        # Build configuration
├── package.json                       # Dependencies & scripts
├── .prettierrc.json                   # Code formatting rules
├── eslint.config.js                   # Linting rules
└── README.md                          # This file
```

---

## 📝 Creating Lectures

### Step 1: Create Lecture Data File

Create a new JSON file in `src/data/lectures/`:

```json
// src/data/lectures/lecture2.json
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
      "title": "What is SQL?",
      "term": "SQL",
      "definition": "Structured Query Language for managing databases",
      "analogy": "SQL is like a universal language for talking to databases"
    }
  ]
}
```

### Step 2: Add to Lectures List

Edit `src/data/lectures.json`:

```json
{
  "lectures": [
    { "number": "0", "title": "Демо всіх типів слайдів" },
    { "number": "1", "title": "Вступ до баз даних" },
    { "number": "2", "title": "SQL Basics" } // Add your lecture
  ]
}
```

### Step 3: Build

```bash
npm run build
```

Your lecture will be generated at `dist/lectures/lecture2.html`

### Step 4: View

Open `http://localhost:3000` and click on your lecture, or navigate directly to `http://localhost:3000/lectures/lecture2.html`

---

## 🎬 Slide Types

### Basic Slides

| Type               | Description                  | Use Case       |
| ------------------ | ---------------------------- | -------------- |
| `title`            | Lecture title page           | Opening slide  |
| `roadmap`          | Lecture plan with checkboxes | Outline topics |
| `previous-lecture` | Recap of previous material   | Review         |
| `summary`          | Key takeaways with stars     | Conclusion     |
| `next-steps`       | Resources and next lecture   | Closing        |

### Content Slides

| Type             | Description                      | Use Case             |
| ---------------- | -------------------------------- | -------------------- |
| `definition`     | Term + definition + analogy      | Concepts             |
| `syntax`         | Syntax breakdown with highlights | Language features    |
| `code-example`   | Code block with description      | Examples             |
| `code-breakdown` | Code + step-by-step explanation  | Detailed walkthrough |
| `diagram`        | ASCII art + labels               | Visual explanations  |

### Advanced Slides

| Type             | Description                            | Use Case           |
| ---------------- | -------------------------------------- | ------------------ |
| `live-coding`    | **Animated terminal + 3 action items** | Interactive coding |
| `comparison`     | Two-column comparison boxes            | Contrasts          |
| `debugger`       | Code + GDB commands                    | Debugging          |
| `common-mistake` | Wrong vs correct code                  | Error prevention   |

### Example: Live Coding Slide

```json
{
  "type": "live-coding",
  "title": "💻 Practice: Database Creation",
  "description": "Let's create a library database together",
  "actionItems": [
    "Create tables with PRIMARY KEYs",
    "Add FOREIGN KEY relationships",
    "Write JOIN queries for book search"
  ]
}
```

**Features:**

- ✨ Typed.js terminal animation (git, npm, gcc commands)
- 🎨 Glowing terminal with macOS-style header
- 📝 Exactly 3 action items with pixel art checkboxes
- ⌨️ Animated keyboard keys

> 📖 **Full documentation**: See `SLIDE_TYPES_GUIDE.md` for all slide types and properties

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

The dev server watches:

- ✅ Templates (`.mustache`)
- ✅ Data files (`.json`)
- ✅ Styles (`.css`)
- ✅ Scripts (`.js`)
- ✅ Images

Changes trigger automatic rebuild and browser refresh.

---

## 🎨 Code Quality

### Prettier

**Configuration**: `.prettierrc.json`

```bash
npm run format          # Auto-format all files
npm run format:check    # Check without modifying
```

**Rules:**

- Single quotes for JS
- 2-space indentation
- 100 char line width
- Semicolons always
- ES5 trailing commas

### ESLint

**Configuration**: `eslint.config.js`

```bash
npm run lint            # Check for errors
npm run lint:fix        # Auto-fix issues
```

**Rules:**

- ✅ No `var` (use `const`/`let`)
- ✅ Prefer `const` over `let`
- ✅ Strict equality (`===`)
- ✅ Template strings preferred
- ✅ Arrow function spacing

### Build Integration

Production builds **automatically**:

1. ✅ Lint JavaScript
2. ✅ Check code formatting
3. ❌ **Fail build** if issues found

### Git Hooks (Husky)

**Pre-commit hook** runs automatically before every commit:

1. ✅ **lint-staged** - Run ESLint & Prettier on staged files only
2. ✅ **Production build** - Ensure code builds successfully
3. ❌ **Prevent commit** if errors found

**Configuration**: `.husky/pre-commit`

```bash
# Manually run pre-commit checks
npx lint-staged
npm run build:prod
```

**Benefits:**

- 🛡️ Prevents broken code from being committed
- ⚡ Fast - only checks staged files
- 🎯 Catches errors before they reach the repository
- 🔒 Enforces code quality standards

### VS Code Integration

**Auto-format on save** enabled via `.vscode/settings.json`

**Recommended Extensions:**

- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

> 📖 **Full documentation**: See `CODE_QUALITY.md`

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
- **[Husky](https://typicode.github.io/husky/)** - Git hooks automation
- **[lint-staged](https://github.com/okonet/lint-staged)** - Run linters on staged files

### Animations

- **[Typed.js](https://github.com/mattboldt/typed.js/)** 2.1.0 - Terminal typing animation
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
├── css/
│   ├── cyberpunk-theme.css  # Minified, prefixed
│   └── main.css             # Minified, prefixed
└── js/                      # Minified, console removed
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
# Check what's wrong
npm run validate

# Auto-fix what's possible
npm run lint:fix
npm run format

# Rebuild
npm run build
```

### BrowserSync won't start

```bash
# Kill existing processes
killall node

# Clean and restart
npm run clean
npm start
```

### Slides don't fit screen

- Slides already optimized with `font-size: 0.9em`
- Code examples are `1.15em` (15% bigger)
- Check browser zoom (should be 100%)

### Typed.js animation not working

- Check browser console for errors
- Verify `lectureNumber` is unique in JSON
- Clear browser cache

---

## � License

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

## 📚 Additional Documentation

- **Slide Types Guide**: `SLIDE_TYPES_GUIDE.md` - Complete reference for all 14 slide types
- **Code Quality**: `CODE_QUALITY.md` - Prettier & ESLint setup details
- **Setup Summary**: `SETUP_SUMMARY.md` - Installation and configuration log

---

<div align="center">

**Made with** 💜 **and** ⚡ **cyberpunk aesthetics**

</div>
