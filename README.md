# OBD-SP - Основи Баз Даних та Спеціалізовані мови програмування

Курс лекцій з використанням Mustache templates, Gulp build system та cyberpunk-тематики.

## ✨ Нові можливості (v2.0)

- ✅ **13 типів слайдів** для структурованого навчання
- ✅ **Модульна архітектура** — окремі Mustache шаблони для кожного типу слайду
- ✅ **Демонстраційна лекція** (Lecture 0) з прикладами всіх типів
- ✅ **Детальний довідник** — [SLIDE_TYPES_GUIDE.md](./SLIDE_TYPES_GUIDE.md)

## 🎨 Дизайн

### Головна сторінка (index.html)
- **Стиль**: Cyberpunk 2077 aesthetic
- **Ефекти**: Glitch animations, neon glow, animated grid, scanlines
- **Підтримка**: Кирилиця

### Лекції (Reveal.js)
- **Фреймворк**: Reveal.js 5.0.4
- **Тема**: Cyberpunk 2077 (кастомна)
- **Палітра**:
  - Жовтий (#fcee0a)
  - Cyan (#00f0ff)
  - Magenta (#ff00ff)
  - Червоний (#ff003c)
- **Ефекти**: Glitch анімація для заголовків, pixel art рамки, scanlines
- **Шрифти**:
  - Chakra Petch (основний текст)
  - Orbitron (заголовки)
  - Share Tech Mono (code)
- **Підсвічування коду**: Highlight.js з темою Monokai

## 📁 Структура проєкту

```
obd-sp/
├── src/                          # Вихідні файли
│   ├── templates/                # Mustache шаблони
│   │   ├── index.mustache       # Шаблон головної сторінки
│   │   ├── lecture-slide.mustache # Шаблон слайдів лекції
│   │   └── slides/              # 🆕 Окремі шаблони для кожного типу слайду
│   │       ├── title.mustache
│   │       ├── roadmap.mustache
│   │       ├── previous-lecture.mustache
│   │       ├── definition.mustache
│   │       ├── syntax.mustache
│   │       ├── code-example.mustache
│   │       ├── code-breakdown.mustache
│   │       ├── diagram.mustache
│   │       ├── comparison.mustache
│   │       ├── debugger.mustache
│   │       ├── common-mistake.mustache
│   │       ├── summary.mustache
│   │       └── next-steps.mustache
│   ├── data/                     # JSON дані
│   │   ├── lectures.json        # Загальні дані (список лекцій)
│   │   └── lectures/            # Дані окремих лекцій
│   │       ├── lecture0.json    # 🆕 DEMO — всі типи слайдів
│   │       ├── lecture1.json    # Лекція 1
│   │       ├── lecture2.json    # Лекція 2 (створити)
│   │       └── _template.json   # 🆕 Шаблон для нових лекцій
│   ├── css/                      # Стилі
│   │   ├── main.css             # Стилі головної сторінки
│   │   └── cyberpunk-theme.css  # Тема для Reveal.js
│   └── js/                       # JavaScript (якщо потрібен)
├── dist/                         # Зібрані файли (генерується)
│   ├── index.html
│   ├── lectures/
│   ├── css/
│   └── js/
├── package.json                  # NPM конфігурація
├── gulpfile.js                   # Gulp tasks
├── .gitignore
├── README.md                     # Загальна документація
├── SLIDE_TYPES_GUIDE.md          # 🆕 Детальний довідник по типах слайдів
├── QUICKSTART.md                 # Швидкий старт
└── REFACTORING_SUMMARY.md        # Історія рефакторингу
```

## 🚀 Швидкий старт

### 1. Встановити залежності
```bash
npm install
```

### 2. Запустити Development сервер
```bash
npm run dev
```
Відкриється браузер на `http://localhost:3000` з автоматичним перезавантаженням.

### 3. Зібрати Production версію
```bash
npm run build
```
Мінімізовані файли будуть в папці `dist/`

## 📝 Як додати нову лекцію

**Детальну інструкцію з прикладами всіх типів слайдів див. у [SLIDE_TYPES_GUIDE.md](./SLIDE_TYPES_GUIDE.md)**

### Швидкий старт:

1. **Скопіюйте шаблон:** `src/data/lectures/_template.json` → `lecture2.json`
2. **Заповніть метадані та слайди** (використовуйте один з 13 типів)
3. **Додайте в список:** оновіть `src/data/lectures.json`
4. **Зберіть:** `npm run dev`

### Приклад мінімальної лекції:

```json
{
  "lectureNumber": 2,
  "lectureTitle": "Моя лекція",
  "courseTitle": "Курс програмування",
  "year": "2024",
  "slides": [
    {
      "type": "title",
      "title": "Моя лекція",
      "subtitle": "Підзаголовок",
      "course": "Курс програмування"
    },
    {
      "type": "summary",
      "title": "Підсумок",
      "items": ["Висновок 1", "Висновок 2"]
    }
  ]
}
```

## 🎯 13 типів слайдів

| № | Тип | Призначення |
|---|-----|-------------|
| 1 | `title` | Титульний слайд лекції |
| 2 | `roadmap` | План лекції (дорожня карта) |
| 3 | `previous-lecture` | Огляд попередньої лекції |
| 4 | `definition` | Ключове поняття / визначення |
| 5 | `syntax` | Розбір синтаксису конструкцій |
| 6 | `code-example` | Приклад коду з поясненням |
| 7 | `code-breakdown` | Покроковий розбір коду |
| 8 | `diagram` | Діаграма / візуалізація |
| 9 | `comparison` | Порівняння двох підходів |
| 10 | `debugger` | Робота з відладчиком (GDB) |
| 11 | `common-mistake` | Часта помилка + правильний варіант |
| 12 | `summary` | Підсумок лекції |
| 13 | `next-steps` | Наступні кроки та ресурси |

**📖 Детальну документацію з JSON-прикладами див. у [SLIDE_TYPES_GUIDE.md](./SLIDE_TYPES_GUIDE.md)**

**🎓 Демонстрацію всіх типів дивіться в Lecture 0:** `http://localhost:3000/lectures/lecture0.html`
    }
  ]
}
```

### 3. List Slide (Список)
```json
{
  "type": "list",
  "title": "Заголовок",
  "items": [
    {
      "text": "Пункт 1",
      "subitems": ["Підпункт 1.1", "Підпункт 1.2"]
    },
    {
      "text": "Пункт 2"
    }
  ]
}
```

### 4. Table Slide (Таблиця)
```json
{
  "type": "table",
  "title": "Заголовок",
  "headers": ["Колонка 1", "Колонка 2", "Колонка 3"],
  "rows": [
    ["Рядок 1, Комірка 1", "Рядок 1, Комірка 2", "Рядок 1, Комірка 3"],
    ["Рядок 2, Комірка 1", "Рядок 2, Комірка 2", "Рядок 2, Комірка 3"]
  ]
}
```

### 5. Code Slide (Код)
```json
{
  "type": "code",
  "title": "Заголовок",
  "description": "Опис коду",
  "language": "sql",
  "code": "SELECT * FROM users;\nWHERE age > 18;"
}
```

Підтримувані мови: `sql`, `javascript`, `python`, `java`, `html`, `css`, тощо.

### 6. Summary Slide (Підсумок)
```json
{
  "type": "summary",
  "title": "ПІДСУМОК",
  "items": [
    "Висновок 1",
    "Висновок 2",
    "Висновок 3"
  ],
  "footer": "Дякую за увагу! 💾"
}
```

## 🛠 Технології

- **Build System**: Gulp 5
- **Templates**: Mustache
- **CSS Minification**: gulp-clean-css
- **JS Minification**: gulp-terser
- **HTML Minification**: gulp-htmlmin
- **Dev Server**: BrowserSync (auto-reload)
- **Presentation**: Reveal.js 5
- **Syntax Highlighting**: Highlight.js
- **Fonts**: Google Fonts (Chakra Petch, Orbitron, Share Tech Mono)

## 📊 Gulp Commands

```bash
npm run dev      # Development mode (watch + live reload)
npm run build    # Production build (minified)
npm run clean    # Clean dist folder
```

## ✨ Особливості

- ✅ Повна підтримка кирилиці
- ✅ Glitch-ефект для заголовків
- ✅ Pixel art естетика з neon-ефектами
- ✅ Адаптивний дизайн
- ✅ Scanline ефект для екрану
- ✅ JSON-based content management
- ✅ Mustache templating
- ✅ Автоматична мінімізація (CSS, JS, HTML)
- ✅ Live reload development server
- ✅ Separation of concerns (data/templates/styles)

## 📝 Приклад робочого процесу

1. Напишіть контент лекції в JSON (`src/data/lectures/lectureX.json`)
2. Оновіть статус в `src/data/lectures.json`
3. Запустіть `npm run dev`
4. Редагуйте файли - браузер автоматично оновлюється
5. Для production: `npm run build`

## 🎯 Best Practices

- Зберігайте всі дані в JSON файлах
- Один JSON файл = одна лекція
- Використовуйте типізовані слайди для консистентності
- Тримайте слайди лаконічними (6-8 рядків максимум)
- Код - не більше 15-20 рядків на слайд
- Завжди тестуйте в `dev` режимі перед `build`

---

**© 2025 VTFK** | Зроблено з ❤️ та 💾
