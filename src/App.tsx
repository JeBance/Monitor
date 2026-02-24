import { useEffect } from 'react'
import { useDashboardStore } from './store/dashboardStore'
import Dashboard from './components/Dashboard'
import Sidebar from './components/Sidebar'
import PluginManager from './components/PluginManager'

function App() {
  const { loadState } = useDashboardStore()

  useEffect(() => {
    loadState()
  }, [loadState])

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
        <PluginManager />
        <Dashboard />
      </main>
    </div>
  )
}

export default App
