import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'

// Randomize background orb colors on each load
const hue1 = Math.floor(Math.random() * 360)
const hue2 = (hue1 + 40 + Math.floor(Math.random() * 80)) % 360 // offset by 40-120 degrees
document.documentElement.style.setProperty('--orb1-hue', hue1)
document.documentElement.style.setProperty('--orb2-hue', hue2)

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
