# Technical Remediation — Design

**Date:** 2026-08-29
**Status:** Approved for planning
**Scope:** Correctness and tooling defects found in the 2026-08-29 architecture audit, plus removal of the PDF pipeline.

## Goal

Fix every defect that affects how the site behaves or how the project is built, and delete the
half-wired PDF export. Explicitly out of scope: the SP/DB track-factory refactor (audit finding 6),
the image pipeline (finding 8), and PR CI (finding 9). Those remain open.

## Non-goals

- No restructuring of the dual-track build. The 99.8% duplication between the SP and DB task blocks
  stays; every change below is applied symmetrically to both copies by hand.
- No edits to lecture content. All 46 `lectureN.json` files are untouched.
- No migration off Gulp.
- `static/pdfs/lecture1.pdf` is retained. Only the _generator_ is removed, not existing content.

## Constraints

- The build must stay under ~3s.
- Slide counts in generated HTML must continue to match slide counts in the source JSON exactly.
- Both tracks must be verified independently. A fix passing on SP proves nothing about DB.

---

## 1. Mermaid diagram rendering

**Problem.** All 50 Mermaid diagrams (53 `diagram` slides across 34 of 46 lectures) render as
16x16px blobs. Three distinct defects are stacked; the first hides the other two.

### 1a. Collapse (the visible bug)

`mermaid.run()` fires once inside `Reveal.on('ready')`. Every diagram slide is a `section.future`
with `display: none` at that moment, so Mermaid cannot measure text, every node collapses, and the
SVG is emitted as `viewBox="-8 -8 16 16"`. `data-processed="true"` then blocks any retry.

**Verified during design:** `flowchart: { useMaxWidth: false }` alone does _not_ fix this — the
failure is in Mermaid's layout pass, not its sizing pass. The diagram must be rendered while its
slide is visible.

**Fix.** In both `sp/templates/lecture-slide.html` and `db/templates/lecture-slide.html`, replace the
single `ready` handler with lazy per-slide rendering:

```js
function renderVisibleDiagrams() {
  const slide = Reveal.getCurrentSlide();
  if (!slide) return;
  const nodes = [...slide.querySelectorAll('.mermaid')].filter((n) => !n.dataset.rendered);
  if (!nodes.length) return;
  nodes.forEach((n) => (n.dataset.rendered = '1'));
  window.mermaid.run({ nodes });
}
Reveal.on('ready', renderVisibleDiagrams);
Reveal.on('slidechanged', renderVisibleDiagrams);
```

`ready` is retained so a diagram on the first slide still renders. The `dataset.rendered` guard makes
the handler idempotent, so revisiting a slide costs nothing.

**Verified during design:** this produces `viewBox="0 0 630 233"` with 8 real nodes on
`sp/lecture5`, against `-8 -8 16 16` before.

### 1b. Scale

Once rendering correctly, diagrams occupy roughly 45% of the available width and the labels are too
small to read from the back of a lecture hall.

**Fix.** Set `flowchart: { useMaxWidth: false }` in the Mermaid config so the SVG carries its
intrinsic width, and add a CSS guard so oversized diagrams still fit:

```css
.mermaid {
  display: block;
  width: 100%;
  text-align: center;
}
.mermaid svg {
  max-width: 100%;
  height: auto;
}
```

**Verified during design:** 601x222 rendered, up from 286x106.

### 1c. Contrast

The page-level config in `lecture-slide.html` is already correct: it sets all fills to `transparent`
and text, borders and lines to a single `mono` colour, which suits both a dark SP deck and a light DB
deck.

The problem is that the lecture data overrides it. **48 of 50 diagrams** carry a
`%%{init: {"theme": "neutral"}}%%` directive in `mermaidCode`, which takes precedence over
`mermaid.initialize()`. **17 of those** additionally hardcode per-node `style NODE fill:#RRGGBB`
with light values. On a dark-mode OS the page config resolves `mono` to `#ffffff`, so the result is
white text on a near-white box.

Two mechanisms considered and rejected during design:

- Exempting diagrams from the CRT scanline. The scanline is `.reveal::before` — a fixed, full-screen,
  `z-index: 1000` overlay (`sp/css/cyberpunk-theme.css:380`). It cannot be disabled per element, and
  it is not the cause: every other element's text reads fine through it.
- Editing the 48 diagram sources in the lecture JSON. Rejected as out of scope — content stays
  untouched.

**Fix.** Normalise the diagram source at render time, inside `renderVisibleDiagrams`, before calling
`mermaid.run()`: strip the `%%{init ... }%%` directive and any per-node `style ... fill:#RRGGBB`
declaration from the element's text content. Every diagram then inherits the page's per-track theme
uniformly, and no lecture file changes.

