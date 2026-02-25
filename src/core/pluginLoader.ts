import { PluginManifest, WidgetConfig } from '../types'
import { pluginManifestSchema, widgetConfigSchema } from '../schemas'

// Простая валидация JSON Schema без Ajv (для CSP совместимости)
// Ajv генерирует код через new Function, что нарушает CSP

interface SchemaValidationResult {
  valid: boolean
  errors?: Array<{ message: string }>
}

interface SchemaType {
  type?: string
  required?: string[]
  properties?: Record<string, unknown>
  items?: unknown
  enum?: unknown[]
  pattern?: string
}

function validateSchema(data: unknown, schema: SchemaType): SchemaValidationResult {
  // Базовая валидация типов
  if (schema.type === 'object' && typeof data !== 'object') {
    return { valid: false, errors: [{ message: 'must be object' }] }
  }
  if (schema.type === 'array' && !Array.isArray(data)) {
    return { valid: false, errors: [{ message: 'must be array' }] }
  }
  if (schema.type === 'string' && typeof data !== 'string') {
    return { valid: false, errors: [{ message: 'must be string' }] }
  }
  if (schema.type === 'number' && typeof data !== 'number') {
    return { valid: false, errors: [{ message: 'must be number' }] }
  }
  if (schema.type === 'boolean' && typeof data !== 'boolean') {
    return { valid: false, errors: [{ message: 'must be boolean' }] }
  }

  // Проверка required
  if (schema.required && Array.isArray(schema.required)) {
    for (const prop of schema.required) {
      if (!(prop in (data as Record<string, unknown>))) {
        return { valid: false, errors: [{ message: `missing required: ${prop}` }] }
      }
    }
  }

  // Проверка enum
  if (schema.enum && !schema.enum.includes(data as string)) {
    return { valid: false, errors: [{ message: 'must be one of enum values' }] }
  }

  // Проверка pattern
  if (schema.pattern && typeof data === 'string') {
    const regex = new RegExp(schema.pattern)
    if (!regex.test(data)) {
      return { valid: false, errors: [{ message: `must match pattern: ${schema.pattern}` }] }
    }
  }

  // Рекурсивная проверка свойств объекта
  if (schema.type === 'object' && schema.properties) {
    for (const [key, propSchema] of Object.entries(schema.properties)) {
      if (key in (data as Record<string, unknown>)) {
        const result = validateSchema((data as Record<string, unknown>)[key], propSchema as SchemaType)
        if (!result.valid) return result
      }
    }
  }

  // Проверка элементов массива
  if (schema.type === 'array' && schema.items) {
    for (const item of data as unknown[]) {
      const result = validateSchema(item, schema.items as SchemaType)
      if (!result.valid) return result
    }
  }

  return { valid: true }
}

export function validateManifest(manifest: PluginManifest): SchemaValidationResult {
  return validateSchema(manifest, pluginManifestSchema as SchemaType)
}

export function validateConfig(config: WidgetConfig): SchemaValidationResult {
  return validateSchema(config, widgetConfigSchema as SchemaType)
}

export class PluginError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PluginError'
  }
}

export async function loadPluginManifest(url: string): Promise<PluginManifest> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new PluginError(`Failed to fetch manifest: ${response.statusText}`)
    }
    const manifest = await response.json()

    const validation = validateManifest(manifest)
    if (!validation.valid) {
      throw new PluginError(`Invalid manifest: ${JSON.stringify(validation.errors)}`)
    }
    
    // Проверка URL на HTTPS
    const configBaseUrl = url.substring(0, url.lastIndexOf('/') + 1)
    for (const widget of manifest.widgets) {
      const configUrl = widget.configUrl.startsWith('http') 
        ? widget.configUrl 
        : configBaseUrl + widget.configUrl
      if (!configUrl.startsWith('https://')) {
        console.warn(`Widget "${widget.id}" uses non-HTTPS config URL`)
      }
    }
    
    return manifest
  } catch (error) {
    if (error instanceof PluginError) {
      throw error
    }
    throw new PluginError(`Failed to load manifest: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function loadWidgetConfig(configUrl: string, baseUrl: string): Promise<WidgetConfig> {
  try {
    const fullUrl = configUrl.startsWith('http') ? configUrl : baseUrl + configUrl
    
    const response = await fetch(fullUrl)
    if (!response.ok) {
      throw new PluginError(`Failed to fetch config: ${response.statusText}`)
    }
    const config = await response.json()

    const validation = validateConfig(config)
    if (!validation.valid) {
      throw new PluginError(`Invalid config: ${JSON.stringify(validation.errors)}`)
    }
    
    return config
  } catch (error) {
    if (error instanceof PluginError) {
      throw error
    }
    throw new PluginError(`Failed to load config: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:'
  } catch {
    return false
  }
}
