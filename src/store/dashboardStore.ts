import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DashboardWidget, WidgetLayout, DashboardState, PluginManifest } from '../types'
import { loadPluginManifest, loadWidgetConfig, fetchWidgetData } from '../core'

// Расширенный тип плагина с baseUrl
export interface PluginWithBase extends PluginManifest {
  baseUrl: string
  manifestUrl: string
}

interface DashboardActions {
  // Плагины
  addPlugin: (manifestUrl: string) => Promise<void>
  removePlugin: (pluginId: string) => void
  updatePlugin: (pluginId: string) => Promise<void>

  // Виджеты
  addWidget: (pluginId: string, widgetId: string, layout: WidgetLayout) => Promise<void>
  removeWidget: (widgetId: string) => void
  updateWidgetSettings: (widgetId: string, settings: Record<string, unknown>) => void
  updateWidgetLayout: (layouts: WidgetLayout[]) => void
  refreshWidget: (widgetId: string) => Promise<void>
  selectWidget: (widgetId: string | null) => void

  // Состояние
  loadState: () => void
  exportState: () => string
  importState: (json: string) => Promise<void>
  toggleEditMode: () => void

  // Автообновление
  startAutoRefresh: () => void
  stopAutoRefresh: () => void
}

const initialState: DashboardState = {
  plugins: [],
  widgets: [],
  layouts: [],
  selectedWidgetId: null,
  isEditing: false,
}

// Хранилище для интервалов обновления
const refreshIntervals: Map<string, number> = new Map()

