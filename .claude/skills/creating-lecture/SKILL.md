---
name: creating-lecture
description: Use when adding, rewriting, renumbering, or removing a lecture in the SP or DB track of this repo — anything that touches [track]/data/lectures/lectureN.json or [track]/data/lectures.json.
---

# Creating a Lecture

## Overview

A lecture is one JSON file rendered through Mustache into `dist/[track]/lectures/lectureN.html`.
Nothing validates it. A wrong `type`, an unregistered lecture, or a broken neighbour reference all
build **successfully** and fail silently in the browser. The checklist below exists because the
build will not catch these for you.

## Track selection

| Track | Directory | Subject                      | Theme        |
| ----- | --------- | ---------------------------- | ------------ |
| `sp`  | `sp/`     | Assembly, NASM, Rust, Docker | Cyberpunk    |
| `db`  | `db/`     | SQL, NoSQL, database design  | Harry Potter |

The `track` field inside the JSON **and** the directory must agree. Placing an `"track": "sp"` file
in `db/data/lectures/` builds a DB-themed page with SP metadata — no warning.

## Steps

1. **Pick N.** `ls [track]/data/lectures/`. Numbers are dense and files are named `lectureN.json`
   (no zero-padding); the `number` field in `lectures.json` _is_ padded (`"07"`).

2. **Copy the template**, do not write from scratch:
   `cp [track]/data/lectures/_template.json [track]/data/lectures/lectureN.json`
   Files starting with `_` are skipped by the builder, so `_template.json` never produces output.

3. **Fill metadata**: `track`, `lectureNumber` (string), `lectureTitle`, `courseTitle`, `year`.

4. **Write the slides.** Content in **Ukrainian**; keys and `type` values in English. Follow the
   23-slide pedagogical flow in `AI_LECTURE_CREATION.md`. Field-by-field schemas for every slide
   type are in `SLIDE_TYPES_GUIDE.md` — read the schema for a type before using it rather than
   guessing field names; an unknown field is dropped without complaint.

   Minimum bar: a `title` slide, a `summary` slide, and at least one comprehension check
   (`quiz` or `common-mistake`).

5. **Register the lecture** in `[track]/data/lectures.json`, appended to `lectures[]`:

   ```json
   {
     "id": "lectureN",
     "number": "0N",
     "title": "Назва лекції",
     "description": "Короткий опис",
     "available": true,
     "statusText": "ДОСТУПНА",
     "file": "lectureN.html"
   }
   ```

   Skipping this is the single most common failure: the page builds, but no index links to it.

6. **Fix the neighbours.** Lectures cross-reference each other by hand. When inserting or
   renumbering, update in the _adjacent_ lecture files:
   - the `previous-lecture` slide of lecture N+1 (its `previousLecture` and recap `items`),
   - the `next-steps` slide of lecture N−1 (its `nextLecture`),
   - any `roadmap` or navigation `diagram` slide that names a lecture sequence.

   `grep -l "Лекція N" [track]/data/lectures/*.json` finds stale references.

7. **Build and verify.**

   ```bash
   npx gulp buildSPLectures    # or buildDBLectures — seconds, vs. a full npm run build
   npx gulp buildSPIndex       # regenerates the track index so the new entry appears
   ```

   Then confirm the output actually contains the slides:

   ```bash
   grep -c '<section' dist/sp/lectures/lectureN.html
   ```

   A count far below your slide count means slides rendered empty — almost always a `type` typo.

   A full `npm run build` also runs `checkLinks`, which fails the build on any dead internal link.
   If you registered the lecture with a wrong `file` value in `lectures.json`, that is now a build
   error naming the bad reference rather than a silent 404.

8. **Preview** with `npm start` → `http://localhost:3000/sp/` (or `/db/`).

## Common Mistakes

| Symptom                                        | Cause                                                         |
| ---------------------------------------------- | ------------------------------------------------------------- |
| Lecture missing from the index page            | Not added to `[track]/data/lectures.json`                     |
| Slide renders as a blank section               | `type` value is not one of the 19; check spelling and hyphens |
| Slide renders but fields are missing           | Wrong field names — check `SLIDE_TYPES_GUIDE.md`              |
| Nothing rebuilds                               | Filename starts with `_`, or you edited `dist/`               |
| Wrong theme applied                            | File is in the other track's directory                        |
| Neighbouring lectures point at the wrong topic | Step 6 skipped                                                |

## Notes

- Never edit `dist/` — `clean` deletes it on every build.
- The build **verifies** formatting and fails on unformatted source; it does not rewrite it. Run
  `npm run format` first if `validate` complains. A build leaves the working tree clean.
- Lecture JSON is excluded from the gulp `format` task but lint-staged reformats `*.json` on commit.
- A `diagram` slide's `mermaidCode` may keep its `%%{init}%%` directive and per-node `fill:` colours
  — both are stripped at render time so the track theme wins. Don't add them expecting an effect.
