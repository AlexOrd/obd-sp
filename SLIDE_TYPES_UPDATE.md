# 🎓 Оновлення структури слайдів (v2.0)

## 📋 Що було зроблено

### 1. Створено модульну систему шаблонів

**До:** Всі типи слайдів були в одному файлі `lecture-slide.mustache` (120+ рядків)

**Після:** Кожен тип слайду має окремий файл у `src/templates/slides/`:
- `title.mustache` — Титульний слайд
- `roadmap.mustache` — Дорожня карта (план лекції)
- `previous-lecture.mustache` — Огляд попередньої лекції
- `definition.mustache` — Ключове поняття з аналогією
- `syntax.mustache` — Розбір синтаксису
- `code-example.mustache` — Приклад коду
- `code-breakdown.mustache` — Покроковий розбір коду
- `diagram.mustache` — Діаграми та візуалізації
- `comparison.mustache` — Порівняння двох підходів
- `debugger.mustache` — Робота з GDB
- `common-mistake.mustache` — Часті помилки
- `summary.mustache` — Підсумок лекції
- `next-steps.mustache` — Наступні кроки та ресурси

### 2. Оновлено Gulp pipeline

**Файл:** `gulpfile.js`

**Зміни:**
- Додано завантаження Mustache партіалів з `src/templates/slides/`
- Додано генерацію булевих прапорців для кожного типу слайду (`isTitle`, `isRoadmap`, тощо)
- Партіали передаються в `mustache()` як третій параметр

```javascript
// Завантаження партіалів
const partialsDir = 'src/templates/slides/';
const partials = {};
fs.readdirSync(partialsDir).forEach(file => {
  const partialName = 'slides/' + file.replace('.mustache', '');
  partials[partialName] = fs.readFileSync(partialsDir + file, 'utf8');
});

// Генерація булевих прапорців
lectureData.slides = lectureData.slides.map(slide => {
  return {
    ...slide,
    isTitle: slide.type === 'title',
    isRoadmap: slide.type === 'roadmap',
    // ... тощо для всіх 13 типів
  };
});

// Використання партіалів
.pipe(mustache({ ...layoutData, lecture: lectureData }, {}, partials))
```

### 3. Оновлено головний шаблон лекції

**Файл:** `src/templates/lecture-slide.mustache`

**До:**
```mustache
{{#title}}
<section>
  <h1>{{title}}</h1>
  <!-- ... багато HTML коду ... -->
</section>
{{/title}}

{{#content}}
<section>
  <!-- ... багато HTML коду ... -->
</section>
{{/content}}
```

**Після:**
```mustache
{{#isTitle}}
{{> slides/title}}
{{/isTitle}}

{{#isRoadmap}}
{{> slides/roadmap}}
{{/isRoadmap}}

{{#isDefinition}}
{{> slides/definition}}
{{/isDefinition}}
```

### 4. Створено демонстраційну лекцію

**Файл:** `src/data/lectures/lecture0.json`

Містить приклади всіх 13 типів слайдів з реальним контентом про:
- Buffer Overflow
- Використання strcpy()
- Налагодження з GDB
- Часті помилки в C
- Тощо

### 5. Оновлено список лекцій

**Файл:** `src/data/lectures.json`

Додано запис для демо-лекції:
```json
{
  "id": "lecture0",
  "number": "00",
  "title": "Демонстрація всіх типів слайдів",
  "description": "Довідник для викладачів — приклади всіх 13 типів слайдів",
  "available": true,
  "statusText": "DEMO",
  "file": "lecture0.html"
}
```

### 6. Створено документацію

**Нові файли:**
- `SLIDE_TYPES_GUIDE.md` — Детальний довідник з JSON-прикладами для всіх 13 типів
- `SLIDE_TYPES_UPDATE.md` — Цей файл (опис оновлення)

**Оновлені файли:**
- `README.md` — Додано розділ про 13 типів слайдів, посилання на довідник

---

## 📊 Порівняння версій

| Аспект | v1.0 | v2.0 |
|--------|------|------|
| **Типів слайдів** | 6 | 13 |
| **Структура шаблонів** | Монолітна | Модульна |
| **Розмір головного шаблону** | ~120 рядків | ~50 рядків |
| **Підтримка партіалів** | ❌ | ✅ |
| **Демо-лекція** | ❌ | ✅ (Lecture 0) |
| **Документація типів** | Базова | Повна (SLIDE_TYPES_GUIDE.md) |

---

## 🎯 Переваги нової структури

