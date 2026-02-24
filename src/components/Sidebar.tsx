import { useDashboardStore } from '../store/dashboardStore'
import './Sidebar.css'

export default function Sidebar() {
  const { plugins, addPlugin, removePlugin, addWidget, isEditing } = useDashboardStore()
  
  const handleAddPlugin = async () => {
    const url = prompt('Enter plugin manifest URL:')
    if (!url) return
    
    try {
      await addPlugin(url)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to add plugin')
    }
  }

  const handleAddWidget = async (pluginId: string, widgetId: string) => {
    const layout = {
      i: `${pluginId}-${widgetId}-${Date.now()}`,
      x: 0,
      y: 0,
      w: 4,
      h: 4,
      minW: 2,
      minH: 2,
    }
    
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
                {isEditing && (
                  <button 
                    onClick={() => removePlugin(plugin.id)}
                    className="btn-danger btn-small"
                  >
                    ×
                  </button>
                )}
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
