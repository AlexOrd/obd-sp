# AI Project Summary & Technical Context

> **Note to AI Agents:** This file serves as the primary source of truth for understanding the project's architecture, logic, and development rules. Read this before making changes.

## 1. Project Identity

**Name:** OBD-SP (Основи Баз Даних та Спеціалізовані мови програмування)
**Type:** Dual-Track Education Platform
**Purpose:** A presentation system for university lectures with two distinct thematic tracks.
**Language:** Ukrainian (Content), English (Code/Docs).

## 2. Core Architecture (Dual-Track System)

The project is strictly divided into two independent tracks sharing a common build system.

### Track 1: SP (System Programming)

- **Theme:** Cyberpunk 2077 (Neon, Glitch, Terminal).
- **Colors:** Cyan (`#00f0ff`), Yellow (`#fcee0a`), Magenta (`#ff00ff`).
- **Content:** C/C++, Memory Management, Systems.
- **Directory:** `sp/`

### Track 2: DB (Databases)

- **Theme:** Harry Potter (Magical, Parchment, Gold).
- **Colors:** Scarlet (`#740001`), Gold (`#d3a625`), Purple (`#6b2d5c`).
- **Content:** SQL, NoSQL, Database Design.
- **Directory:** `db/`

## 3. Technical Stack

- **Runtime:** Node.js (>=18.0.0)
- **Build System:** Gulp 5.0 (Task automation)
- **Templating:** Mustache (Logic-less templates)
- **Presentation:** Reveal.js 5.0.4
- **Styling:** Vanilla CSS (Track-specific themes)
- **Animations:** Three.js, Vanta.js, Typed.js

## 4. Project Structure

```
obd-sp/
├── src/                    # Shared resources (Landing page, global assets)
├── sp/                     # SP Track Source
│   ├── data/               # JSON Data (Lectures, List)
│   ├── templates/          # Mustache Templates
│   ├── css/                # Cyberpunk Theme CSS
│   └── images/             # SP Assets
├── db/                     # DB Track Source
│   ├── data/               # JSON Data (Lectures, List)
│   ├── templates/          # Mustache Templates
│   ├── css/                # Harry Potter Theme CSS
│   └── images/             # DB Assets
├── dist/                   # Build Output (Do not edit directly)
├── gulpfile.js             # Main Build Logic
└── package.json            # Dependencies
```

## 5. Data-Driven Generation Logic

Lectures are generated from JSON data files using Mustache templates. **Never edit HTML files in `dist/` directly.**

### Flow

1.  **Source:** `[track]/data/lectures/lectureN.json` (Content)
2.  **Layout:** `[track]/data/lectures.json` (Global Metadata)
3.  **Template:** `[track]/templates/lecture-slide.html` (Wrapper) + `src/templates/slides/*.html` (Partials)
4.  **Build:** `gulp` task merges JSON + Templates
5.  **Output:** `dist/[track]/lectures/lectureN.html`

### Creating a New Lecture

1.  **Create JSON:** `[track]/data/lectures/lectureN.json`.
2.  **Register:** Add entry to `[track]/data/lectures.json`.
3.  **Build:** Run `npm run build`.

## 6. Key Documentation Files

- **`README.md`**: General overview and setup.
- **`AI_LECTURE_CREATION.md`**: Specific guide for AI agents to generate lecture content.
- **`SLIDE_TYPES_GUIDE.md`**: JSON schemas for all 14 available slide types.
- **`gulpfile.js`**: The source of truth for build logic.

## 7. Development Rules for AI

1.  **Content Language:** ALWAYS use **Ukrainian** for lecture titles, descriptions, and explanations.
2.  **File Paths:** Respect the strict separation of `sp/` and `db/` directories.
3.  **JSON Validity:** Ensure generated JSON is valid (no trailing commas).
4.  **Slide Types:** Use only the 14 supported slide types defined in `SLIDE_TYPES_GUIDE.md`.
5.  **Build Verification:** Always run `npm run build` (or `gulp build`) after modifying data or templates to verify integrity.
6.  **No Ad-Hoc Styles:** Use existing CSS variables and classes defined in `[track]/css/`.

## 8. Common Commands

- `npm start`: Dev server with live reload (localhost:3000).
- `npm run build`: Production build.
- `npm run validate`: Check code quality (Prettier + ESLint).