### 1. Модульність
- Кожен тип слайду — окремий файл
- Легко додавати нові типи
- Простіше підтримувати і оновлювати

### 2. Читабельність
- Головний шаблон став компактнішим
- Логіка кожного типу ізольована
- Простіше знайти потрібний код

### 3. Розширюваність
- Додати новий тип = створити 1 файл + 2 рядки в gulpfile.js
- Не потрібно редагувати великий монолітний файл

### 4. Педагогічна цінність
- 13 типів покривають різні навчальні сценарії
- Lecture 0 — готовий довідник для викладачів
- Структурований підхід до створення лекцій

---

## 🚀 Як використовувати нові типи слайдів

### Приклад 1: Додати визначення терміна

```json
{
  "type": "definition",
  "title": "Що таке Stack?",
  "term": "Stack (Стек)",
  "definition": "Область пам'яті, яка зберігає локальні змінні та адреси повернення функцій. Працює за принципом LIFO (Last In, First Out).",
  "analogy": "Уявіть стопку тарілок: ви можете покласти нову тарілку тільки зверху і взяти теж тільки верхню."
}
```

### Приклад 2: Порівняти два підходи

```json
{
  "type": "comparison",
  "title": "Stack vs Heap",
  "leftTitle": "Stack",
  "leftItems": [
    "Автоматичне управління",
    "Швидкий доступ",
    "Обмежений розмір",
    "LIFO структура"
  ],
  "rightTitle": "Heap",
  "rightItems": [
    "Ручне управління (malloc/free)",
    "Повільніший доступ",
    "Великий розмір",
    "Довільний доступ"
  ]
}
```

### Приклад 3: Покрокове пояснення коду

```json
{
  "type": "code-breakdown",
  "title": "Аналіз функції",
  "language": "c",
  "code": "void swap(int *a, int *b) {\n    int temp = *a;\n    *a = *b;\n    *b = temp;\n}",
  "steps": [
    "Зберігаємо значення <code>*a</code> в тимчасову змінну",
    "Записуємо в <code>*a</code> значення з <code>*b</code>",
    "Записуємо в <code>*b</code> збережене значення з <code>temp</code>",
    "Результат: значення обмінялися місцями"
  ]
}
```

---

## 📚 Рекомендовані патерни використання

### Структура типової лекції:

1. **title** — Титульний слайд
2. **roadmap** — План лекції
3. **previous-lecture** — Повторення (якщо не перша лекція)
4. **definition** — Ключові терміни (1-3 слайди)
5. **syntax** / **code-example** — Синтаксис і приклади
6. **code-breakdown** — Детальний розбір
7. **diagram** — Візуалізації (за потреби)
8. **comparison** — Порівняння (за потреби)
9. **debugger** — Практика налагодження
10. **common-mistake** — Застереження
11. **summary** — Підсумок
12. **next-steps** — Що далі

---

## 🔧 Технічні деталі

### Як працюють партіали в Mustache:

```mustache
<!-- В головному шаблоні: -->
{{#isTitle}}
{{> slides/title}}
{{/isTitle}}

<!-- Mustache шукає партіал 'slides/title' і підставляє вміст title.mustache -->
<!-- Контекст даних зберігається (всі поля з JSON доступні в партіалі) -->
```

### Як додати новий тип слайду:

1. **Створити шаблон:** `src/templates/slides/my-type.mustache`
2. **Оновити gulpfile.js:**
   ```javascript
   isMyType: slide.type === 'my-type',
   ```
3. **Оновити lecture-slide.mustache:**
   ```mustache
   {{#isMyType}}
   {{> slides/my-type}}
   {{/isMyType}}
   ```
4. **Додати приклад в lecture0.json**
5. **Задокументувати в SLIDE_TYPES_GUIDE.md**

---

## ✅ Результати

- ✅ Збірка успішна (`npm run build`)
- ✅ Dev-сервер працює (`npm run dev`)
- ✅ Lecture 0 відображається коректно
- ✅ Всі 13 типів слайдів функціонують
- ✅ Документація створена

---

## 📖 Додаткова інформація

- **[SLIDE_TYPES_GUIDE.md](./SLIDE_TYPES_GUIDE.md)** — Повний довідник з JSON-схемами
- **[README.md](./README.md)** — Загальна документація проекту
- **[QUICKSTART.md](./QUICKSTART.md)** — Швидкий старт для початківців

---

**Версія:** 2.0
**Дата:** 2024
**Автор:** VTFK Education Team
