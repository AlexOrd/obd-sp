# Technical Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the correctness and tooling defects found in the 2026-08-29 architecture audit, and delete the half-wired PDF export pipeline.

**Architecture:** This is a static site generator — JSON lecture data plus Mustache templates compiled to HTML by Gulp. There is no application runtime and no test framework. Verification is therefore done by running the build and asserting on its output, by a new build-time link checker, and by scripted browser probes against the served `dist/`. Every change is applied symmetrically to two near-identical track trees (`sp/` and `db/`), which are deliberately not being refactored here.

**Tech Stack:** Node 22, Gulp 5, Mustache, Reveal.js 5.0.4 (CDN), Mermaid 11 (CDN), ESLint 9 flat config, Prettier, Husky + lint-staged.

**Spec:** `docs/superpowers/specs/2026-08-29-technical-remediation-design.md`

## Global Constraints

- Lecture content is **never** edited. All 46 `[track]/data/lectures/lectureN.json` files stay byte-identical.
- Every template/CSS change must be applied to **both** tracks. A fix verified on SP proves nothing about DB.
- `static/pdfs/lecture1.pdf` and `static/pdfs/` are **retained**.
- The full production build must stay under ~3s.
- Generated `<section>` counts must continue to match source JSON slide counts exactly.
- Node version floor after Task 6: `>=22.0.0`.
- Working directory is `/Users/alex/Work/obd-sp`. Work happens directly on `master`; no feature branch.
- The husky pre-commit hook currently runs a full `build:prod` on every commit. Until Task 7 removes it, expect every `git commit` to take ~3s and print a full build log. This is expected, not a failure.
- **Consequence for the RED steps:** because that hook builds, a deliberately-failing build blocks `git commit` entirely. This affects Task 3, where the link checker is meant to fail before the links are fixed. Do not try to commit between a RED step and its GREEN step — each task's commit comes only after its verification is green. If a commit must be made mid-task, use `git commit --no-verify` and say so.

## There is no test suite

`package.json` has no `test` script and no test framework is installed, and adding one is out of scope. Each task below therefore has a **concrete runnable verification command with expected output** in place of unit tests. Several tasks are still genuinely test-first: the checker is written before the bug is fixed, run to observe it fail, then run again to observe it pass.

---

### Task 1: Enable ESLint's recommended preset and fix what it surfaces

Going first because it is self-contained and gives every later task a stricter safety net.

**Files:**

- Modify: `package.json` (add `@eslint/js` devDependency)
- Modify: `eslint.config.js:1` (prepend the recommended preset)
- Modify: `gulpfile.js:221`, `gulpfile.js:365` (duplicate `isCodeExample`)
- Modify: `gulpfile.js:560` (unnecessary escapes)
- Modify: `sp/templates/lecture-slide.html:133-134` (duplicate `center: true`)

**Interfaces:**

- Consumes: nothing.
- Produces: a lint config that fails on `no-dupe-keys`. Later tasks rely on `npm run lint` being a real correctness gate.

- [ ] **Step 1: Add `@eslint/js` as an explicit devDependency**

It currently resolves only as a transitive dependency of `eslint`, which is fragile. Version must match the installed `eslint` (9.38.0).

```bash
npm install --save-dev @eslint/js@9.38.0
```

- [ ] **Step 2: Add the recommended preset to the flat config**

In `eslint.config.js`, add the import at the top of the file and make `js.configs.recommended` the **first** array entry, so the existing custom rules that follow still win:

```js
import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2024,
      // ... rest of the existing config unchanged
```

- [ ] **Step 3: Run lint to verify it now FAILS (this is the RED step)**

Run: `npm run lint`

Expected: FAIL. Exactly four errors:

```
gulpfile.js:221  no-dupe-keys        Duplicate key 'isCodeExample'.
gulpfile.js:365  no-dupe-keys        Duplicate key 'isCodeExample'.
gulpfile.js:560  no-useless-escape   Unnecessary escape character: \"
gulpfile.js:560  no-useless-escape   Unnecessary escape character: \"
```

If lint passes here, the preset did not take effect — stop and fix the config before continuing.

- [ ] **Step 4: Fix the duplicate `isCodeExample` keys**

Both flag maps declare the key twice. The second declaration wins, which is what makes `"type": "code"` work as an undocumented alias. Collapse each pair into a single entry that **preserves that alias**, so no existing lecture changes behaviour.

In `gulpfile.js` around line 206 (SP) delete this line:

```js
            isCodeExample: slide.type === 'code-example',
```

and keep the later one, which already reads:

```js
            isCodeExample: slide.type === 'code-example' || slide.type === 'code',
```

Do exactly the same in the DB map around line 351. Both maps must end with **one** `isCodeExample` entry containing the `||`.

