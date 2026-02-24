import DOMPurify from 'dompurify'
import { JSONPath } from 'jsonpath-plus'
import { WidgetConfig, TransformConfig } from '../types'

/**
 * Интерполяция переменных {{var}} в строке
 */
export function interpolate(template: string, variables: Record<string, unknown>): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
    const keys = key.trim().split('.')
    let value: unknown = variables
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k]
      } else {
        return ''
      }
    }
    return value != null ? String(value) : ''
  })
}

/**
 * Трансформация данных согласно конфигурации
 */
export function transformData(data: unknown, transform?: TransformConfig): unknown {
  if (!transform) {
    return data
  }

  switch (transform.type) {
    case 'jsonpath': {
      if (!transform.expression) {
        return data
      }
      const result = JSONPath({ path: transform.expression, json: data as Record<string, unknown> })
      return Array.isArray(result) && result.length === 1 ? result[0] : result
    }
    case 'pick': {
      if (!transform.fields || typeof data !== 'object' || data === null) {
        return data
      }
      const picked: Record<string, unknown> = {}
      for (const field of transform.fields) {
        if (field in (data as Record<string, unknown>)) {
          picked[field] = (data as Record<string, unknown>)[field]
        }
      }
      return picked
    }
    case 'format': {
      if (!transform.format || typeof data !== 'object' || data === null) {
        return data
      }
      return interpolate(transform.format, data as Record<string, unknown>)
    }
    default:
      return data
  }
}

/**
 * Рендеринг шаблона с санитизацией
 */
export function renderTemplate(config: WidgetConfig, data: unknown, settings: Record<string, unknown>): string {
  if (!config.template) {
    // Рендеринг по типу виджета
    return renderByType(config.type, data)
  }

  const context = { ...settings, ...(data as Record<string, unknown>) }
  const html = interpolate(config.template.html, context)
  
  if (config.template.sanitize !== false) {
    return DOMPurify.sanitize(html)
  }
  
  return html
}

/**
 * Рендеринг по типу виджета (базовая реализация)
 */
function renderByType(type: string, data: unknown): string {
  if (data == null) {
    return '<div>No data</div>'
  }

  switch (type) {
    case 'text':
      return `<div>${String(data)}</div>`
    case 'indicator':
      return `<div style="font-size: 2em; font-weight: bold;">${String(data)}</div>`
    case 'table':
      if (Array.isArray(data) && data.length > 0) {
        const headers = Object.keys(data[0])
        const rows = data.map((row: Record<string, unknown>) => 
          `<tr>${headers.map(h => `<td>${row[h]}</td>`).join('')}</tr>`
        ).join('')
        return `<table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table>`
      }
      return '<div>No data</div>'
    case 'chart':
      return '<div>Chart rendering not implemented</div>'
    default:
      return `<div>${String(data)}</div>`
  }
}

/**
 * Проверка URL на безопасность
 */
export function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:'
  } catch {
    return false
  }
}
