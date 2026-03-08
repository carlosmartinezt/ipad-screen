import Clock from './components/Clock'
import Countdown from './components/Countdown'
import Motivator from './components/Motivator'
import Weather from './components/Weather'
import Calendar from './components/Calendar'

export default function App() {
  return (
    <div className="dashboard">
      <Clock />
      <Countdown />
      <Motivator />
      <div className="bottom-row">
        <Calendar />
        <Weather />
      </div>
    </div>
  )
}
