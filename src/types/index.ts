// Типы виджетов
export type WidgetType = 'text' | 'table' | 'chart' | 'indicator'

export type WidgetSize = 'small' | 'medium' | 'large'

// Манифест плагина
export interface PluginManifest {
  id: string
  name: string
  version: string
  description: string
  author?: string
  widgets: WidgetManifest[]
}

export interface WidgetManifest {
  id: string
  name: string
  description: string
  icon?: string
  configUrl: string
  sizes?: WidgetSize[]
}

// Конфигурация виджета
export interface WidgetConfig {
  type: WidgetType
  title: string
  updateInterval: number // секунды, 0 — без автообновления
  settingsSchema?: Record<string, unknown>
  dataSource?: DataSourceConfig
  template?: TemplateConfig
  styles?: Record<string, string>
}

export interface DataSourceConfig {
  url: string
  method?: 'GET' | 'POST'
  headers?: Record<string, string>
  transform?: TransformConfig
}

export interface TransformConfig {
  type: 'jsonpath' | 'pick' | 'format'
  expression?: string
  fields?: string[]
  format?: string
}

export interface TemplateConfig {
  html: string
  sanitize?: boolean
}

// Виджет на доске
export interface DashboardWidget {
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

export interface WidgetLayout {
  i: string
  x: number
  y: number
  w: number
  h: number
  minW?: number
  minH?: number
}

// Состояние дашборда
export interface DashboardState {
  plugins: PluginManifest[]
  widgets: DashboardWidget[]
  layouts: WidgetLayout[]
  selectedWidgetId: string | null
  isEditing: boolean
}
