import { useEffect } from 'react'
import { useDashboardStore } from './store/dashboardStore'
import Dashboard from './components/Dashboard'
import Sidebar from './components/Sidebar'
import PluginManager from './components/PluginManager'
import ToastContainer from './components/ToastContainer'
import './App.css'

function App() {
  const { loadState } = useDashboardStore()

  useEffect(() => {
    loadState()
  }, [loadState])

  return (
    <div className="app">
      <ToastContainer />
      <header className="app-header">
        <h1 className="app-logo">Monitor</h1>
      </header>
      <div className="app-body">
        <Sidebar />
        <main className="app-main">
          <PluginManager />
          <Dashboard />
        </main>
      </div>
    </div>
  )
}

export default App