Additionally, replace the `prefers-color-scheme` branch that computes `mono`. Deck themes are fixed
per track — SP is always dark, DB is always light — so deriving diagram colours from the _viewer's_
OS preference is incorrect regardless of the override problem. Each track's template hardcodes its
own value.

**Implementation note.** 1c's stripping approach is the one part of this section not yet empirically
verified. Verify it in the browser on a diagram from each track before applying it to both templates.
If stripping proves insufficient for the 17 hardcoded-fill diagrams, fall back to pinning
`nodeTextColor` to a dark value that reads against those light fills, and record the decision here.

### Files touched

- `sp/templates/lecture-slide.html`, `db/templates/lecture-slide.html`
- `sp/css/cyberpunk-theme.css`, `db/css/harry-potter-theme.css` (the `.mermaid` sizing guard)

---

## 2. Landing page links

**Problem.** A link check across all 333 local references in `dist/` found 47 broken, every one on
`index.html`. `src/templates/landing.html` hardcodes `href="sp/lecture0.html"`, but lectures build to
`dist/sp/lectures/lecture0.html`. The `lectures/` path segment is missing. One further link,
`db/lecture22.html`, points at a lecture that does not exist in any location.

Data-driving the landing page from `lectures.json` was considered and rejected for now: the landing
page is an English, module-grouped view, while `lectures.json` holds Ukrainian titles and has no
module field. Generating it would require inventing both a module taxonomy and an English title for
every lecture — a content-model decision, not a bug fix.

**Fix, part 1.** Correct the 46 recoverable hrefs to include `lectures/`, and delete the
`db/lecture22.html` list item.

**Fix, part 2.** Add a `checkLinks` Gulp task, appended to the `build` series after `htmlMinify`. It
walks every `dist/**/*.html`, resolves each local `href` and `src` (skipping protocol-relative,
absolute-URL, `#`, `data:`, `mailto:` and `javascript:` values), and fails the build with a list of
every reference whose target does not exist. Directory targets resolve to `index.html`.

No new dependency — Node's `fs` and `path` are sufficient. Roughly 40 lines.

This is what makes the fix durable: the hardcoded list stays, but it can no longer drift silently.

### Files touched

- `src/templates/landing.html`
- `gulpfile.js` (new `checkLinks` task, added to the `build` series)

---

## 3. PDF pipeline removal

**Problem.** `npm run pdf` and `npm run build:pdf` invoke `gulp pdf`, which does not exist. The
supporting machinery around it is entirely inert:

- `isPrintVersion: true` is passed to Mustache but **no template reads it**, so all 46
  `lectureN-print.html` files are byte-identical duplicates of the normal decks.
- `print-theme.css` exists byte-identically in `sp/`, `db/` and `src/` and is **linked from no HTML**.
- Puppeteer costs 12 MB in `node_modules` and pulls a 507 MB Chrome into `~/.cache/puppeteer`.

**Fix.** Delete:

- the `pdf` and `build:pdf` scripts from `package.json`
- the `puppeteer` devDependency
- both print-variant stream blocks in `gulpfile.js` (SP and DB)
- `sp/css/print-theme.css`, `db/css/print-theme.css`, `src/css/print-theme.css`

**Retained:** `static/pdfs/lecture1.pdf` and the `static/pdfs/` directory. Removing a generator does
not justify deleting existing published content.

`~/.cache/puppeteer` is outside the repository and is left for the developer to remove manually.

### Files touched

- `package.json`, `package-lock.json`, `gulpfile.js`
- three `print-theme.css` deletions

---

## 4. Build correctness

### 4a. Fire-and-forget streams

`buildSPLectures` and `buildDBLectures` start 24 and 22 unawaited `gulp.src(...).pipe(...)` streams
inside a `forEach`, then call `done()` synchronously. Gulp reports the task complete before any file
is written. The race is currently masked only because the one task running after it in series,
`htmlMinify`, excludes both lecture directories.

**Fix.** Collect each stream and await them all before calling `done()` — or convert the task to an
`async` function returning a `Promise.all`. Also hoist the `lectures.json` read out of the per-file
loop; it currently re-reads the same file 24 times per track.

### 4b. The build mutates the working tree

The `build` series runs `format`, which pipes source through Prettier and writes it back. A build
should verify formatting, not silently change it — `validate` (`lint` + `check`) already verifies.

**Fix.** Remove `format` from the `build` series. `validate` stays.

**Behaviour change:** `npm run build` will no longer rewrite source files, and will now _fail_ on
unformatted code instead of quietly fixing it. `npm run format` remains available and is the intended
way to format. This is the only change in this document that a developer will feel day to day.

### 4c. Pre-commit hook

`.husky/pre-commit` runs `lint-staged` and then a full `npm run build:prod`. Because that build
includes `format`, it rewrites files _after_ they have been staged, and the rewrites are never
re-staged — so a commit can ship content differing from what the build just formatted. It also adds a
full clean rebuild to every commit.