export const useDashboardStore = create<DashboardState & DashboardActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Плагины
      addPlugin: async (manifestUrl: string) => {
        const manifest = await loadPluginManifest(manifestUrl)

        // Проверка на дубликат
        const existing = get().plugins.find(p => p.id === manifest.id)
        if (existing) {
          throw new Error(`Plugin "${manifest.name}" is already installed`)
        }

        // Вычисляем базовый URL для загрузки конфигов
        const baseUrl = manifestUrl.substring(0, manifestUrl.lastIndexOf('/') + 1)

        // Добавляем плагин с baseUrl и manifestUrl
        set(state => ({
          plugins: [...state.plugins, { ...manifest, baseUrl, manifestUrl } as PluginWithBase],
        }))
      },

      removePlugin: (pluginId: string) => {
        // Останавливаем автообновление для всех виджетов плагина
        const widgets = get().widgets.filter(w => w.pluginId === pluginId)
        widgets.forEach(w => {
          if (refreshIntervals.has(w.id)) {
            const intervalId = refreshIntervals.get(w.id)
            if (intervalId) {
              window.clearInterval(intervalId)
            }
            refreshIntervals.delete(w.id)
          }
        })

        set(state => ({
          plugins: state.plugins.filter(p => p.id !== pluginId),
          widgets: state.widgets.filter(w => w.pluginId !== pluginId),
        }))
      },

      updatePlugin: async (pluginId: string) => {
        const state = get()
        const plugin = state.plugins.find(p => p.id === pluginId) as PluginWithBase | undefined
        if (!plugin) {
          throw new Error(`Plugin "${pluginId}" not found`)
        }

        // Загружаем свежий манифест
        const newManifest = await loadPluginManifest(plugin.manifestUrl)

        // Проверяем, есть ли обновления
        if (newManifest.version === plugin.version) {
          throw new Error('No updates available')
        }

        // Обновляем плагин с новыми виджетами
        set(state => ({
          plugins: state.plugins.map(p =>
            p.id === pluginId
              ? { ...newManifest, baseUrl: plugin.baseUrl, manifestUrl: plugin.manifestUrl } as PluginWithBase
              : p
          ),
        }))
      },

      // Виджеты
      addWidget: async (pluginId: string, widgetId: string, layout: WidgetLayout) => {
        const state = get()
        const plugin = state.plugins.find(p => p.id === pluginId) as PluginWithBase | undefined
        if (!plugin) {
          throw new Error(`Plugin "${pluginId}" not found`)
        }

        const widgetManifest = plugin.widgets.find(w => w.id === widgetId)
        if (!widgetManifest) {
          throw new Error(`Widget "${widgetId}" not found in plugin`)
        }

        // Загружаем конфиг виджета с baseUrl
        const config = await loadWidgetConfig(
          widgetManifest.configUrl,
          plugin.baseUrl
        )

        // Извлекаем настройки по умолчанию из settingsSchema
        const defaultSettings: Record<string, unknown> = {}
        if (config.settingsSchema?.properties) {
          const props = config.settingsSchema.properties as Record<string, { default?: unknown }>
          for (const [key, prop] of Object.entries(props)) {
            if (prop.default !== undefined) {
              defaultSettings[key] = prop.default
            }
          }
        }

        const newWidget: DashboardWidget = {
          id: `${pluginId}-${widgetId}-${Date.now()}`,
          pluginId,
          widgetId,
          config,
          settings: defaultSettings,
          data: null,
          lastUpdate: null,
          error: null,
          layout,
        }

        set(state => ({
          widgets: [...state.widgets, newWidget],
          layouts: [...state.layouts, layout],
        }))

        // Первичная загрузка данных с настройками по умолчанию
        try {
          const data = await fetchWidgetData(config, defaultSettings)
          set(state => ({
            widgets: state.widgets.map(w =>
              w.id === newWidget.id
                ? { ...w, data, lastUpdate: Date.now() }
                : w
            ),
          }))
        } catch (error) {
          set(state => ({
            widgets: state.widgets.map(w =>
              w.id === newWidget.id
                ? { ...w, error: error instanceof Error ? error.message : 'Failed to fetch data' }
                : w
            ),
          }))
        }
      },

      removeWidget: (widgetId: string) => {
        // Останавливаем автообновление для виджета
        if (refreshIntervals.has(widgetId)) {
          const intervalId = refreshIntervals.get(widgetId)
          if (intervalId) {
            window.clearInterval(intervalId)
          }
          refreshIntervals.delete(widgetId)
        }

        set(state => ({
          widgets: state.widgets.filter(w => w.id !== widgetId),
          layouts: state.layouts.filter(l => l.i !== widgetId),
          selectedWidgetId: state.selectedWidgetId === widgetId ? null : state.selectedWidgetId,
        }))
      },

      updateWidgetSettings: async (widgetId: string, settings: Record<string, unknown>) => {
        set(state => ({
          widgets: state.widgets.map(w =>
            w.id === widgetId ? { ...w, settings } : w
          ),
        }))

        // Обновление данных с новыми настройками
        await get().refreshWidget(widgetId)
      },

      updateWidgetLayout: (layouts: WidgetLayout[]) => {
        set({ layouts })
      },

      refreshWidget: async (widgetId: string) => {
        const widget = get().widgets.find(w => w.id === widgetId)
        if (!widget) return

        try {
          const data = await fetchWidgetData(widget.config, widget.settings)
          set(state => ({
            widgets: state.widgets.map(w =>
              w.id === widgetId
                ? { ...w, data, lastUpdate: Date.now(), error: null }
                : w
            ),
          }))
        } catch (error) {
          set(state => ({
            widgets: state.widgets.map(w =>
              w.id === widgetId
                ? { ...w, error: error instanceof Error ? error.message : 'Failed to fetch data' }
                : w
            ),
          }))
        }
      },

      selectWidget: (widgetId: string | null) => {
        set({ selectedWidgetId: widgetId })
      },

      // Состояние
      loadState: () => {
        // Состояние загружается автоматически через persist middleware
        // Здесь можно добавить дополнительную логику
      },

      exportState: () => {
        const state = get()
        return JSON.stringify({
          plugins: state.plugins,
          widgets: state.widgets.map(w => ({
            id: w.id,
            pluginId: w.pluginId,
            widgetId: w.widgetId,
            settings: w.settings,
            layout: w.layout,
          })),
          layouts: state.layouts,
        }, null, 2)
      },

      importState: async (json: string) => {
        try {
          const parsed = JSON.parse(json)
          set({
            plugins: parsed.plugins || [],
            widgets: parsed.widgets || [],
            layouts: parsed.layouts || [],
          })
        } catch {
          throw new Error('Invalid state JSON')
        }
      },

      toggleEditMode: () => {
        set(state => ({ isEditing: !state.isEditing }))
      },

      // Автообновление
      startAutoRefresh: () => {
        const { widgets, refreshWidget } = get()

        // Очищаем существующие интервалы
        refreshIntervals.forEach((intervalId) => {
          window.clearInterval(intervalId)
        })
        refreshIntervals.clear()

        // Создаём интервалы для виджетов с updateInterval > 0
        widgets.forEach((widget) => {
          const intervalSeconds = widget.config.updateInterval
          if (intervalSeconds && intervalSeconds > 0) {
            const intervalId = window.setInterval(() => {
              refreshWidget(widget.id)
            }, intervalSeconds * 1000)
            refreshIntervals.set(widget.id, intervalId)
          }
        })
      },

      stopAutoRefresh: () => {
        refreshIntervals.forEach((intervalId) => {
          window.clearInterval(intervalId)
        })
        refreshIntervals.clear()
      },
    }),
    {
      name: 'monitor-dashboard',
      partialize: (state) => ({
        plugins: state.plugins.map(p => ({
          ...p,
          manifestUrl: (p as PluginWithBase).manifestUrl,
        })),
        widgets: state.widgets.map(({ id, pluginId, widgetId, settings, layout }) => ({
          id,
          pluginId,
          widgetId,
          settings,
          layout,
        })),
        layouts: state.layouts,
      }),
      merge: (persistedState, currentState) => {
        const state = persistedState as Partial<DashboardState>
        // Восстанавливаем baseUrl для плагинов
        if (state.plugins) {
          state.plugins = state.plugins.map(p => {
            const plugin = p as PluginWithBase
            if (plugin.manifestUrl && !plugin.baseUrl) {
              plugin.baseUrl = plugin.manifestUrl.substring(0, plugin.manifestUrl.lastIndexOf('/') + 1)
            }
            return plugin
          })
        }
        return { ...currentState, ...state }
      },
    }
  )
)