- [ ] **Step 5: Fix the unnecessary escapes**

`gulpfile.js:560` is inside a regex literal, where `\"` is meaningless:

```js
          /<div class="mermaid">[\s\S]*?<\/div>/,
```

- [ ] **Step 6: Remove the duplicate `center: true` in the SP Reveal config**

`sp/templates/lecture-slide.html` lines 133-134 both read `center: true,`. Delete one.

Note: `db/templates/lecture-slide.html` has only **one** `center: true` (line 133). Do **not** edit the DB file in this step — verify with `grep -c "center:" db/templates/lecture-slide.html`, which must print `1`.

- [ ] **Step 7: Run lint to verify it PASSES (this is the GREEN step)**

Run: `npm run lint`
Expected: PASS, `✅ Lint passed`.

- [ ] **Step 8: Verify the alias still works**

The `"type": "code"` alias must survive. Confirm no lecture regressed:

```bash
npm run build 2>&1 | grep -E "Generated (24|22)"
```

Expected: both `✅ Generated 24 SP lecture(s)` and `✅ Generated 22 DB lecture(s)`.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json eslint.config.js gulpfile.js sp/templates/lecture-slide.html
git commit -m "fix: enable ESLint recommended preset and fix the bugs it surfaces

Adds js.configs.recommended, which was never extended, leaving core
correctness rules off. Fixes the three bugs it immediately reports:
duplicate isCodeExample keys in both lecture flag maps (preserving the
'code' alias), two unnecessary regex escapes, and a duplicate
center: true in the SP Reveal config."
```

---

### Task 2: Fix Mermaid diagram rendering

The highest-severity defect: all 50 diagrams across 34 of 46 lectures are invisible. Three stacked problems, fixed together because 2a hides 2b and 2c.

**Files:**

- Modify: `sp/templates/lecture-slide.html:89-124` (Mermaid config + init)
- Modify: `db/templates/lecture-slide.html` (same block)
- Modify: `sp/css/cyberpunk-theme.css` (append `.mermaid` sizing guard)
- Modify: `db/css/harry-potter-theme.css` (append `.mermaid` sizing guard)

**Interfaces:**

- Consumes: nothing.
- Produces: a global `renderVisibleDiagrams()` in each lecture page. No other task depends on it.

- [ ] **Step 1: Build and serve the current site, then record the failing baseline**

```bash
npm run build
(cd dist && python3 -m http.server 3100 --bind 127.0.0.1 &)
```

Open `http://127.0.0.1:3100/sp/lectures/lecture5.html` in Chrome and run in the console:

```js
[...document.querySelectorAll('.mermaid svg')].map((s) => s.getAttribute('viewBox'));
```

Expected (RED): `["-8 -8 16 16"]` — the degenerate 16px box.
Repeat on `http://127.0.0.1:3100/db/lectures/lecture3.html`, expected `["-8 -8 16 16","-8 -8 16 16","-8 -8 16 16"]`.

- [ ] **Step 2: Replace the Mermaid config and init block in `sp/templates/lecture-slide.html`**

Replace the whole `<script>` block containing `getMermaidConfig` (lines 91-123) with the following. Three changes are folded in: `useMaxWidth: false` for sizing, a fixed `mono` value instead of one derived from `prefers-color-scheme`, and source normalisation that strips the lecture data's theme overrides.

```html
<script>
  // SP decks are always dark. Diagram colours are fixed per track and must NOT
  // depend on the viewer's OS colour scheme.
  const MONO = '#ffffff';

  const getMermaidConfig = () => ({
    startOnLoad: false,
    theme: 'neutral',
    flowchart: { useMaxWidth: false },
    themeVariables: {
      fontSize: '18px',
      fontFamily: 'Share Tech Mono, monospace',
      background: 'transparent',
      mainBkg: 'transparent',
      secondBkg: 'transparent',
      primaryColor: 'transparent',
      secondaryColor: 'transparent',
      tertiaryColor: 'transparent',
      primaryBorderColor: MONO,
      clusterBorder: MONO,
      clusterBkg: 'transparent',
      lineColor: MONO,
      edgeLabelBackground: 'transparent',
      primaryTextColor: MONO,
      labelTextColor: MONO,
      nodeTextColor: MONO,
      titleColor: MONO,
    },
  });

  // Lecture JSON hardcodes light node fills and a %%{init}%% theme directive that
  // overrides the config above, producing white-on-white. Strip both so every
  // diagram inherits this track's theme. Lecture content is never edited.
  const normaliseMermaidSource = (src) =>
    src
      .replace(/%%\{\s*init\s*:[\s\S]*?\}%%/g, '')
      .replace(/^\s*style\s+\S+\s+fill:#[0-9A-Fa-f]{3,8}.*$/gm, '')
      .trim();

  if (window.mermaid) {
    window.mermaid.initialize(getMermaidConfig());
  }
</script>
```

