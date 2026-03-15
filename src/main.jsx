import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'

// Blue background theme
document.documentElement.style.setProperty('--orb1-hue', 220)
document.documentElement.style.setProperty('--orb2-hue', 240)

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
