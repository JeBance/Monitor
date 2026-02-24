import { useDashboardStore } from '../store/dashboardStore'
import './PluginManager.css'

export default function PluginManager() {
  const { isEditing, toggleEditMode, exportState, importState } = useDashboardStore()

  const handleExport = () => {
    const json = exportState()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'dashboard-export.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      
      const reader = new FileReader()
      reader.onload = async () => {
        try {
          await importState(reader.result as string)
        } catch (error) {
          alert(error instanceof Error ? error.message : 'Failed to import')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  return (
    <div className="plugin-manager">
      <div className="toolbar">
        <button onClick={toggleEditMode} className={isEditing ? 'btn-active' : ''}>
          {isEditing ? '✓ Done' : '✎ Edit'}
        </button>
        <button onClick={handleExport}>Export</button>
        <button onClick={handleImport}>Import</button>
      </div>
    </div>
  )
}
