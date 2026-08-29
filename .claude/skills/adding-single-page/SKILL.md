---
name: adding-single-page
description: Use when adding or editing a standalone page under single/ (game, glowjelly, hydropump, jinglecell, coursework, tg_bot) — hand-written HTML that bypasses the lecture template system.
---

# Adding a Single Page

## Overview

`single/<name>/` is copied **verbatim** to `dist/<name>/` by the `copySingle` gulp task. No
templating, no Mustache, no data files, no minification of your CSS/JS, and — importantly — no
Prettier and no ESLint. These pages are self-contained hand-written HTML for standalone project
write-ups and tutorials.

Use this instead of the lecture system when the content is a one-off page rather than a slide deck.
If it is a slide deck, use the `creating-lecture` skill.

## Steps

1. **Create the directory**: `single/<name>/` with an `index.html` at its root. The directory name
   becomes the URL path — `single/game/index.html` → `https://vtfk.ordynski.com/game/`.

2. **Keep every asset inside the directory** and reference it with relative paths
   (`css/style.css`, `images/1.png`, `assets/…`). The copy is verbatim, so any path that works
   locally works in `dist/`. Nothing outside `single/<name>/` is available to the page — it cannot
   reach `dist/css/` or `dist/static/` by a relative path from where it lands.

   Existing pages use two layouts, either is fine: `css/` + `js/` + `images/` subdirectories
   (`game`, `coursework`) or a flat `style.css` + `assets/` (`glowjelly`, `hydropump`,
   `jinglecell`).

3. **Build and check.**

   ```bash
   npx gulp copySingle
   ls dist/<name>/
   ```

   `npm run build` also prints a "Single Pages (N): …" line listing every directory it copied.

4. **Preview** at `http://localhost:3000/<name>/` with `npm start`.

## Linking

Single pages are **not** reachable from the landing page or either track index — nothing links to
them. They are shared by direct URL. If a page should be discoverable, add the link yourself to
`src/templates/landing.html` or the relevant `[track]/templates/index.html`.

## Analytics

`single/game/index.html` carries a Google Analytics tag (`G-DNHXDFBPSW`) with custom events for tab
clicks, lesson links, external links and scroll depth. `ANALYTICS_STRATEGY.md` documents the event
schema. Match it if the new page needs tracking; omit the tag entirely if it does not.

## Common Mistakes

| Symptom                                      | Cause                                                                                               |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Page 404s                                    | No `index.html` directly inside `single/<name>/`                                                    |
| Assets 404 in `dist/` but work locally       | Absolute paths (`/css/…`) or a reference outside the page directory                                 |
| Stale content during `npm start`             | `copySingle` uses `gulp-newer`; touch the file or restart the watcher                               |
| Formatting differs from the rest of the repo | Expected — `single/` is in no Prettier or ESLint glob. Match the neighbouring pages' style by hand. |

## Note

`.github/workflows/deploy.yml` publishes all of `dist/`, so a new single page goes live on the next
push to `master` with no further configuration.
