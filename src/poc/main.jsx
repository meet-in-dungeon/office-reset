import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import TimerNotificationPoc from './TimerNotificationPoc.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TimerNotificationPoc />
  </StrictMode>,
)