- [ ] **Step 3: Replace the Mermaid run call with lazy per-slide rendering**

Mermaid cannot lay out a diagram inside a `display: none` slide — it cannot measure text, so every node collapses. Rendering must be deferred until the slide is visible.

In the same file, replace the existing `Reveal.on('ready', ...)` Mermaid block (lines ~144-151) with:

```js
// Mermaid cannot measure text inside a display:none slide, so diagrams must
// be rendered only once their slide becomes visible. Idempotent via dataset.
function renderVisibleDiagrams() {
  if (!window.mermaid) return;
  const slide = Reveal.getCurrentSlide();
  if (!slide) return;
  const nodes = [...slide.querySelectorAll('.mermaid')].filter((n) => !n.dataset.rendered);
  if (!nodes.length) return;
  nodes.forEach((n) => {
    n.dataset.rendered = '1';
    n.textContent = normaliseMermaidSource(n.textContent);
  });
  window.mermaid.run({ nodes });
}

Reveal.on('ready', renderVisibleDiagrams);
Reveal.on('slidechanged', renderVisibleDiagrams);
```

`ready` is kept so a diagram on the first slide still renders.

- [ ] **Step 4: Apply Steps 2 and 3 to `db/templates/lecture-slide.html`**

Identical, with **one** difference — the DB deck is a light parchment theme, so its fixed colour is dark:

```js
// DB decks are always light parchment.
const MONO = '#2b1a10';
```

Everything else, including `normaliseMermaidSource`, is the same.

- [ ] **Step 5: Add the sizing guard to both theme stylesheets**

`useMaxWidth: false` makes Mermaid emit intrinsic width; this keeps an oversized diagram inside the slide. Append to **both** `sp/css/cyberpunk-theme.css` and `db/css/harry-potter-theme.css`:

```css
/* Mermaid diagrams: rendered lazily per slide, sized intrinsically.
   The container must be block-level — an inline-block shrink-to-fit
   parent gives the SVG a 0px basis. */
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

- [ ] **Step 6: Rebuild and verify SP (GREEN)**

```bash
npm run build
```

Reload `http://127.0.0.1:3100/sp/lectures/lecture5.html`, navigate to the diagram slide (slide 5), and run:

```js
const s = document.querySelector('.mermaid svg');
({
  viewBox: s.getAttribute('viewBox'),
  width: Math.round(s.getBoundingClientRect().width),
  nodes: s.querySelectorAll('.node').length,
});
```

Expected: `viewBox` is **not** `-8 -8 16 16`, width > 400, nodes >= 3.
Take a screenshot and confirm by eye that the node labels are legible against the dark background.

- [ ] **Step 7: Verify DB independently (GREEN)**

Repeat Step 6 exactly on `http://127.0.0.1:3100/db/lectures/lecture3.html`, which has three diagrams. All three must report a real `viewBox`. Confirm labels are legible against the light parchment.

**If labels are unreadable on either track**, the fallback recorded in the spec applies: stop, pin `nodeTextColor` to a value that reads against the light fills instead of stripping them, re-verify, and record the decision in the spec's §1c.

- [ ] **Step 8: Verify idempotence and first-slide rendering**

Navigate away from a diagram slide and back. The diagram must not flicker or re-render — `n.dataset.rendered` prevents it. Confirm:

```js
document.querySelectorAll('.mermaid[data-rendered="1"]').length;
```

returns the number of diagrams already visited, and does not grow on revisits.

- [ ] **Step 9: Stop the server and commit**

```bash
pkill -f "http.server 3100"
git add sp/templates/lecture-slide.html db/templates/lecture-slide.html sp/css/cyberpunk-theme.css db/css/harry-potter-theme.css
git commit -m "fix: render Mermaid diagrams lazily so they are visible

All 50 diagrams rendered as 16x16px blobs. mermaid.run() fired on
Reveal 'ready', when every diagram slide is display:none — Mermaid
cannot measure text there, so every node collapsed, and
data-processed blocked any retry.

Renders per slide on 'slidechanged' instead, sets useMaxWidth:false
with a CSS guard for scale, pins diagram colours per track instead of
deriving them from the viewer's OS theme, and strips the %%{init}%%
and per-node fill overrides the lecture JSON carries. No lecture
content is modified."
```

---

### Task 3: Add a build-time link checker, then fix the landing page

Test-first: the checker is written and observed failing on the real bug before the bug is fixed.

**Files:**

- Modify: `gulpfile.js` (new `checkLinks` task + add to the `build` series)
- Modify: `src/templates/landing.html` (47 links)

