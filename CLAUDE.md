# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install            # required first — node_modules is not committed (Node 22, see .nvmrc)
npm start              # build once, then BrowserSync dev server on :3000 + watch
npm run dev            # dev server + watch WITHOUT a preceding build (stale dist/ if never built)
npm run build          # clean → validate → build → minify (prod only) → checkLinks
npm run build:prod     # same with NODE_ENV=production (minification, console stripping)
npm run validate       # gulp lint (ESLint) + gulp check (Prettier --check)
npm run lint:fix       # ESLint --fix on src/**/*.js + gulpfile.js
npm run format         # Prettier --write across src/, sp/, db/, gulpfile.js
npm run clean          # delete dist/
```

There is no test suite. "Verifying a change" means running `npm run build` and inspecting the
generated file under `dist/`.

Individual gulp tasks are exported from `gulpfile.js` and runnable directly, which is much faster
than a full build when iterating on one track:

```bash
npx gulp buildSPLectures     # regenerate only dist/sp/lectures/*.html
npx gulp buildDBLectures
npx gulp buildSPCSS          # buildDBCSS, buildSharedCSS, buildLanding, copySingle, copyStatic, ...
npx gulp checkLinks          # resolve every local href/src in dist/ (needs a build first)
```

**The build does not modify your source.** It _verifies_ formatting via `validate` and fails on
unformatted code rather than silently rewriting it. Run `npm run format` yourself. A build leaves
the working tree clean — if it doesn't, that's a bug.

**The build fails on dead internal links.** `checkLinks` resolves every local `href`/`src` in
`dist/` and fails the build listing any that don't exist. A lecture registered in `lectures.json`
with a wrong `file` value is a build error, not a silent 404.

**There is no PDF export.** It was removed: the scripts invoked a `gulp pdf` task that never
existed, `isPrintVersion` was read by no template, and `print-theme.css` was linked by no HTML.
`static/pdfs/lecture1.pdf` is unrelated and still served.

## Architecture

A static site generator: **JSON lecture data + Mustache templates → HTML**, orchestrated entirely by
`gulpfile.js`. There is no framework and no runtime data fetching; every page is fully rendered at
build time. Reveal.js, Three.js/Vanta.js, Typed.js and Highlight.js are loaded from CDNs in the
templates.

### Dual-track structure

Two independent, deliberately parallel content trees that share only the build system:

|         | SP track                                                             | DB track                                                           |
| ------- | -------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Subject | Спеціалізовані мови програмування (Assembly, NASM, Rust, Docker)     | Основи баз даних (SQL, NoSQL)                                      |
| Theme   | Cyberpunk 2077 — cyan `#00f0ff`, yellow `#fcee0a`, magenta `#ff00ff` | Harry Potter — scarlet `#740001`, gold `#d3a625`, purple `#6b2d5c` |
| Source  | `sp/`                                                                | `db/`                                                              |
| Output  | `dist/sp/`                                                           | `dist/db/`                                                         |

`sp/` and `db/` each contain a **complete** `data/`, `templates/` (including a full 19-file
`templates/slides/` set), `css/` and `images/`. The two trees are near-identical by design — the
slide partials are per-track so each theme can style its own markup. **A change to one track's
slide partial does not affect the other.** Decide explicitly whether a change is one-track or both.

`gulpfile.js` mirrors this: `buildSPIndex`/`buildDBIndex`, `buildSPLectures`/`buildDBLectures`,
`buildSPCSS`/`buildDBCSS`, `buildSPImages`/`buildDBImages` are duplicated pairs, not parameterized.
Editing lecture-generation logic means editing both copies.

### Rendering pipeline for a lecture

`buildSPLectures` / `buildDBLectures` (`gulpfile.js`) do the interesting work:

1. Read every `[track]/data/lectures/*.json`, skipping files starting with `_` (so `_template.json`
   is never built).
2. Load every file in `[track]/templates/slides/` as a Mustache partial named `slides/<basename>`.
3. Read `[track]/data/lectures.json` — the track-level layout data (site title, teacher, SEO,
   social links, and the `lectures[]` index used by the track index page).
4. **Map each slide's `type` string to a boolean flag** (`"code-example"` → `isCodeExample: true`).
   Mustache is logic-less and cannot compare strings, so this flag map is the dispatch mechanism.
5. Render `[track]/templates/lecture-slide.html` with `{...layoutData, lecture: lectureData}`. That
   wrapper contains a chain of `{{#isX}} {{> slides/x}} {{/isX}}` sections.

Each lecture's stream is awaited, so the task genuinely completes before the next one starts.

