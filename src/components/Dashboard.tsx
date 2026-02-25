import { useCallback, useEffect, useRef } from 'react'
import ReactGridLayout from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { useDashboardStore } from '../store/dashboardStore'
import Widget from './Widget'
import WidgetSettings from './WidgetSettings'
import './Dashboard.css'

export default function Dashboard() {
  const { widgets, layouts, updateWidgetLayout, selectWidget, selectedWidgetId, isEditing, startAutoRefresh, stopAutoRefresh } = useDashboardStore()
  const startAutoRefreshRef = useRef(startAutoRefresh)
  const stopAutoRefreshRef = useRef(stopAutoRefresh)

  // Обновляем рефы при изменении функций
  useEffect(() => {
    startAutoRefreshRef.current = startAutoRefresh
    stopAutoRefreshRef.current = stopAutoRefresh
  }, [startAutoRefresh, stopAutoRefresh])

  const handleLayoutChange = useCallback((newLayout: ReactGridLayout.Layout[]) => {
    updateWidgetLayout(newLayout.map(l => ({
      i: l.i,
      x: l.x,
      y: l.y,
      w: l.w,
      h: l.h,
      minW: l.minW,
      minH: l.minH,
    })))
  }, [updateWidgetLayout])

  const handleWidgetClick = useCallback((widgetId: string) => {
    if (isEditing) {
      selectWidget(widgetId)
    }
  }, [isEditing, selectWidget])

  const handleCloseSettings = useCallback(() => {
    selectWidget(null)
  }, [selectWidget])

  // Запуск автообновления при изменении виджетов
  useEffect(() => {
    if (widgets.length > 0) {
      startAutoRefreshRef.current()
    }
    return () => {
      stopAutoRefreshRef.current()
    }
  }, [widgets.length])

  // Остановка автообновления в режиме редактирования
  useEffect(() => {
    if (isEditing) {
      stopAutoRefreshRef.current()
    } else if (widgets.length > 0) {
      startAutoRefreshRef.current()
    }
  }, [isEditing, widgets.length])

  // Очистка интервалов при размонтировании
  useEffect(() => {
    return () => {
      stopAutoRefreshRef.current()
    }
  }, [])

  if (widgets.length === 0) {
    return (
      <div className="dashboard-empty">
        <p>No widgets yet. Add a plugin from the sidebar and create a widget.</p>
      </div>
    )
  }

  const selectedWidget = widgets.find(w => w.id === selectedWidgetId)

  return (
    <div className="dashboard">
      <ReactGridLayout
        className="dashboard-grid"
        layout={layouts}
        cols={12}
        rowHeight={100}
        margin={[16, 16]}
        isDraggable={isEditing}
        isResizable={isEditing}
        onLayoutChange={handleLayoutChange}
      >
        {widgets.map(widget => (
          <div
            key={widget.id}
            onClick={() => handleWidgetClick(widget.id)}
            style={{ cursor: isEditing ? 'move' : 'default' }}
          >
            <Widget widget={widget} />
          </div>
        ))}
      </ReactGridLayout>

      {selectedWidget && (
        <WidgetSettings
          widget={selectedWidget}
          onClose={handleCloseSettings}
        />
      )}
    </div>
  )
}