**Interfaces:**

- Consumes: nothing.
- Produces: `export const checkLinks` — a Gulp task taking a `done` callback, failing the build via `done(new Error(...))` when any local reference is unresolvable.

- [ ] **Step 1: Write the `checkLinks` task**

Add to `gulpfile.js`, immediately before the `COMPOSITE TASKS` section:

```js
// ==============================================
// LINK CHECKING
// ==============================================

/**
 * Fail the build if any local href/src in dist/ points at a missing file.
 * @param {(err?: any) => void} done
 */
export const checkLinks = (done) => {
  log('🔗 Checking internal links...', 'cyan');
  const start = Date.now();
  const root = paths.dist.base;
  /** @type {string[]} */
  const broken = [];
  let checked = 0;

  /** @param {string} dir */
  const walk = (dir) =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const full = path.join(dir, e.name);
      return e.isDirectory() ? walk(full) : full.endsWith('.html') ? [full] : [];
    });

  if (!fs.existsSync(root)) {
    done(new Error('dist/ does not exist — run a build first'));
    return;
  }

  walk(root).forEach((file) => {
    const html = fs.readFileSync(file, 'utf8');
    const dir = path.dirname(file);
    for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const raw = m[1];
      if (/^(https?:)?\/\//.test(raw) || /^(#|data:|mailto:|javascript:)/.test(raw)) continue;
      const clean = decodeURIComponent(raw.split('#')[0].split('?')[0]);
      if (!clean) continue;
      checked++;
      let target = path.resolve(clean.startsWith('/') ? root : dir, `.${path.sep}`, clean);
      if (clean.startsWith('/')) target = path.join(root, clean);
      if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
        target = path.join(target, 'index.html');
      }
      if (!fs.existsSync(target)) {
        broken.push(`${path.relative(root, file)} -> ${raw}`);
      }
    }
  });

  if (broken.length) {
    broken.forEach((b) => log(`   ✗ ${b}`, 'red'));
    done(new Error(`${broken.length} broken internal link(s) out of ${checked} checked`));
    return;
  }

  log(`✅ ${checked} internal links OK (${formatDuration(Date.now() - start)})`, 'green');
  done();
};
```

- [ ] **Step 2: Add `checkLinks` to the build series**

In the `build` series in `gulpfile.js`, insert it immediately after `htmlMinify`:

```js
  gulp.parallel(buildLanding, buildSP, buildDB, buildShared),
  htmlMinify,
  checkLinks,
  (done) => {
```

Do **not** add it to the `dev` series — a dev server should not refuse to start over a dead link.

- [ ] **Step 3: Run the build to verify the checker FAILS (this is the RED step)**

Run: `npm run build`

Expected: FAIL. The log lists 47 broken links, all from `index.html`, and the build exits non-zero:

```
   ✗ index.html -> sp/lecture0.html
   ✗ index.html -> db/lecture0.html
   ...
Error: 47 broken internal link(s) out of 333 checked
```

If it reports 0 broken, the checker is wrong — fix it before continuing.

- [ ] **Step 4: Fix the 46 recoverable links in `src/templates/landing.html`**

Every lecture link is missing the `lectures/` path segment. Apply to the whole file:

```bash
sed -i '' -E 's|href="(sp\|db)/lecture([0-9]+)\.html"|href="\1/lectures/lecture\2.html"|g' src/templates/landing.html
```

Verify 47 links were rewritten:

```bash
grep -c 'href="\(sp\|db\)/lectures/lecture[0-9]*\.html"' src/templates/landing.html
```

Expected: `47`.

- [ ] **Step 5: Remove the link to the lecture that does not exist**

`db/lecture22.html` has no source file in either location. Delete its anchor from `src/templates/landing.html` (now at approximately line 303 and reading `href="db/lectures/lecture22.html"` after Step 4):

```html
<a href="db/lectures/lecture22.html" class="lecture-link"> Lecture 22: Performance & Scaling </a>
```

Delete all three lines. The preceding `lecture21` anchor and the closing `</div>` stay.

- [ ] **Step 6: Run the build to verify the checker PASSES (this is the GREEN step)**

Run: `npm run build`

Expected: PASS.

```
✅ 332 internal links OK
✅ Production build complete!
```

The count drops from 333 to 332 because one anchor was removed.

- [ ] **Step 7: Commit**

```bash
git add gulpfile.js src/templates/landing.html
git commit -m "fix: repair 47 dead landing-page links and add a link checker

Every lecture link on the landing page omitted the 'lectures/' path
segment, so all 46 were 404s; a 47th pointed at db/lecture22, which
does not exist. Adds a checkLinks build task that resolves every local
href/src in dist/ and fails the build on any dead reference, so the
hardcoded list cannot drift silently again."
```

