# Руководство по созданию плагинов для Monitor

## Структура плагина

```
my-plugin/
├── manifest.json          # Манифест плагина
└── widgets/
    ├── widget-1/
    │   └── config.json    # Конфигурация виджета
    └── widget-2/
        └── config.json
```

## Манифест плагина (`manifest.json`)

```json
{
  "id": "unique-plugin-id",
  "name": "Название плагина",
  "version": "1.0.0",
  "description": "Описание плагина",
  "author": "Ваше имя",
  "widgets": [
    {
      "id": "widget-id",
      "name": "Название виджета",
      "description": "Описание виджета",
      "icon": "path/to/icon.svg",
      "configUrl": "widgets/widget-id/config.json",
      "sizes": ["small", "medium", "large"]
    }
  ]
}
```

### Поля манифеста

| Поле | Тип | Обязательное | Описание |
|------|-----|--------------|----------|
| `id` | string | ✅ | Уникальный идентификатор (только латиница, цифры, `-`, `_`) |
| `name` | string | ✅ | Название плагина |
| `version` | string | ✅ | Версия в формате semver (например, `1.0.0`) |
| `description` | string | ✅ | Краткое описание |
| `author` | string | ❌ | Автор плагина |
| `widgets` | array | ✅ | Список виджетов |

## Конфигурация виджета (`config.json`)

```json
{
  "type": "text",
  "title": "Мой виджет",
  "updateInterval": 60,
  "settingsSchema": { ... },
  "dataSource": { ... },
  "template": { ... },
  "styles": { ... }
}
```

### Поля конфигурации

| Поле | Тип | Обязательное | Описание |
|------|-----|--------------|----------|
| `type` | string | ✅ | Тип виджета: `text`, `table`, `chart`, `indicator` |
| `title` | string | ✅ | Заголовок виджета |
| `updateInterval` | number | ✅ | Интервал обновления в секундах (0 = без автообновления) |
| `settingsSchema` | object | ❌ | JSON Schema для настроек пользователя |
| `dataSource` | object | ❌ | Конфигурация источника данных |
| `template` | object | ❌ | Шаблон отображения данных |
| `styles` | object | ❌ | CSS-стили для виджета |

## Настройки пользователя (`settingsSchema`)

Используйте JSON Schema для определения настроек:

```json
{
  "settingsSchema": {
    "type": "object",
    "properties": {
      "apiKey": {
        "type": "string",
        "description": "Ваш API ключ"
      },
      "city": {
        "type": "string",
        "default": "Moscow"
      },
      "currency": {
        "type": "string",
        "enum": ["usd", "eur", "rub"],
        "default": "usd"
      },
      "refreshRate": {
        "type": "number",
        "minimum": 30,
        "default": 60
      }
    }
  }
}
```

## Источник данных (`dataSource`)

### Базовая конфигурация

```json
{
  "dataSource": {
    "url": "https://api.example.com/data?city={{city}}",
    "method": "GET",
    "headers": {
      "Authorization": "Bearer {{apiKey}}"
    },
    "transform": {
      "type": "jsonpath",
      "expression": "$.data.result"
    }
  }
}
```

### Типы трансформации

#### 1. JSONPath

```json
{
  "transform": {
    "type": "jsonpath",
    "expression": "$.main.temp"
  }
}
```

#### 2. Pick (выбор полей)

```json
{
  "transform": {
    "type": "pick",
    "fields": ["name", "value", "timestamp"]
  }
}
```

#### 3. Format (форматирование строки)

```json
{
  "transform": {
    "type": "format",
    "format": "{{name}}: {{value}} units"
  }
}
```

## Шаблон отображения (`template`)

```json
{
  "template": {
    "html": "<div class='value'>{{value}}</div><div class='label'>{{label}}</div>",
    "sanitize": true
  }
}
```

### Переменные в шаблоне

- Переменные из `settings` (настройки пользователя)
- Переменные из данных API (после трансформации)

### Примеры шаблонов

#### Простой текст

```html
<div>Temperature: {{temperature}}°C</div>
```

#### Таблица

```html
<table>
  <thead>
    <tr><th>Name</th><th>Price</th></tr>
  </thead>
  <tbody>
    {{#each data}}
    <tr><td>{{name}}</td><td>{{price}}</td></tr>
    {{/each}}
  </tbody>
</table>
```

#### Индикатор

```html
<div style="font-size: 2em; color: {{#if gt value 0}}green{{else}}red{{/if}}">
  {{value}}%
</div>
```

## Стили виджета (`styles`)

Любые CSS-свойства:

```json
{
  "styles": {
    "backgroundColor": "#1e1e2e",
    "borderRadius": "12px",
    "padding": "16px",
    "color": "#ffffff"
  }
}
```

## Публикация плагина

### Вариант 1: GitHub Pages

1. Создайте репозиторий на GitHub
2. Разместите файлы плагина
3. Включите GitHub Pages в настройках репозитория
4. URL манифеста: `https://<user>.github.io/<repo>/manifest.json`

### Вариант 2: Raw GitHub

Используйте raw-версию файла:
```
https://raw.githubusercontent.com/<user>/<repo>/main/manifest.json
```

### Вариант 3: Любой статический хостинг

Разместите файлы на любом HTTPS-хостинге с поддержкой CORS.

## Требования безопасности

1. **Только HTTPS**: Все URL должны использовать HTTPS
2. **Без JavaScript**: Плагины содержат только JSON
3. **Валидация схем**: Все конфиги проверяются по JSON Schema
4. **Санитизация**: HTML-шаблоны проходят через DOMPurify
5. **CORS**: API должны поддерживать CORS-запросы

## Примеры

### Пример 1: Погода

```json
{
  "type": "text",
  "title": "Погода в {{city}}",
  "updateInterval": 1800,
  "settingsSchema": {
    "type": "object",
    "properties": {
      "city": { "type": "string", "default": "Moscow" },
      "lat": { "type": "number", "default": 55.7558 },
      "lon": { "type": "number", "default": 37.6173 }
    }
  },
  "dataSource": {
    "url": "https://api.open-meteo.com/v1/forecast?latitude={{lat}}&longitude={{lon}}&current_weather=true",
    "transform": {
      "type": "jsonpath",
      "expression": "$.current_weather"
    }
  },
  "template": {
    "html": "<div>{{temperature}}°C, {{windspeed}} km/h</div>"
  }
}
```

### Пример 2: Курс валют

```json
{
  "type": "indicator",
  "title": "USD/RUB",
  "updateInterval": 300,
  "dataSource": {
    "url": "https://api.exchangerate-api.com/v4/latest/USD",
    "transform": {
      "type": "jsonpath",
      "expression": "$.rates.RUB"
    }
  },
  "template": {
    "html": "<div style='font-size: 2.5em; font-weight: bold;'>{{this}} ₽</div>"
  }
}
```

## Отладка

1. Откройте консоль браузера (F12)
2. Проверьте ошибки загрузки манифеста/конфига
3. Проверьте CORS-ошибки при запросах к API
4. Используйте валидатор JSON для проверки синтаксиса

## Поддержка

- Документация: [ссылка]
- Issues: [ссылка на GitHub Issues]
