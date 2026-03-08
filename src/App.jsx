import Clock from './components/Clock'
import Countdown from './components/Countdown'
import Weather from './components/Weather'

export default function App() {
  return (
    <div className="dashboard">
      <Clock />
      <Countdown />
      <Weather />
    </div>
  )
}