---

### Task 4: Remove the PDF pipeline

**Files:**

- Modify: `package.json` (drop 2 scripts, drop `puppeteer`)
- Modify: `gulpfile.js` (drop both print-variant stream blocks)
- Delete: `sp/css/print-theme.css`, `db/css/print-theme.css`, `src/css/print-theme.css`

**Interfaces:**

- Consumes: nothing.
- Produces: nothing. Pure subtraction.

- [ ] **Step 1: Confirm the print machinery is genuinely inert before deleting it**

```bash
grep -rn "isPrintVersion" --include="*.html" sp/ db/ src/ ; echo "--- exit $? (1 = no matches, expected)"
grep -rn "print-theme" --include="*.html" --include="*.js" sp/ db/ src/ gulpfile.js ; echo "--- exit $? (1 = no matches, expected)"
```

Both must report no matches. `isPrintVersion` is passed to Mustache but read by no template, and `print-theme.css` is linked by no HTML. If either returns a match, stop — the assumption in the spec is wrong.

- [ ] **Step 2: Remove the two npm scripts and the Puppeteer dependency**

Delete these two lines from the `scripts` block in `package.json`:

```json
    "pdf": "gulp pdf",
    "build:pdf": "npm run build && npm run pdf",
```

Then:

```bash
npm uninstall puppeteer
```

- [ ] **Step 3: Remove the SP print-variant stream block**

In `gulpfile.js`, in `buildSPLectures`, delete this block (around lines 235-241):

```js
// Generate print-friendly version for PDF
gulp
  .src('sp/templates/lecture-slide.html')
  .pipe(errorHandler('SP Lectures Print'))
  .pipe(mustache({ ...layoutData, lecture: lectureData, isPrintVersion: true }, {}, partials))
  .pipe(rename(file.replace('.json', '-print.html')))
  .pipe(gulp.dest(paths.dist.sp.lectures));
```

- [ ] **Step 4: Remove the DB print-variant stream block**

The equivalent block in `buildDBLectures` (around lines 379-385), which differs only in `db`/`DB` naming and `paths.dist.db.lectures`.

- [ ] **Step 5: Delete the three identical print stylesheets**

```bash
git rm sp/css/print-theme.css db/css/print-theme.css src/css/print-theme.css
```

- [ ] **Step 6: Verify the build is clean and the artefacts are gone**

```bash
npm run build
echo "print html files: $(find dist -name '*-print.html' | wc -l)   (expect 0)"
echo "print-theme in dist: $(find dist -name 'print-theme.css' | wc -l)   (expect 0)"
echo "lecture pages: SP $(ls dist/sp/lectures/*.html | wc -l) DB $(ls dist/db/lectures/*.html | wc -l)   (expect 24 and 22)"
```

The link checker from Task 3 must still report OK.

- [ ] **Step 7: Verify Puppeteer is gone**

```bash
grep -c puppeteer package.json    # expect 0
ls node_modules/puppeteer 2>/dev/null || echo "puppeteer removed from node_modules"
```

`~/.cache/puppeteer` (507 MB) is outside the repo — mention it to the user, do not delete it.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json gulpfile.js
git commit -m "chore: remove the half-wired PDF export pipeline

npm run pdf and build:pdf invoked a gulp task that never existed. The
supporting machinery was inert: isPrintVersion was passed to Mustache
but read by no template, so all 46 -print.html files were byte-identical
duplicates of the normal decks, and print-theme.css was linked by no
HTML in any of its three identical copies.

Removes the scripts, the Puppeteer devDependency, both print-variant
stream blocks and all three stylesheets. static/pdfs/lecture1.pdf is
retained."
```

---

### Task 5: Fix the fire-and-forget stream race in the lecture builders

**Files:**

- Modify: `gulpfile.js` — `buildSPLectures` (~lines 167-252) and `buildDBLectures` (~lines 311-396)

**Interfaces:**

- Consumes: nothing.
- Produces: `buildSPLectures` and `buildDBLectures` keep their existing `(done) => {}` signature, so the `build` and `dev` series are unchanged.

- [ ] **Step 1: Understand the bug before changing anything**

Both tasks start 24 (and 22) `gulp.src(...).pipe(...)` streams inside a `forEach`, return none of them, then call `done()` synchronously. Gulp marks the task complete before a single file is written. It has not caused a visible failure only because the one task that follows in series, `htmlMinify`, excludes both lecture directories.

- [ ] **Step 2: Rewrite `buildSPLectures` to await its streams**

Two changes: hoist the `layoutData` read out of the loop (it currently re-reads the same file 24 times), and collect each stream into a promise.

Replace the body from `let processedCount = 0;` through the closing `done();` with:

```js
// Hoisted: this file was previously re-read once per lecture.
const layoutData = JSON.parse(fs.readFileSync('sp/data/lectures.json', 'utf8'));