**Fix.** Drop `build:prod` from the hook. `lint-staged` remains. Note that 4b alone does not fully
resolve this: the hook must be changed too.

### Files touched

- `gulpfile.js`, `.husky/pre-commit`

---

## 5. Tooling hygiene

### 5a. ESLint

`eslint.config.js` never extends `js.configs.recommended`. It configures stylistic rules while
leaving ESLint's core correctness rules off, so `npm run lint` passes green on a file containing real
bugs.

**Fix.** Add `js.configs.recommended` as the first entry in the flat config, keeping the existing
custom rules after it so they still win.

**Then fix what it surfaces:**

- `gulpfile.js:221` and `gulpfile.js:365` — `isCodeExample` is declared twice in each flag map. The
  second declaration wins, making `"type": "code"` an undocumented alias for `code-example`. Collapse
  each pair into one entry preserving the `||` alias behaviour, so no existing lecture breaks.
- `gulpfile.js:560` — two unnecessary escape characters.
- `sp/templates/lecture-slide.html:133-134` — `center: true` declared twice in the Reveal config.
  Remove the duplicate. Check `db/` for the same.

### 5b. Node version

`engines` says `>=18.0.0`, CI pins `22`, local development runs `24.11.1`. Three majors can build the
same site.

**Fix.** Add `.nvmrc` containing `22`. Raise `engines.node` to `>=22.0.0`. Change
`.github/workflows/deploy.yml` to read the version from `.nvmrc` via
`node-version-file: .nvmrc` rather than hardcoding `'22'`.

### 5c. gitignore

`.gitignore` lists `*.db` under "OS files", intending `Thumbs.db`. On a repository teaching database
fundamentals this silently ignores any SQLite sample committed for an exercise.

**Fix.** Narrow the pattern to `Thumbs.db`.

### Files touched

- `eslint.config.js`, `gulpfile.js`, `sp/templates/lecture-slide.html`,
  `db/templates/lecture-slide.html`, `.nvmrc` (new), `package.json`,
  `.github/workflows/deploy.yml`, `.gitignore`

---

## 6. Documentation

Three documents describe behaviour this work changes and become wrong on merge:

- `CLAUDE.md` — documents that `npm run pdf` is broken (removed by §3) and that `npm run build`
  rewrites source files (changed by §4b). Both sections need rewriting. Add the new `checkLinks`
  task and the Node 22 requirement.
- `.claude/skills/creating-lecture/SKILL.md` — its Notes section states that `npm run build`
  reformats source via Prettier.
- `CODE_QUALITY.md` — describes Husky as optional and "to be installed", when it has been wired up
  for some time; and documents the pre-commit hook's old behaviour.

---

## Verification

Run after implementation, in this order. Each is a gate, not a suggestion.

1. `npm run build:prod` completes with no errors, in under ~3s.
2. `checkLinks` reports **zero** broken references. This is the acceptance test for §2.
3. Generated `<section>` counts still match source JSON slide counts for a sample across both
   tracks — proves §4a did not drop any lecture.
4. `ls dist/**/lectures/*-print.html` returns nothing; no `print-theme.css` anywhere in `dist/`.
5. `npm run lint` passes green under the stricter config, and reports the duplicate-key errors
   _before_ they are fixed (confirming the config actually took effect).
6. Browser check, **both tracks independently**: a diagram slide renders at readable size with legible
   labels; navigating away and back does not re-render or flicker; a deck whose first slide is a
   diagram renders it on load.
7. `npm ci` no longer installs Puppeteer.
8. `git status` is clean after a build — proves §4b.

## Risks

| Risk                                                              | Mitigation                                                                                               |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| §1c stripping is insufficient for the 17 hardcoded-fill diagrams  | Verify on both tracks before rolling out; fallback documented in §1c                                     |
| `useMaxWidth: false` makes a very wide diagram overflow its slide | CSS `max-width: 100%; height: auto` guard; spot-check the widest diagram                                 |
| Removing `format` from `build` breaks a contributor's habit       | Documented in §6; `npm run format` unchanged                                                             |
| A change applied to one track but not the other                   | Verification step 6 checks both independently; this is the known hazard of the un-refactored duplication |
| Node 22 pin conflicts with local Node 24                          | `engines` is `>=22`, not `==22`; both work                                                               |

## Open items, deliberately not addressed

Audit findings 6 (track factory), 8 (image pipeline — 47 MB of unoptimised PNGs), and 9 (PR CI,
JSON-schema validation for lecture files). Finding 7 (unpinned `mermaid@11` CDN range, no SRI on any
of the five CDN scripts) is also untouched, and is worth raising separately: this work depends on
Mermaid's rendering behaviour, which a floating major range can change without a commit.