Consequence: **adding a slide type requires four coordinated edits per track** — the partial file,
the flag in the builder's map, the `{{#isX}}` section in `lecture-slide.html`, and theme CSS. Miss
the flag or the section and the slide silently renders as nothing; there is no validation and no
error. See the `adding-slide-type` skill.

### Mermaid diagrams (fragile — read before touching)

`diagram` slides render through Mermaid, loaded from CDN in `lecture-slide.html`. Three constraints
are load-bearing; breaking any one silently produces unreadable diagrams rather than an error:

1. **Render only when the slide is visible.** Mermaid cannot measure text inside a `display: none`
   slide, so every node collapses to a 16×16px box. `renderVisibleDiagrams()` runs on Reveal's
   `ready` and `slidechanged`, guarded by `dataset.rendered`. Never move it back to a single
   `ready` call.
2. **Read the source by walking child nodes, not `textContent`.** The `<br/>` in `mermaidCode`
   parses into real DOM `<br>` elements, and `textContent` silently concatenates label lines.
3. **Neutralise Reveal's transform during render.** Reveal scales `.slides`; Mermaid measures with
   `getBoundingClientRect()` (post-transform) but sizes boxes in untransformed SVG units, so
   labels clip by ~5%. The handler sets `transform: none` and restores it after.

Diagram colours are pinned per track (`MONO`), not derived from `prefers-color-scheme` — the deck
theme is fixed regardless of the viewer's OS. The `%%{init}%%` directive and per-node `fill:`
overrides carried in the lecture JSON are stripped at render time so the page theme wins; lecture
content is never edited to achieve this.

### Other build inputs

- **Landing page** — `src/templates/landing.html` → `dist/index.html` (Vanta.js split-screen,
  NET effect for SP / BIRDS for DB). `src/css/` and `src/js/` → `dist/css/`, `dist/js/`.
- **Single pages** — `single/<name>/` is copied verbatim to `dist/<name>/`. Hand-written standalone
  HTML (`game`, `glowjelly`, `hydropump`, `jinglecell`, `coursework`, `tg_bot`), no templating, no
  linting, no formatting.
- **Static assets** — `static/` → `dist/static/` (PDFs, downloads).

### Legacy, not built

`index.html`, `js/main.js` and `lectures/` at the repo root predate the dual-track refactor. They
are in no gulp glob and never reach `dist/`. Do not edit them expecting an effect; the live landing
page is `src/templates/landing.html`.

## Conventions

- **Lecture content is Ukrainian.** Titles, descriptions, explanations, slide text. Code, JSON keys,
  file names, comments and documentation stay English.
- **Never edit `dist/`.** It is deleted by `clean` on every build.
- **Only the 19 documented slide types** exist (`title`, `roadmap`, `previous-lecture`, `definition`,
  `syntax`, `code-example`, `code-breakdown`, `diagram`, `comparison`, `debugger`, `common-mistake`,
  `summary`, `next-steps`, `live-coding`, `content`, `list`, `table`, `timeline`, `quiz`). An
  unrecognized `type` produces an empty slide, not an error.
- **A lecture is invisible until registered** in `[track]/data/lectures.json` under `lectures[]`.
  The JSON file alone builds an HTML page but nothing links to it.
- **No ad-hoc styles.** Use the CSS variables and classes in `[track]/css/`.
- Prettier: 100 cols, 2 spaces, single quotes in JS, semicolons, LF. ESLint: no `var`, prefer
  `const`, `===`. Husky + lint-staged run these on commit.
- Lecture JSON is excluded from the gulp `format` task but _is_ covered by lint-staged's
  `*.{json,css,md}` rule, so committing reformats it.

## Deployment

Push to `master` → `.github/workflows/deploy.yml` runs `npm run build:prod` on Node 22 and publishes
`dist/` to the `gh-pages` branch with CNAME `vtfk.ordynski.com`. Live at
https://alexord.github.io/obd-sp/ and https://vtfk.ordynski.com. See `DEPLOYMENT.md`.

## Reference docs

- `SLIDE_TYPES_GUIDE.md` — JSON schema and example for each of the 19 slide types.
- `AI_LECTURE_CREATION.md` — the prescribed 23-slide pedagogical lecture structure.
- `AI_PROJECT_SUMMARY.md` — architecture summary.
- `LECTURES_SUMMARY.md` — the current lecture inventory for both tracks.
- `CODE_QUALITY.md`, `DEPLOYMENT.md`, `ANALYTICS_STRATEGY.md` (GA events on `single/game/`).
