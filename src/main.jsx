import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { PackProvider } from './context'
import App from './App'
import './index.css'

// Using HashRouter for Capacitor compatibility (file:// protocol)
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <PackProvider>
        <App />
      </PackProvider>
    </HashRouter>
  </React.StrictMode>,
)
