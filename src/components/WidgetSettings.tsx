import { useState } from 'react'
import { DashboardWidget } from '../types'
import { useDashboardStore } from '../store/dashboardStore'
import './WidgetSettings.css'

interface WidgetSettingsProps {
  widget: DashboardWidget
  onClose: () => void
}

export default function WidgetSettings({ widget, onClose }: WidgetSettingsProps) {
  const { updateWidgetSettings, removeWidget, refreshWidget } = useDashboardStore()
  const [settings, setSettings] = useState<Record<string, unknown>>(widget.settings)
  const [isSaving, setIsSaving] = useState(false)

  const settingsSchema = widget.config.settingsSchema

  const handleChange = (key: string, value: unknown) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateWidgetSettings(widget.id, settings)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save settings')
    } finally {
      setIsSaving(false)
      onClose()
    }
  }

  const handleRefresh = async () => {
    await refreshWidget(widget.id)
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this widget?')) {
      removeWidget(widget.id)
      onClose()
    }
  }

  // Генерация полей формы из settingsSchema
  const renderSettingsFields = () => {
    if (!settingsSchema?.properties) {
      return <p className="no-settings">No settings available</p>
    }

    const properties = settingsSchema.properties as Record<string, Record<string, unknown>>

    return Object.entries(properties).map(([key, prop]) => {
      const value = settings[key] ?? prop.default ?? ''
      const type = prop.type as string

      if (prop.enum) {
        return (
          <div key={key} className="form-group">
            <label htmlFor={key}>{key}</label>
            <select
              id={key}
              value={String(value)}
              onChange={(e) => handleChange(key, e.target.value)}
            >
              {(prop.enum as string[]).map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        )
      }

      if (type === 'boolean') {
        return (
          <div key={key} className="form-group">
            <label>
              <input
                type="checkbox"
                checked={Boolean(value)}
                onChange={(e) => handleChange(key, e.target.checked)}
              />
              {key}
            </label>
          </div>
        )
      }

      if (type === 'number') {
        return (
          <div key={key} className="form-group">
            <label htmlFor={key}>{key}</label>
            <input
              id={key}
              type="number"
              value={String(value)}
              onChange={(e) => handleChange(key, Number(e.target.value))}
            />
          </div>
        )
      }

      // По умолчанию text input
      return (
        <div key={key} className="form-group">
          <label htmlFor={key}>{key}</label>
          <input
            id={key}
            type="text"
            value={String(value)}
            onChange={(e) => handleChange(key, e.target.value)}
          />
        </div>
      )
    })
  }

  return (
    <div className="widget-settings-overlay" onClick={onClose}>
      <div className="widget-settings" onClick={(e) => e.stopPropagation()}>
        <div className="widget-settings-header">
          <h2>{widget.config.title}</h2>
          <button onClick={onClose} className="btn-close">×</button>
        </div>

        <div className="widget-settings-content">
          <h3>Settings</h3>
          {renderSettingsFields()}
        </div>

        <div className="widget-settings-footer">
          <button onClick={handleRefresh} className="btn-secondary">
            Refresh
          </button>
          <button onClick={handleDelete} className="btn-danger">
            Delete
          </button>
          <button 
            onClick={handleSave} 
            className="btn-primary"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
