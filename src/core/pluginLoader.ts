import Ajv from 'ajv'
import { PluginManifest, WidgetConfig } from '../types'
import { pluginManifestSchema, widgetConfigSchema } from '../schemas'

const ajv = new Ajv()

const validateManifest = ajv.compile<PluginManifest>(pluginManifestSchema)
const validateConfig = ajv.compile<WidgetConfig>(widgetConfigSchema)

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
    
    const valid = validateManifest(manifest)
    if (!valid) {
      throw new PluginError(`Invalid manifest: ${JSON.stringify(validateManifest.errors)}`)
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
    
    const valid = validateConfig(config)
    if (!valid) {
      throw new PluginError(`Invalid config: ${JSON.stringify(validateConfig.errors)}`)
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
