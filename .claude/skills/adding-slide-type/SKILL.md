---
name: adding-slide-type
description: Use when adding a new slide type to the presentation system, renaming an existing one, or debugging a slide that builds without error but renders as an empty section.
---

# Adding a Slide Type

## Overview

Mustache is logic-less and cannot compare strings, so `gulpfile.js` translates each slide's `type`
into a boolean flag (`"code-example"` → `isCodeExample: true`) and `lecture-slide.html` dispatches on
that flag. The type name therefore lives in **four places per track, eight total** — and the build
reports success no matter how many of them you miss. A partially-wired type renders as nothing.

Do all eight edits, or the type is broken.

## The eight edits

For **each** track (`sp` and `db` — they are independent, near-identical trees):

| #   | File                                                           | Edit                                                                                 |
| --- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| 1   | `[track]/templates/slides/<type>.html`                         | New partial. Auto-registered as `slides/<type>` by basename — no manifest to update. |
| 2   | `gulpfile.js` → `buildSPLectures` / `buildDBLectures` flag map | Add `isYourType: slide.type === 'your-type',`                                        |
| 3   | `[track]/templates/lecture-slide.html`                         | Add `{{#isYourType}} {{> slides/your-type}} {{/isYourType}}` to the dispatch chain   |
| 4   | `[track]/css/<theme>-theme.css`                                | Style it with existing theme variables                                               |

Edits 2 and 3 are the ones that fail silently. The two flag maps in `gulpfile.js` are duplicated
copies, not shared code — patch both.

Then update the docs, which are the source of truth agents read:

- `SLIDE_TYPES_GUIDE.md` — add the JSON schema and a worked example; bump the count in the header
- `AI_LECTURE_CREATION.md` — add to the supported-types list
- `CLAUDE.md` and `README.md` — the "19 slide types" count and enumeration

## Naming

Type strings are kebab-case (`common-mistake`), flags are `is` + PascalCase (`isCommonMistake`),
partial filenames match the type exactly (`common-mistake.html`). A mismatch between the partial
filename and the `{{> slides/...}}` reference throws at build time — that one is loud. The flag
mismatches are not.

## Writing the partial

Model it on a sibling in the same track — the theme wrapper markup differs between SP and DB, so
copy from `sp/templates/slides/` for SP and `db/templates/slides/` for DB. Never copy a partial
across tracks.

Inside a partial the slide object is the current Mustache context, so fields are referenced directly
(`{{title}}`, `{{#items}}...{{/items}}`). Track-level layout data (`teacherName`, `footer`, …) is
also in scope from the parent context.

Reveal.js expects each slide to be a `<section>`.

## Verify

```bash
# add a slide of the new type to a scratch lecture, then:
npx gulp buildSPLectures
grep -c 'your-distinctive-markup' dist/sp/lectures/lectureN.html   # must be > 0
npx gulp buildDBLectures
grep -c 'your-distinctive-markup' dist/db/lectures/lectureN.html   # must be > 0
```

A zero count with a successful build means the flag (edit 2) or the dispatch section (edit 3) is
missing for that track. Both tracks must be checked separately — one passing proves nothing about
the other.

## Debugging an empty slide

Work backwards through the chain:

1. Is `type` spelled exactly right in the lecture JSON?
2. Does the flag exist in the flag map **for that track's builder**?
3. Is there a `{{#isX}}` section in **that track's** `lecture-slide.html`?
4. Does `[track]/templates/slides/<type>.html` exist?

## Aliases

`isCodeExample` is `slide.type === 'code-example' || slide.type === 'code'` — `"type": "code"` is an
undocumented alias kept for existing lectures. If you need an alias for a new type, write it the same
way: one entry with an `||`. Never declare the key twice; `no-dupe-keys` is enabled and will fail
the build.
