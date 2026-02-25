import { WidgetConfig } from '../types'
import { transformData, isSafeUrl } from './templateEngine'

export class DataFetchError extends Error {
  constructor(message: string, public isCorsError?: boolean) {
    super(message)
    this.name = 'DataFetchError'
  }
}

export async function fetchWidgetData(
  config: WidgetConfig,
  settings: Record<string, unknown>
): Promise<unknown> {
  if (!config.dataSource) {
    return null
  }

  const { dataSource } = config

  // Интерполяция URL с подстановкой параметров
  const url = interpolate(dataSource.url, settings)

  // Проверка безопасности URL
  if (!isSafeUrl(url)) {
    throw new DataFetchError('Only HTTPS URLs are allowed')
  }

  try {
    const response = await fetch(url, {
      method: dataSource.method || 'GET',
      headers: dataSource.headers || {},
    })

    if (!response.ok) {
      throw new DataFetchError(`HTTP ${response.status}: ${response.statusText}`)
    }

    let data: unknown = await response.json()

    // Трансформация данных
    if (dataSource.transform) {
      data = transformData(data, dataSource.transform)
    }

    return data
  } catch (error) {
    if (error instanceof DataFetchError) {
      throw error
    }
    // Проверка на CORS ошибку
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new DataFetchError(
        `CORS error: Cannot access "${url}". The API server must support CORS headers.`,
        true
      )
    }
    throw new DataFetchError(`Fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Интерполяция переменных {{var}} в строке
 */
function interpolate(template: string, variables: Record<string, unknown>): string {
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
