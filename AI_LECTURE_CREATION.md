# AI Lecture Creation Guide

Audience: AI agents generating lectures for the OBD-SP platform. Keep lecture content in **Ukrainian**; keep docs and code comments in **English**.

Tracks:

- **SP (System Programming)** — Cyberpunk theme, path `sp/`
- **DB (Databases)** — Harry Potter theme, path `db/`

Sources of truth: [AI_PROJECT_SUMMARY.md](AI_PROJECT_SUMMARY.md), this guide, and [SLIDE_TYPES_GUIDE.md](SLIDE_TYPES_GUIDE.md).

---

## Supported Slide Types (19)

Shared templates live in `[track]/templates/slides/`. Available `type` values:
`title`, `roadmap`, `previous-lecture`, `definition`, `syntax`, `code-example`, `code-breakdown`, `diagram`, `comparison`, `debugger`, `common-mistake`, `summary`, `next-steps`, `live-coding`, `content`, `list`, `table`, `timeline`, `quiz`.

See [SLIDE_TYPES_GUIDE.md](SLIDE_TYPES_GUIDE.md) for JSON fields and examples.

---

## Data Locations and Required Fields

- SP lecture file: `sp/data/lectures/lectureN.json`
- DB lecture file: `db/data/lectures/lectureN.json`
- Track listing: `sp/data/lectures.json` or `db/data/lectures.json`

Minimal lecture JSON:

```json
{
  "track": "sp",
  "lectureNumber": "N",
  "lectureTitle": "Назва лекції",
  "courseTitle": "Спеціалізовані мови програмування",
  "year": "2025",
  "slides": [
    { "type": "title", "title": "ЛЕКЦІЯ N", "subtitle": "Назва" },
    { "type": "summary", "title": "Підсумок", "items": ["Висновок 1"] }
  ]
}
```

Add the lecture to the track listing:

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

---

## Recommended Lecture Structure (20+3, detailed)

Applies to **every lecture**. Use only the supported `type` values; pick the closest match below. Align existing lectures to this flow.

**Block 1 — Вступ та контекст (1–3)**

1. Титульний — `title`
   - Включити: назву дисципліни, повну назву теми, номер лекції, викладача (UA/EN), інституцію, рік.
2. Навігація в курсі — `diagram` (flowchart) або `roadmap`
   - Показати попередню тему, поточну, наступну; виділити активну.
3. Проблематика та актуальність — `list` або `content`
   - Сформулювати біль/обмеження без теми; відповісти «навіщо ця технологія/підхід?».

**Block 2 — Глибинна теорія (4–14)**

4. Визначення та класифікація — `definition`
   - Формальне визначення; клас/категорія; коротка аналогія за потреби.
5. Концептуальна модель — `diagram`
   - Абстрактна схема принципу роботи без коду (можна Mermaid flowchart/graph).
6. Формальний синтаксис / сигнатура — `syntax`
   - Шаблон виклику/команди; пояснення параметрів і повернень.
7. Внутрішня архітектура — `diagram`
   - «Under the hood»: памʼять/процесор/диск/мережа; основні блоки й потоки даних.
8. Базовий приклад реалізації — `code-example`
   - Мінімальний робочий кейс («Hello world» для теми) з коротким описом.
9. Методи та операції — `table` або `list`
   - API/функції/прапорці/атрибути, стислий опис, за потреби приклади значень.
10. Життєвий цикл та ресурси — `timeline`

- Створення → використання → завершення; хто створює/звільняє ресурси.

11. Продуктивність та обмеження — `content` (+`table`/графік за потреби)

- Складність, латентність, памʼять, throughput; коли рішення оптимальне/неоптимальне.

12. Стандарти індустрії (best practices) — `list`

- Стиль коду, іменування, безпека; 5–7 перевірених правил.

13. Типові помилки (anti-patterns) — `common-mistake` або `comparison`

- Часті баги, небезпечні конструкції; «wrong vs right» з поясненням.

14. Проміжний контроль — `quiz`

- 1–2 питання для перевірки розуміння теорії.

**Block 3 — Практикум та Live Coding (15–20)**

15. Технічне завдання (ТЗ) — `content` або `list`

- Вхідні дані, очікуваний результат, критерії готовності.

16. Проєктування рішення — `diagram` (flowchart) або псевдокод у `content`

- Алгоритм крок за кроком; гілки рішень; ключові структури.

17. Налаштування середовища — `code-example` (bash) або `syntax`

- Команди інсталяції, імпорти, конфіг, права доступу.

18. Live Coding (заставка) — `live-coding`

- Статичний placeholder, поки викладач працює в IDE.

19. Аналіз результату — `table` або `content`

- Логи, скрін консолі, метрики; короткий висновок проти ТЗ.

20. Фінальний код рішення — `code-breakdown` або `code-example`

- Повний лістинг підсумкової програми з ключовими коментарями.

**Block 4 — Завершення (21–23)**

21. Підсумки (key takeaways) — `summary`

- 3–4 головні тези; що студент має запамʼятати.

22. СРС / самостійна робота — `next-steps`

- Завдання, формат здачі, дедлайни, критерії оцінки, ресурси.

23. Документація та Q&A — `next-steps` або `content`

- Офіційні лінки, RFC/ISO, додаткові матеріали, місце для питань.

Mandatory: завжди мати `title` і `summary`, плюс щонайменше один контроль розуміння (`quiz` або `common-mistake`).

---

## Creation Steps

1. Pick track (SP/DB) and copy a template: `sp/data/lectures/_template.json` or `db/data/lectures/_template.json`.
2. Fill metadata (`track`, `lectureNumber`, `lectureTitle`, `courseTitle`, `year`).
3. Build the 23-slide flow using the mappings above; keep content in Ukrainian.
4. Append the lecture entry to the track’s `lectures.json`.
5. Update all lectures’ navigation/roadmap slides to reflect the new lecture (prev/now/next). This applies to every existing lecture in the track.
6. Validate JSON (no trailing commas, correct types).
7. Build: `npm run build` (or `npm run build:prod`).
8. Verify output at `dist/sp/lectures/lectureN.html` or `dist/db/lectures/lectureN.html` and on the landing/index pages.

---

## Quick Checklist

- [ ] Track chosen (SP/DB) and `track` field set
- [ ] 23-slide layout applied with supported `type` values
- [ ] Lecture JSON added under the correct track folder
- [ ] Entry added to `lectures.json`
- [ ] Roadmap/navigation slides in all lectures updated with the new lecture
- [ ] Content in Ukrainian; docs/comments stay in English
- [ ] `npm run build` passes; output present in `dist/[track]/lectures/`

---

## Common Pitfalls

1. Missing `track` or wrong folder (SP vs DB)
2. Using unsupported `type` values — stick to the 19 listed templates
3. Skipping required slides (`title`, `summary`, at least one checkpoint like `quiz`/`common-mistake`)
4. English lecture text — must be Ukrainian
5. Forgetting to update `lectures.json`, so the lecture never appears on the index

---

## Pointers

- [SLIDE_TYPES_GUIDE.md](SLIDE_TYPES_GUIDE.md) — field-by-field slide schemas
- [AI_PROJECT_SUMMARY.md](AI_PROJECT_SUMMARY.md) — architecture and rules
- [README.md](README.md) — project overview, scripts, and structure
