# Slide Types Guide

Language: English documentation; lecture content remains Ukrainian. All slide templates live in `[track]/templates/slides/` for both SP and DB tracks.

Supported slide `type` values (19):
`title`, `roadmap`, `previous-lecture`, `definition`, `syntax`, `code-example`, `code-breakdown`, `diagram`, `comparison`, `debugger`, `common-mistake`, `summary`, `next-steps`, `live-coding`, `content`, `list`, `table`, `timeline`, `quiz`.

Use only these values in lecture JSON.

---

## 1. Title

Purpose: Opening slide with lecture metadata.

```json
{
  "type": "title",
  "title": "ЛЕКЦІЯ 1",
  "subtitle": "Назва теми",
  "module": "Модуль 1",
  "course": "Назва курсу",
  "instructor": "Ім'я викладача",
  "institution": "VTFK",
  "date": "2025"
}
```

## 2. Roadmap

Purpose: Lecture plan / agenda.

```json
{
  "type": "roadmap",
  "title": "План лекції",
  "items": ["Тема 1", "Тема 2", "Тема 3"],
  "note": "Коротка примітка"
}
```

## 3. Previous Lecture

Purpose: Recap of prior material.

```json
{
  "type": "previous-lecture",
  "title": "Що ми вивчили минулого разу",
  "previousLecture": "Лекція 0: Вступ",
  "items": ["Ключ 1", "Ключ 2"]
}
```

## 4. Definition

Purpose: Term definition with analogy.

```json
{
  "type": "definition",
  "title": "Ключове поняття",
  "term": "Термін",
  "definition": "Формальне визначення",
  "analogy": "Аналогія для розуміння"
}
```

## 5. Syntax

Purpose: Formal syntax or signature.

```json
{
  "type": "syntax",
  "title": "Синтаксис",
  "syntax": "int main(int argc, char *argv[])",
  "parts": [
    { "part": "int", "description": "тип повернення", "color": "#fcee0a" },
    { "part": "main", "description": "назва функції", "color": "#00f0ff" }
  ]
}
```

## 6. Code Example

Purpose: Minimal runnable example.

```json
{
  "type": "code-example",
  "title": "Приклад коду",
  "description": "Що робить цей код",
  "language": "c",
  "code": "#include <stdio.h>\nint main(){ printf(\"Hello\"); return 0; }",
  "note": "Додаткова примітка"
}
```

## 7. Code Breakdown

Purpose: Code with step-by-step explanation.

```json
{
  "type": "code-breakdown",
  "title": "Покроковий розбір",
  "language": "c",
  "code": "int x = 5;\nint y = x * 2;\nprintf(\"%d\", y);",
  "steps": ["x = 5", "y = 10", "Вивід 10"]
}
```

## 8. Diagram

Purpose: Conceptual or architectural diagram (Mermaid or ASCII).

```json
{
  "type": "diagram",
  "title": "Модель",
  "description": "Що показує діаграма",
  "mermaidCode": "flowchart LR; A-->B; B-->C;"
}
```

## 9. Comparison

Purpose: Two-column contrast.

```json
{
  "type": "comparison",
  "title": "Підходи",
  "leftTitle": "Варіант A",
  "leftItems": ["Плюс 1", "Плюс 2"],
  "rightTitle": "Варіант B",
  "rightItems": ["Плюс 1", "Плюс 2"]
}
```

## 10. Debugger

Purpose: Debug workflow and commands.

```json
{
  "type": "debugger",
  "title": "GDB",
  "language": "c",
  "code": "int main(){return 0;}",
  "commands": ["gcc -g main.c -o main", "gdb ./main", "break main", "run"],
  "note": "Корисна порада"
}
```

## 11. Common Mistake

Purpose: Wrong vs correct code.

```json
{
  "type": "common-mistake",
  "title": "Часта помилка",
  "warning": "Що піде не так",
  "language": "c",
  "wrongCode": "char *s = malloc(4); strcpy(s, \"long\");",
  "wrongExplanation": "Переповнення",
  "correctCode": "char *s = malloc(8); strcpy(s, \"long\");",
  "correctExplanation": "Достатньо пам'яті"
}
```

## 12. Summary

Purpose: Key takeaways.

```json
{
  "type": "summary",
  "title": "Підсумок",
  "items": ["Тезис 1", "Тезис 2", "Тезис 3"],
  "note": "Заключення"
}
```

## 13. Next Steps

Purpose: Resources and what’s next.

```json
{
  "type": "next-steps",
  "title": "Що далі",
  "nextLecture": "Лекція 2",
  "resources": [{ "title": "Документація", "url": "https://example.com" }, { "title": "Книга" }]
}
```

## 14. Live Coding

Purpose: Placeholder while coding live.

```json
{
  "type": "live-coding",
  "title": "Live Coding",
  "description": "Що будемо робити",
  "actionItems": ["Крок 1", "Крок 2", "Крок 3"]
}
```

## 15. Content

Purpose: Flexible text block (context, problem statement, notes).

```json
{
  "type": "content",
  "title": "Контекст",
  "text": "Короткий зміст або мотивація",
  "items": ["Факт 1", "Факт 2"]
}
```

## 16. List

Purpose: Structured list with optional subtitles.

```json
{
  "type": "list",
  "title": "Список",
  "items": [{ "title": "Пункт 1", "details": ["Деталь 1"] }, { "title": "Пункт 2" }]
}
```

## 17. Table

Purpose: Tabular data (methods, flags, metrics).

```json
{
  "type": "table",
  "title": "Методи",
  "headers": ["Метод", "Опис"],
  "rows": [
    ["connect()", "Встановлює з'єднання"],
    ["close()", "Закриває з'єднання"]
  ]
}
```

## 18. Timeline

Purpose: Lifecycle or historical milestones.

```json
{
  "type": "timeline",
  "title": "Життєвий цикл",
  "description": "Етапи",
  "events": [
    { "year": "T0", "label": "Створення", "description": "init" },
    { "year": "T1", "label": "Робота", "description": "running" }
  ]
}
```

## 19. Quiz

Purpose: Quick knowledge check.

```json
{
  "type": "quiz",
  "title": "Швидка перевірка",
  "question": "Що означає SQL?",
  "options": [
    { "text": "Simple Query Language", "correct": false },
    { "text": "Structured Query Language", "correct": true },
    { "text": "Sequential Query Language", "correct": false }
  ],
  "explanation": "Правильна відповідь: Structured Query Language"
}
```

---

## Usage Notes

- Place lecture JSON in the correct track folder: `sp/data/lectures/` or `db/data/lectures/`.
- Always include at least `title` and `summary`; add `quiz` or `common-mistake` for understanding checks.
- Colors in syntax slides: yellow `#fcee0a`, cyan `#00f0ff`, magenta `#ff00ff`, green `#00ff00`.
- Keep content Ukrainian; keep keys/structure in English.

---

## Minimal Lecture Skeleton

```json
{
  "track": "sp",
  "lectureNumber": "1",
  "lectureTitle": "Назва",
  "courseTitle": "Курс",
  "year": "2025",
  "slides": [
    { "type": "title", "title": "ЛЕКЦІЯ 1", "subtitle": "Назва" },
    { "type": "summary", "title": "Підсумок", "items": ["Висновок 1"] }
  ]
}
```

---

Author: VTFK Education System — Updated: 2025