const tasks = files.map((file) => {
  const lectureData = JSON.parse(fs.readFileSync(lecturesDir + file, 'utf8'));

  if (lectureData.slides) {
    lectureData.slides = lectureData.slides.map(
      /** @param {any} slide */ (slide) => ({
        ...slide,
        isTitle: slide.type === 'title',
        isRoadmap: slide.type === 'roadmap',
        isPreviousLecture: slide.type === 'previous-lecture',
        isDefinition: slide.type === 'definition',
        isSyntax: slide.type === 'syntax',
        isCodeBreakdown: slide.type === 'code-breakdown',
        isDiagram: slide.type === 'diagram',
        isComparison: slide.type === 'comparison',
        isDebugger: slide.type === 'debugger',
        isCommonMistake: slide.type === 'common-mistake',
        isSummary: slide.type === 'summary',
        isNextSteps: slide.type === 'next-steps',
        isLiveCoding: slide.type === 'live-coding',
        isTable: slide.type === 'table',
        isContent: slide.type === 'content',
        isList: slide.type === 'list',
        isTimeline: slide.type === 'timeline',
        isQuiz: slide.type === 'quiz',
        isCodeExample: slide.type === 'code-example' || slide.type === 'code',
      })
    );
  }

  return new Promise((resolve, reject) => {
    gulp
      .src('sp/templates/lecture-slide.html')
      .pipe(errorHandler('SP Lectures'))
      .pipe(mustache({ ...layoutData, lecture: lectureData }, {}, partials))
      .pipe(rename(file.replace('.json', '.html')))
      .pipe(gulp.dest(paths.dist.sp.lectures))
      .pipe(size({ title: `SP Lecture ${lectureData.lectureNumber}`, showFiles: false }))
      .on('end', resolve)
      .on('error', reject);
  });
});

Promise.all(tasks)
  .then(() => {
    log(
      `✅ Generated ${tasks.length} SP lecture(s) (${formatDuration(Date.now() - start)})`,
      'green'
    );
    done();
  })
  .catch(done);
```

Note the flag map is written once here with a **single** `isCodeExample` entry — Task 1 already collapsed the duplicate.

- [ ] **Step 3: Apply the same rewrite to `buildDBLectures`**

Identical, substituting `db` for `sp`, `DB` for `SP`, `'db/data/lectures.json'`, `'db/templates/lecture-slide.html'` and `paths.dist.db.lectures`.

- [ ] **Step 4: Verify all lectures are still generated**

```bash
npm run build 2>&1 | grep -E "Generated (24|22)"
```

Expected: `✅ Generated 24 SP lecture(s)` and `✅ Generated 22 DB lecture(s)`.

- [ ] **Step 5: Verify the files genuinely exist when the task reports completion**

This is the actual regression test for the race — assert on the output, not the log:

```bash
npm run clean && npm run build > /dev/null 2>&1
echo "SP: $(ls dist/sp/lectures/*.html | wc -l)  DB: $(ls dist/db/lectures/*.html | wc -l)"
```

Expected: `SP: 24  DB: 22` (no `-print.html` after Task 4).

- [ ] **Step 6: Verify slide counts still match the source JSON**

```bash
for n in 0 5 12 23; do
  j=$(python3 -c "import json;print(len(json.load(open('sp/data/lectures/lecture$n.json'))['slides']))")
  h=$(grep -o '<section' dist/sp/lectures/lecture$n.html | wc -l | tr -d ' ')
  echo "lecture$n: json=$j html=$h"
done
```

Expected: `json` and `html` equal on every line.

- [ ] **Step 7: Commit**

```bash
git add gulpfile.js
git commit -m "fix: await lecture streams instead of reporting success early

buildSPLectures and buildDBLectures started 24 and 22 unawaited gulp
streams in a forEach, then called done() synchronously — so the task
reported complete before any file was written. The race was masked only
because htmlMinify excludes both lecture directories.

Collects the streams and awaits them via Promise.all, and hoists the
lectures.json read out of the loop where it was re-read once per lecture."
```

---

### Task 6: Tooling hygiene — Node version and gitignore

**Files:**

- Create: `.nvmrc`
- Modify: `package.json` (`engines.node`)
- Modify: `.github/workflows/deploy.yml` (read the version from `.nvmrc`)
- Modify: `.gitignore`

**Interfaces:**

- Consumes: nothing.
- Produces: nothing.

- [ ] **Step 1: Pin the Node version**

```bash
echo "22" > .nvmrc
```

22 is the current LTS and matches what CI already uses.

- [ ] **Step 2: Raise the engines floor**

In `package.json`:

```json
  "engines": {
    "node": ">=22.0.0",
    "npm": ">=10.0.0"
  },
