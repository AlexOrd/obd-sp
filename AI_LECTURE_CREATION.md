# AI Lecture Creation Guide

## Overview

This guide provides instructions for AI agents to create new lectures for the OBD-SP education platform.

The platform supports **two independent lecture tracks**:

- **SP (System Programming)** - Cyberpunk 2077 theme, focused on system-level programming
- **DB (Databases)** - Harry Potter magical theme, focused on database fundamentals

**Important**: All lecture content (titles, descriptions, explanations, code comments) must be in **Ukrainian**.

---

## Available Slide Types

The project has **14 slide templates** located in `src/templates/slides/`:

| Template File           | Type               | Purpose                                       |
| ----------------------- | ------------------ | --------------------------------------------- |
| `title.html`            | `title`            | Opening slide with lecture title and metadata |
| `roadmap.html`          | `roadmap`          | Lecture plan with topic list                  |
| `previous-lecture.html` | `previous-lecture` | Recap of previous lecture                     |
| `definition.html`       | `definition`       | Key term with definition and analogy          |
| `syntax.html`           | `syntax`           | Syntax breakdown with color-coded parts       |
| `code-example.html`     | `code-example`     | Code snippet with description                 |
| `code-breakdown.html`   | `code-breakdown`   | Code with step-by-step explanation            |
| `diagram.html`          | `diagram`          | ASCII art or image diagrams                   |
| `comparison.html`       | `comparison`       | Two-column comparison (pros/cons, approaches) |
| `debugger.html`         | `debugger`         | Debugging workflow with GDB commands          |
| `common-mistake.html`   | `common-mistake`   | Wrong vs correct code examples                |
| `summary.html`          | `summary`          | Key takeaways from the lecture                |
| `next-steps.html`       | `next-steps`       | Resources and next lecture preview            |
| `live-coding.html`      | `live-coding`      | Interactive coding with animated terminal     |

**Reference**: See `SLIDE_TYPES_GUIDE.md` for detailed JSON schemas and examples in Ukrainian.

---

## Files to Update When Creating a New Lecture

### 1. Choose Your Track

Determine which track the lecture belongs to:

- **SP Track**: System programming topics (C/C++, memory, processes, etc.) - Cyberpunk theme
- **DB Track**: Database topics (SQL, NoSQL, design, optimization, etc.) - Harry Potter theme

### 2. Create Lecture Data File

**For SP Track**: `sp/data/lectures/lectureN.json`
**For DB Track**: `db/data/lectures/lectureN.json`

(where N is the lecture number)

**Structure**:

```json
{
  "track": "sp", // or "db" - REQUIRED field
  "lectureNumber": "N",
  "lectureTitle": "Назва лекції (Ukrainian)",
  "courseTitle": "Спеціалізовані мови програмування", // or "Основи баз даних"
  "year": "2025",
  "slides": [
    {
      "type": "title",
      "title": "ЛЕКЦІЯ N",
      "subtitle": "Назва лекції",
      "meta": {
        "course": "Основи баз даних та спеціалізовані мови програмування",
        "institution": "VTFK • 2025"
      }
    },
    {
      "type": "roadmap",
      "title": "План лекції",
      "items": ["Тема 1", "Тема 2", "Тема 3"]
    },
    {
      "type": "summary",
      "title": "Підсумок",
      "items": ["Висновок 1", "Висновок 2"]
    }
  ]
}
```

**Templates**:

- **SP**: Use `sp/data/lectures/_template.json` or `sp/data/lectures/lecture0.json` as examples
- **DB**: Use `db/data/lectures/_template.json` or `db/data/lectures/lecture1.json` as examples

### 3. Update Track Lectures List

**For SP Track**: Edit `sp/data/lectures.json`
**For DB Track**: Edit `db/data/lectures.json`

Add new lecture entry to the `lectures` array:

```json
{
  "lectures": [
    {
      "id": "lectureN",
      "number": "0N",
      "title": "Назва лекції",
      "description": "Короткий опис теми",
      "available": true,
      "statusText": "ДОСТУПНА",
      "file": "lectureN.html"
    }
  ]
}
```

### 4. Build and Deploy

Run build command:

```bash
npm run build
```

**Output**:

- **SP lectures**: `dist/sp/lectures/lectureN.html`
- **DB lectures**: `dist/db/lectures/lectureN.html`

**Verify**:

- Open `http://localhost:3000` (if dev server running with `npm start`)
- Landing page shows both SP (Cyberpunk) and DB (Harry Potter) sections
- Click on appropriate track section
- Check that new lecture appears on track's index page
- Click to view the lecture slides

---

## Recommended Lecture Structure

Typical lecture flow:

1. **title** - Opening slide
2. **roadmap** - Lecture plan
3. **previous-lecture** - Review (optional, skip for first lecture)
4. **definition** - Key concepts (1-3 slides)
5. **code-example** / **syntax** - Examples
6. **code-breakdown** - Detailed walkthrough
7. **diagram** - Visual explanations (optional)
8. **comparison** - Alternative approaches (optional)
9. **live-coding** - Practice session (optional)
10. **common-mistake** - Pitfalls to avoid
11. **debugger** - Debugging practice (optional)
12. **summary** - Key takeaways
13. **next-steps** - Resources and preview

---

## Quick Checklist

- [ ] Choose track: SP (system programming) or DB (databases)
- [ ] Create `sp/data/lectures/lectureN.json` or `db/data/lectures/lectureN.json` with Ukrainian content
- [ ] Add `"track": "sp"` or `"track": "db"` field to JSON
- [ ] Add entry to `sp/data/lectures.json` or `db/data/lectures.json`
- [ ] Run `npm run build`
- [ ] Verify output in `dist/sp/lectures/lectureN.html` or `dist/db/lectures/lectureN.html`
- [ ] Check landing page and track index page displays new lecture

---

## Common Mistakes to Avoid

1. **Language**: All content must be in Ukrainian (titles, descriptions, code comments)
2. **Lecture numbering**: Use consistent numbering (lectureN.json, "number": "N")
3. **Required slides**: Include at least `title` and `summary` slides
4. **JSON syntax**: Validate JSON format (no trailing commas, proper quotes)
5. **Build errors**: Run `npm run build` to catch errors before deployment

---

## Additional Resources

- `SLIDE_TYPES_GUIDE.md` - Complete JSON schemas for all 14 slide types (Ukrainian)
- `CODE_QUALITY.md` - Code formatting and linting rules
- `README.md` - Project overview and setup
