# Monitor Dashboard

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff.svg)](https://vitejs.dev/)

**Monitor** — это гибкая, настраиваемая и безопасная платформа для создания персональных дашбордов. Работает полностью на стороне клиента, размещается на GitHub Pages или любом статическом хостинге.

<!-- TODO: Добавить скриншот дашборда -->
<!-- ![Monitor Dashboard](docs/screenshot.png) -->

## 🌟 Особенности

- 🔒 **Безопасность**: Плагины содержат только JSON-конфигурации, без исполняемого кода
- 🧩 **Модульность**: Добавляйте новые источники данных через плагины
- 🎨 **Настраиваемость**: Drag & drop виджеты, изменяйте размеры, сохраняйте раскладку
- 📱 **Адаптивность**: Работает на десктопах, планшетах и мобильных устройствах
- 🚀 **Быстрый запуск**: Сборка за секунды, деплой на GitHub Pages
- 💾 **Сохранение состояния**: LocalStorage + экспорт/импорт JSON

## 📋 Содержание

- [Быстрый старт](#-быстрый-старт)
- [Установка](#-установка)
- [Использование](#-использование)
- [Архитектура](#-архитектура)
- [Создание плагинов](#-создание-плагинов)
- [Список плагинов](#-список-плагинов)
- [API виджетов](#-api-виджетов)
- [Безопасность](#-безопасность)
- [Развёртывание](#-развёртывание)
- [FAQ](#-faq)

---

## 🚀 Быстрый старт

### 1. Клонирование репозитория

```bash
git clone https://github.com/<your-username>/monitor.git
cd monitor
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Запуск разработки

```bash
npm run dev
```

Откройте [http://localhost:5173](http://localhost:5173) в браузере.

### 4. Сборка для продакшена

```bash
npm run build
```

### 5. Деплой на GitHub Pages

```bash
npm run deploy
```

---

## 📦 Установка

### Системные требования

- Node.js 18+ 
- npm 9+ или pnpm 8+

### Зависимости проекта

| Зависимость | Версия | Назначение |
|-------------|--------|------------|
| React | 19.0 | UI фреймворк |
| Zustand | 5.0 | Управление состоянием |
| react-grid-layout | 1.5 | Сетка виджетов |
| Ajv | 8.17 | JSON Schema валидация |
| DOMPurify | 3.2 | Санитизация HTML |
| JSONPath Plus | 10.3 | Трансформация данных |

---

## 📖 Использование

### Добавление плагина

1. Откройте дашборд в браузере
2. В боковой панели нажмите **"+ Plugin"**
3. Введите URL манифеста плагина (например, `https://raw.githubusercontent.com/.../plugins/crypto/manifest.json`)
4. Плагин появится в списке доступных

### Создание виджета

1. Найдите нужный виджет в боковой панели
2. Нажмите **"+"** рядом с названием
3. Виджет появится на доске
4. Включите режим **"✎ Edit"** и кликните на виджет для настройки параметров

### Режим редактирования

- Нажмите **"✎ Edit"** для включения режима перемещения
- Перетаскивайте виджеты мышью
- Изменяйте размер за правый нижний угол
- Нажмите **"✓ Done"** для сохранения

### Экспорт/Импорт настроек

- **Export**: Скачивает JSON-файл с конфигурацией дашборда
- **Import**: Загружает конфигурацию из JSON-файла

---

## 🏗️ Архитектура

### Структура проекта

```
Monitor/
├── src/
│   ├── components/          # React-компоненты
│   │   ├── Dashboard.tsx    # Сетка виджетов
│   │   ├── Dashboard.css
│   │   ├── Sidebar.tsx      # Панель плагинов
│   │   ├── Sidebar.css
│   │   ├── Widget.tsx       # Рендеринг виджета
│   │   ├── Widget.css
│   │   ├── WidgetSettings.tsx
│   │   ├── WidgetSettings.css
│   │   ├── PluginManager.tsx
│   │   └── PluginManager.css
│   ├── core/                # Ядро системы
│   │   ├── index.ts
│   │   ├── pluginLoader.ts  # Загрузка плагинов
│   │   ├── dataFetcher.ts   # Получение данных
│   │   └── templateEngine.ts # Шаблонизация
│   ├── store/               # Zustand хранилище
│   │   └── dashboardStore.ts
│   ├── types/               # TypeScript типы
│   │   └── index.ts
│   ├── schemas/             # JSON Schema
│   │   └── index.ts
│   ├── App.tsx              # Главный компонент
│   ├── main.tsx             # Точка входа
│   ├── index.css            # Глобальные стили
│   └── vite-env.d.ts        # Типы Vite
├── plugins/                 # Примеры плагинов
│   ├── crypto/
│   ├── weather/
│   ├── github/
│   └── ...
├── public/
│   └── _headers            # Security headers (для Netlify/GitHub Pages)
├── index.html              # CSP настройки
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

### Поток данных

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Плагин    │────▶│  Загрузчик   │────▶│  Валидация  │
│ (manifest)  │     │   плагинов   │     │  (JSON Schema)
└─────────────┘     └──────────────┘     └─────────────┘
                                              │
                                              ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Виджет    │◀────│   Рендеринг  │◀────│  Данные     │
│   (DOM)     │     │   (Template) │     │  (API)      │
└─────────────┘     └──────────────┘     └─────────────┘
```

### Компоненты ядра

| Компонент | Файл | Описание |
|-----------|------|----------|
| **PluginLoader** | `pluginLoader.ts` | Загрузка и валидация манифестов |
| **DataFetcher** | `dataFetcher.ts` | HTTP-запросы к API |
| **TemplateEngine** | `templateEngine.ts` | Шаблонизация + санитизация |
| **DashboardStore** | `dashboardStore.ts` | Глобальное состояние (Zustand) |

---

## 🔌 Создание плагинов

### Структура плагина

```
my-plugin/
├── manifest.json          # Манифест плагина
└── widgets/
    ├── widget-1/
    │   └── config.json    # Конфигурация
    └── widget-2/
        └── config.json
```

### manifest.json

```json
{
  "id": "unique-plugin-id",
  "name": "Название плагина",
  "version": "1.0.0",
  "description": "Описание",
  "author": "Ваше имя",
  "widgets": [
    {
      "id": "widget-id",
      "name": "Название виджета",
      "description": "Описание",
      "configUrl": "widgets/widget-id/config.json",
      "sizes": ["small", "medium", "large"]
    }
  ]
}
```

### config.json

```json
{
  "type": "text",
  "title": "Мой виджет",
  "updateInterval": 60,
  "settingsSchema": {
    "type": "object",
    "properties": {
      "apiKey": { "type": "string" },
      "city": { "type": "string", "default": "Moscow" }
    }
  },
  "dataSource": {
    "url": "https://api.example.com/data?city={{city}}",
    "method": "GET",
    "transform": {
      "type": "jsonpath",
      "expression": "$.result"
    }
  },
  "template": {
    "html": "<div>{{data}}</div>",
    "sanitize": true
  },
  "styles": {
    "backgroundColor": "#1e1e2e",
    "borderRadius": "12px"
  }
}
```

### Типы виджетов

| Тип | Описание | Пример использования |
|-----|----------|---------------------|
| `text` | Текстовый контент | Новости, статьи |
| `table` | Табличные данные | Курсы валют, рейтинги |
| `chart` | Графики | Статистика, тренды |
| `indicator` | Числовые индикаторы | Цены, проценты |

### Трансформация данных

#### JSONPath

```json
{
  "transform": {
    "type": "jsonpath",
    "expression": "$.data.items[*].price"
  }
}
```

#### Pick (выбор полей)

```json
{
  "transform": {
    "type": "pick",
    "fields": ["name", "value", "timestamp"]
  }
}
```

#### Format (строка)

```json
{
  "transform": {
    "type": "format",
    "format": "{{name}}: {{value}} units"
  }
}
```

### Переменные в шаблонах

- `{{variable}}` — подстановка значения
- `{{#each array}}...{{/each}}` — цикл
- `{{#if condition}}...{{/if}}` — условие

---

## 📚 Список плагинов

### Финансы

| Плагин | Виджеты | API |
|--------|---------|-----|
| **Crypto** | Bitcoin Price, Crypto Table | CoinGecko |
| **Stocks** | Stock Quote, Market Indices | Yahoo Finance |
| **Exchange Rates** | Currency Converter, Rates Table | ExchangeRate-API |
| **Finance** | Crypto Portfolio, Gas Prices, Gold Price | Разные |

### Разработка

| Плагин | Виджеты | API |
|--------|---------|-----|
| **GitHub** | Repo Stats, User Profile, Commits | GitHub API |
| **DevTools** | NPM Downloads, Package Version, XKCD, Stack Overflow | Разные |

### Новости

| Плагин | Виджеты | API |
|--------|---------|-----|
| **News** | Hacker News, Tech News | Firebase, RSS2JSON |
| **Social** | Reddit Posts, YouTube Stats, Product Hunt | Разные |

### Утилиты

| Плагин | Виджеты | API |
|--------|---------|-----|
| **Weather** | Current Weather | Open-Meteo |
| **Calendar** | Digital Clock, World Clock, Date | WorldTimeAPI |
| **IP Info** | My IP, IP Lookup | ipapi.co |
| **Status** | GitHub Status, Uptime Monitor | Разные |

### Здоровье

| Плагин | Виджеты | API |
|--------|---------|-----|
| **Health** | BMI Calculator, Water Tracker, Step Counter | LocalStorage |
| **Meditation** | Breathing Exercise, Timer, Quotes | LocalStorage |

### Развлечения

| Плагин | Виджеты | API |
|--------|---------|-----|
| **Entertainment** | Dad Jokes, Random Facts, Movie Info | Разные |
| **Gaming** | Steam Deals, Twitch, Gaming News, Speedruns | Разные |

### Образование

| Плагин | Виджеты | API |
|--------|---------|-----|
| **Education** | Word of Day, Trivia, Wiki Article | Разные |
| **Language** | Vocabulary, Phrases, Conjugation | Разные |

### Наука

| Плагин | Виджеты | API |
|--------|---------|-----|
| **Science** | APOD, ISS Location, Mars Weather, PubMed | NASA API |
| **Environment** | Air Quality, Sun Times | Open-Meteo |
| **Astronomy** | Meteor Showers, Planets, Constellations | Разные |

### Прочее

| Плагин | Виджеты |
|--------|---------|
| **Productivity** | Pomodoro, Habit Tracker, Quote of the Day |
| **Food** | Random Recipe, Meal Plan |
| **Sports** | Football Scores, F1 Standings |
| **Travel** | Flight Tracker, Airport Delays, Travel Quotes |
| **Smart Home** | Indoor Climate, Energy Monitor, Security Status |
| **Shopping** | Amazon Price, Daily Deals, Price Alert |
| **Real Estate** | Mortgage Rates, Rent Tracker |
| **Automotive** | EV Charging Stations |
| **Government** | Tax Brackets, US Holidays, Postal Rates |
| **Pets** | Pet Care Reminder, Dog Breeds, Pet Adoption |
| **Gardening** | Plant Care, Garden Weather, Plant Database, Moon Phases |
| **Photography** | Golden Hour, Photo Challenge, Exposure Calculator |
| **Career** | Job Listings, Salary Tracker, Interview Tips |
| **Aviation** | METAR Weather, Flight Status, Airspace Status |
| **DIY** | Project Ideas, Tool Guide, Measurement Converter |
| **Parenting** | Chore Chart, Baby Schedule, Family Calendar, Activity Ideas |
| **Charity** | Charity Ratings, Donation Tracker, Volunteer Opportunities |
| **Senior Care** | Medication Reminder, Health Metrics, Memory Games |
| **Weather Pro** | Radar Map, UV Index, Pollen Count, Storm Tracker |
| **Maritime** | Marine Weather, Tide Chart, Vessel Tracker |
| **Agriculture** | Crop Prices, Soil Conditions, Planting Calendar |
| **Legal** | Court Dates, Law Updates, Compliance Tracker |
| **Insurance** | Policy Tracker, Claims Status, Premium Reminder |
| **HR** | Applicant Tracker, Employee Birthdays, PTO Tracker |
| **Art & Culture** | Museum Exhibits, Art Piece of the Day, Cultural Events |
| **Crypto News** | Crypto Headlines, Whale Alerts, ICO Calendar |
| **Sustainability** | Carbon Footprint, Recycling Guide, Eco Tips |
| **Betting** | Today's Odds, Bet Tracker |
| **Music** | Spotify Top 50, iTunes Chart, Song Lyrics |
| **Events** | Countdown, Birthday Tracker, Event Calendar |
| **Emergency** | Emergency Contacts, Weather Alerts, First Aid Guide |
| **Language Learning** | Word of the Day, Phrase Book, Verb Conjugation |

---

## 🔧 API виджетов

### Методы Store

```typescript
// Плагины
addPlugin(manifestUrl: string): Promise<void>
removePlugin(pluginId: string): void

// Виджеты
addWidget(pluginId: string, widgetId: string, layout: WidgetLayout): Promise<void>
removeWidget(widgetId: string): void
updateWidgetSettings(widgetId: string, settings: Record<string, unknown>): void
refreshWidget(widgetId: string): Promise<void>
selectWidget(widgetId: string | null): void

// Режим редактирования
toggleEditMode(): void

// Состояние
loadState(): void
exportState(): string
importState(json: string): Promise<void>
```

### Типы данных

```typescript
interface DashboardWidget {
  id: string
  pluginId: string
  widgetId: string
  config: WidgetConfig
  settings: Record<string, unknown>
  data: unknown | null
  lastUpdate: number | null
  error: string | null
  layout: WidgetLayout
}

interface WidgetLayout {
  i: string
  x: number
  y: number
  w: number
  h: number
}
```

---

## 🔒 Безопасность

### Реализованные меры

| Мера | Описание |
|------|----------|
| **Content Security Policy** | Запрет inline-скриптов, только HTTPS |
| **JSON Schema валидация** | Строгая проверка всех конфигов |
| **DOMPurify** | Санитизация всего HTML-вывода |
| **HTTPS-only** | Блокировка HTTP-запросов |
| **Нет исполняемого кода** | Плагины — только JSON |

### CSP заголовки

```
default-src 'self'
script-src 'self'
style-src 'self' 'unsafe-inline'
img-src 'self' data: https:
connect-src 'self' https:
frame-src 'none'
object-src 'none'
```

### Рекомендации

1. Используйте только HTTPS API
2. Не храните API-ключи в плагинах
3. Проверяйте источники плагинов
4. Регулярно обновляйте зависимости

---

## 🚀 Развёртывание

### GitHub Pages

```bash
# Деплой (требует доступа к репозиторию)
npm run deploy

# Или вручную через gh-pages
npx gh-pages -d dist
```

**Примечание:** Для использования GitHub Pages убедитесь, что в настройках репозитория (Settings → Pages) выбран источник `gh-pages` branch.

### Vercel

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm run build
# Перетащите папку dist в Netlify Drop
```

### Docker

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

---

## ❓ FAQ

### Как добавить свой API?

Создайте плагин с `dataSource.url`, указывающим на ваш API. Используйте `settingsSchema` для параметров (API-ключи, настройки).

### Почему виджет не загружает данные?

1. Проверьте CORS настройки API
2. Убедитесь, что URL использует HTTPS
3. Проверьте консоль браузера на ошибки

### Как сохранить раскладку?

Раскладка сохраняется автоматически в LocalStorage при каждом изменении.

### Можно ли использовать плагины с других доменов?

Да, если домен поддерживает CORS и использует HTTPS.

### Как обновить плагин?

Удалите старый плагин и добавьте заново по URL манифеста.

---

## 🤝 Вклад в проект

### Разработка

```bash
git clone https://github.com/<your-username>/monitor.git
cd monitor
npm install
npm run dev
```

### Создание плагина

1. Создайте папку в `plugins/` с именем вашего плагина
2. Добавьте `manifest.json` и конфиги виджетов
3. Протестируйте локально
4. Разместите плагин на GitHub Pages или любом HTTPS-хостинге
5. Поделитесь URL манифеста с сообществом

### Баг-репорты

Создавайте issue с:
- Описанием проблемы
- Шагами воспроизведения
- Ожидаемым результатом
- Скриншотами (если применимо)
- Версией браузера и ОС

---

## 📄 Лицензия

MIT License — см. [LICENSE](LICENSE) файл.

---

## 🔗 Ссылки

- [Документация по плагинам](PLUGIN_GUIDE.md)
- [GitHub Issues](../../issues)

---

## 🙏 Благодарности

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [react-grid-layout](https://github.com/react-grid-layout/react-grid-layout)
- [DOMPurify](https://github.com/cure53/DOMPurify)
- [Ajv](https://ajv.js.org/)

---

<div align="center">

**Monitor** — ваш персональный дашборд для всего

⭐ Если вам нравится проект, поставьте звезду!

</div>