```

This is a floor, not a pin — local Node 24 continues to work.

- [ ] **Step 3: Make CI read the version from `.nvmrc`**

In `.github/workflows/deploy.yml`, replace the hardcoded version so the two cannot drift:

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version-file: '.nvmrc'
    cache: 'npm'
```

- [ ] **Step 4: Narrow the over-broad `*.db` ignore**

`.gitignore` lists `*.db` under "OS files", intending `Thumbs.db`. On a repo teaching database fundamentals this silently ignores any SQLite sample committed for an exercise. In the "OS files" block, delete the `*.db` line — `Thumbs.db` is already listed on its own line directly above it.

- [ ] **Step 5: Verify**

```bash
cat .nvmrc                                    # 22
grep -A3 '"engines"' package.json             # >=22.0.0
grep -n "node-version" .github/workflows/deploy.yml   # node-version-file: '.nvmrc'
grep -n "^\*\.db" .gitignore || echo "*.db ignore removed"
npm run build                                 # still passes
```

- [ ] **Step 6: Commit**

```bash
git add .nvmrc package.json .github/workflows/deploy.yml .gitignore
git commit -m "chore: pin Node to 22 and narrow the *.db gitignore

engines said >=18, CI pinned 22 and local development runs 24. Adds an
.nvmrc, raises the engines floor to 22, and has CI read the version from
the file so the two cannot drift.

Also narrows the *.db ignore to Thumbs.db, which is what was intended —
on a database course repo it silently ignored SQLite samples."
```

---

### Task 7: Stop the build from mutating the working tree

Last, because it makes unformatted code a hard build failure — every earlier task benefits from the looser rule while iterating.

**Files:**

- Modify: `gulpfile.js` (the `build` series)
- Modify: `.husky/pre-commit`

**Interfaces:**

- Consumes: nothing.
- Produces: nothing.

- [ ] **Step 1: Remove `format` from the build series**

A build should verify formatting, not silently rewrite source. `validate` (which is `lint` then `check`) already verifies it. In `gulpfile.js`, in the `build` series, delete the `format,` line so it reads:

```js
export const build = gulp.series(
  (done) => {
    log('🏗️  Building for PRODUCTION...', 'magenta');
    done();
  },
  clean,
  validate,
  gulp.parallel(buildLanding, buildSP, buildDB, buildShared),
  htmlMinify,
  checkLinks,
```

The exported `format` task and `npm run format` are unchanged and remain the way to format.

- [ ] **Step 2: Remove the production build from the pre-commit hook**

`.husky/pre-commit` currently runs `lint-staged` and then a full `npm run build:prod`. Because that build included `format`, it rewrote files _after_ they were staged and never re-staged them — so a commit could ship content differing from what the build had just formatted. Reduce the file to:

```sh
# Run lint-staged (ESLint + Prettier on staged files)
npx lint-staged
```

- [ ] **Step 3: Verify the build no longer touches the working tree**

```bash
git status --porcelain > /tmp/before.txt
npm run build
git status --porcelain > /tmp/after.txt
diff /tmp/before.txt /tmp/after.txt && echo "PASS: build did not modify the working tree"
```

Expected: `PASS`.

- [ ] **Step 4: Verify the build now FAILS on unformatted source**

This proves `validate` is a real gate, not a no-op:

```bash
printf '\n\nconst    x   =   1\n' >> src/js/landing.js
npm run build; echo "exit=$?  (expect non-zero)"
git checkout src/js/landing.js
npm run build; echo "exit=$?  (expect 0)"
```

- [ ] **Step 5: Verify commits are fast again**

```bash
time git commit --allow-empty -m "test: verify hook no longer runs a full build"
git reset --hard HEAD~1
```

Expected: well under a second, and no build log.

- [ ] **Step 6: Commit**

```bash
git add gulpfile.js .husky/pre-commit
git commit -m "fix: stop the build and pre-commit hook mutating the tree

The build series ran the format task, rewriting source through Prettier
mid-build; validate already verifies formatting, so the build now fails
on unformatted code instead of silently fixing it. npm run format is
unchanged.

The pre-commit hook also ran a full build:prod, which reformatted files
after they were staged without re-staging them, so a commit could ship
content differing from what the build had just formatted."
```

---

### Task 8: Update the documentation this work invalidates

**Files:**

- Modify: `CLAUDE.md`
- Modify: `.claude/skills/creating-lecture/SKILL.md`
- Modify: `CODE_QUALITY.md`
- Modify: `docs/superpowers/specs/2026-08-29-technical-remediation-design.md` (only if the Task 2 fallback was used)

