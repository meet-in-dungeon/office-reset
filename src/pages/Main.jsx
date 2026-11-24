// 메인 화면 (담당: 김민지)
// 다음 알림까지 남은 시간, 스트레칭 시작 버튼, 오른쪽 위 빡침 버튼, 기록·통계 진입, 간단한 설정.
import { useEffect, useState } from 'react'
import Button from '../components/Button'
import Screen from '../components/Screen'
import NotificationPermission from '../components/NotificationPermission'
import WorkTimeSettings from '../components/WorkTimeSettings'
import { isAlertDay } from '../lib/alertTimes'
import { navigate, ROUTES } from '../lib/router'
import { getNextAlert } from '../lib/schedule'
import { useSettings } from '../lib/settings'

function formatRemaining(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

function formatClock(date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export default function Main() {
  const [settings, updateSettings] = useSettings()
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const next = settings.alertsEnabled ? getNextAlert(now, settings) : null

  let timerLabel = '알림이 꺼져 있어요'
  let timerValue = '--:--'
  if (settings.alertsEnabled && next) {
    timerLabel = `다음 알림 ${formatClock(next)}까지`
    timerValue = formatRemaining(next.getTime() - now.getTime())
  } else if (settings.alertsEnabled && !isAlertDay(now)) {
    timerLabel = '주말에는 알림이 없어요'
  } else if (settings.alertsEnabled) {
    timerLabel = '오늘 알림은 모두 끝났어요'
  }

  const calmButton = (
    <Button variant="alert" size="round" aria-label="빡침 버튼" onClick={() => navigate(ROUTES.calm)}>
      빡침
    </Button>
  )

  return (
    <Screen title="오늘의 회복" headerRight={calmButton}>
      <section className="card" aria-label="업무 타이머">
        <p className="muted">{timerLabel}</p>
        <p style={{ fontSize: '2.5rem', fontWeight: 700 }}>{timerValue}</p>
        <label className="check" style={{ marginTop: 'var(--space-3)' }}>
          <input
            type="checkbox"
            checked={settings.alertsEnabled}
            onChange={(event) => updateSettings({ alertsEnabled: event.target.checked })}
          />
          알림 받기
        </label>
      </section>

      <Button size="large" block onClick={() => navigate(ROUTES.stretch)}>
        스트레칭 시작
      </Button>
      <Button variant="soft" block onClick={() => navigate(ROUTES.stats)}>
        기록·통계 보기
      </Button>

      <section className="card" aria-label="설정">
        <strong>설정</strong>
        <div className="stack" style={{ marginTop: 'var(--space-3)' }}>
          <WorkTimeSettings />
          <NotificationPermission />
          <label className="check">
            <input
              type="checkbox"
              checked={settings.soundOn}
              onChange={(event) => updateSettings({ soundOn: event.target.checked })}
            />
            소리 켜기
          </label>
        </div>
      </section>
    </Screen>
  )
}
