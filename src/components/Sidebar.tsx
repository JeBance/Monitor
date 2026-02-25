import { useRef, useState } from 'react'
import { useDashboardStore } from '../store/dashboardStore'
import './Sidebar.css'

export default function Sidebar() {
  const { plugins, addPlugin, removePlugin, updatePlugin, addWidget, isEditing } = useDashboardStore()
  const [updatingPlugins, setUpdatingPlugins] = useState<Set<string>>(new Set())

  // Счётчик для автоматического размещения виджетов
  const widgetCounter = useRef(0)

  const handleAddPlugin = async () => {
    const url = prompt('Enter plugin manifest URL:')
    if (!url) return

    try {
      await addPlugin(url)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to add plugin')
    }
  }

  const handleUpdatePlugin = async (pluginId: string) => {
    setUpdatingPlugins(prev => new Set(prev).add(pluginId))
    try {
      await updatePlugin(pluginId)
      alert('Plugin updated successfully!')
    } catch (error) {
      if (error instanceof Error && error.message.includes('no updates')) {
        alert('Plugin is up to date')
      } else {
        alert(error instanceof Error ? error.message : 'Failed to update plugin')
      }
    } finally {
      setUpdatingPlugins(prev => {
        const next = new Set(prev)
        next.delete(pluginId)
        return next
      })
    }
  }

  const handleAddWidget = async (pluginId: string, widgetId: string) => {
    // Вычисляем позицию для нового виджета (шахматный порядок)
    const col = widgetCounter.current % 6
    const row = Math.floor(widgetCounter.current / 6)

    const layout = {
      i: `${pluginId}-${widgetId}-${Date.now()}`,
      x: col * 2,
      y: row * 4,
      w: 4,
      h: 4,
      minW: 2,
      minH: 2,
    }
    widgetCounter.current++

    try {
      await addWidget(pluginId, widgetId, layout)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to add widget')
    }
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Monitor</h2>
        <button onClick={handleAddPlugin} className="btn-primary">
          + Plugin
        </button>
      </div>

      <div className="sidebar-content">
        {plugins.length === 0 ? (
          <p className="empty-message">No plugins installed</p>
        ) : (
          plugins.map(plugin => (
            <div key={plugin.id} className="plugin-section">
              <div className="plugin-header">
                <div>
                  <h3>{plugin.name}</h3>
                  <span className="plugin-version">v{plugin.version}</span>
                </div>
                <div className="plugin-actions">
                  {isEditing && (
                    <>
                      <button
                        onClick={() => handleUpdatePlugin(plugin.id)}
                        className="btn-secondary btn-small"
                        disabled={updatingPlugins.has(plugin.id)}
                        title="Check for updates"
                      >
                        {updatingPlugins.has(plugin.id) ? '↻' : '⟳'}
                      </button>
                      <button
                        onClick={() => removePlugin(plugin.id)}
                        className="btn-danger btn-small"
                      >
                        ×
                      </button>
                    </>
                  )}
                </div>
              </div>
              <p className="plugin-description">{plugin.description}</p>

              <div className="widgets-list">
                {plugin.widgets.map(widget => (
                  <div key={widget.id} className="widget-item">
                    <div className="widget-info">
                      {widget.icon && (
                        <img src={widget.icon} alt="" className="widget-icon" />
                      )}
                      <span>{widget.name}</span>
                    </div>
                    <button
                      onClick={() => handleAddWidget(plugin.id, widget.id)}
                      className="btn-secondary btn-small"
                    >
                      +
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  )
}