**Interfaces:**

- Consumes: the finished state of Tasks 1-7.
- Produces: nothing.

- [ ] **Step 1: Update `CLAUDE.md`**

Four things in it are now wrong:

1. The **Commands** block lists `npm run pdf` / `build:pdf` — remove them, and remove the whole paragraph beginning "**`npm run pdf` and `npm run build:pdf` are broken.**"
2. The paragraph "**`npm run build` rewrites source files.**" is now false. Replace with a note that the build _verifies_ formatting via `validate` and fails on unformatted code, and that `npm run format` is the way to format.
3. Add `npx gulp checkLinks` to the individual-tasks list, and note that the build fails on any dead internal link.
4. Update the Commands preamble to state Node 22 (`.nvmrc`).

- [ ] **Step 2: Update `.claude/skills/creating-lecture/SKILL.md`**

Its **Notes** section states that `npm run build` reformats source files via Prettier and that a dirty tree afterwards is expected. Both are now false. Replace with: the build verifies formatting and fails if source is unformatted; run `npm run format` first.

Also add to Step 7 of that skill that the build now runs a link checker, so a lecture registered with a wrong `file` value will fail the build rather than 404 silently.

- [ ] **Step 3: Update `CODE_QUALITY.md`**

Two things are wrong:

1. The "Pre-commit Hook (Optional)" section describes Husky as something to install. It has been wired up for some time. Retitle to "Pre-commit Hook" and describe what actually runs now: `lint-staged` only.
2. The "Build Integration" section says the build "Runs ESLint ... Checks formatting ... Fails the build". That is still true, but add that the build no longer formats files for you, and that it also now fails on broken internal links.

- [ ] **Step 4: Record the Task 2 fallback, if it was used**

Only if Step 7 of Task 2 required the `nodeTextColor` fallback rather than source stripping: update §1c of the spec to record what was actually implemented and why. If stripping worked, change nothing.

- [ ] **Step 5: Verify no stale references remain**

```bash
grep -rn "build:pdf\|npm run pdf\|print-theme\|reformats source\|rewrites source" \
  CLAUDE.md CODE_QUALITY.md .claude/skills/ README.md || echo "PASS: no stale references"
```

`README.md` is in the grep because it documents the `npm run pdf` script too — if it matches, fix it in this task.

- [ ] **Step 6: Final full verification**

Run the spec's complete verification list end to end:

```bash
npm run clean
time npm run build:prod                                    # under ~3s, link check OK
find dist -name '*-print.html' | wc -l                     # 0
find dist -name 'print-theme.css' | wc -l                  # 0
echo "SP $(ls dist/sp/lectures/*.html|wc -l) DB $(ls dist/db/lectures/*.html|wc -l)"   # 24, 22
npm run lint                                               # green
git status --porcelain                                     # clean
```

Then serve `dist/` and confirm in the browser, **on both tracks**, that a diagram slide renders legibly.

- [ ] **Step 7: Commit**

```bash
git add CLAUDE.md CODE_QUALITY.md README.md .claude/ docs/
git commit -m "docs: update guidance invalidated by the remediation work

CLAUDE.md documented the broken PDF scripts and the build's habit of
rewriting source files; both are gone. The creating-lecture skill made
the same claim about the build. CODE_QUALITY.md still described Husky
as optional and yet to be installed. Adds the new checkLinks task and
the Node 22 requirement."
```

---

## Self-Review

**Spec coverage.** Every spec section maps to a task: §1a/1b/1c → Task 2; §2 → Task 3; §3 → Task 4; §4a → Task 5; §4b/4c → Task 7; §5a → Task 1; §5b/5c → Task 6; §6 → Task 8. The spec's 8-point verification list is distributed across the tasks and re-run whole in Task 8 Step 6. No gaps.

**Ordering.** Task 1 first so later tasks have a real lint gate. Task 7 last because it makes unformatted code a hard build failure. Task 5 depends on Task 1 (the collapsed `isCodeExample`) and Task 4 (no print block to preserve) — both precede it. Task 3 must precede Task 4 so the link checker is already guarding when files are deleted.

**Type consistency.** `checkLinks` is defined in Task 3 Step 1 and referenced by that exact name in Task 3 Step 2, Task 7 Step 1, and Task 8. `renderVisibleDiagrams` and `normaliseMermaidSource` are defined in Task 2 Steps 2-3 and used only there. `buildSPLectures`/`buildDBLectures` keep their `(done)` signature in Task 5, so the composite series need no change.

**Known deviation from the skill's template.** This project has no test framework, and adding one is out of scope. Tasks use runnable verification commands with expected output instead of unit tests. Tasks 1, 2, 3 and 7 are still genuinely test-first — the gate is written and observed failing before the fix.
