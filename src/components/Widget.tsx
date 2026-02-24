import { renderTemplate } from '../core'
import { DashboardWidget } from '../types'
import './Widget.css'

interface WidgetProps {
  widget: DashboardWidget
}

export default function Widget({ widget }: WidgetProps) {
  const { config, data, error, settings } = widget

  if (error) {
    return (
      <div className="widget widget-error" style={config.styles}>
        <div className="widget-header">
          <h3>{config.title}</h3>
        </div>
        <div className="widget-content">
          <p className="error-message">⚠ {error}</p>
        </div>
      </div>
    )
  }

  const content = renderTemplate(config, data, settings)

  return (
    <div className="widget" style={config.styles}>
      <div className="widget-header">
        <h3>{config.title}</h3>
        {widget.lastUpdate && (
          <span className="widget-last-update">
            {new Date(widget.lastUpdate).toLocaleTimeString()}
          </span>
        )}
      </div>
      <div 
        className="widget-content"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  )
}
