// 메인 화면 (담당: 김민지)
// 다음 알림까지 남은 시간, 스트레칭 시작 버튼, 오른쪽 위 빡침 버튼, 기록·통계 진입, 간단한 설정.
import { useEffect, useState } from 'react'
import Asset from '../components/Asset'
import Button from '../components/Button'
import { ChevronIcon } from '../components/Icons'
import Screen from '../components/Screen'
import NotificationPermission from '../components/NotificationPermission'
import WorkTimeSettings from '../components/WorkTimeSettings'
import { isAlertDay } from '../lib/alertTimes'
import { navigate, ROUTES } from '../lib/router'
import { getNextAlert } from '../lib/schedule'
import { useSettings } from '../lib/settings'
import './Main.css'

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
  // 말풍선 문구는 타이머 상태에 따라 바뀐다. (임시 문구, PM 확정 전)
  let bubbleLines = ['알림이 꺼져 있어요!', '켜 두면 제때 알려 드릴게요']
  if (settings.alertsEnabled && next) {
    timerLabel = `다음 알림 ${formatClock(next)}까지`
    timerValue = formatRemaining(next.getTime() - now.getTime())
    bubbleLines = ['잠깐만요!', '지금 딱 몸 풀기 좋은 시간이에요.']
  } else if (settings.alertsEnabled && !isAlertDay(now)) {
    timerLabel = '주말에는 알림이 없어요'
    bubbleLines = ['주말이에요!', '푹 쉬어도 좋고, 가볍게 풀어도 좋아요']
  } else if (settings.alertsEnabled) {
    timerLabel = '오늘 알림은 모두 끝났어요'
    bubbleLines = ['오늘도 수고했어요!', '더 풀고 싶다면 지금 시작해요']
  }

  const calmButton = (
    <div className="home-calm">
      <Asset file="anger-sticker.svg" kind="decor" className="home-calm__sticker" />
      <Button variant="alert" size="round" aria-label="빡침 버튼" onClick={() => navigate(ROUTES.calm)}>
        <Asset
          file="character-angry.webp"
          kind="decor"
          className="home-calm__face"
          fallback={<span>빡침</span>}
        />
      </Button>
    </div>
  )

  return (
    <Screen
      className="home"
      title={<Asset file="logo-main.png" kind="decor" alt="잠깐만 휴식" className="home-logo" />}
      titleClassName="home-logo-title"
      headerRight={calmButton}
    >
      <div className="home-hero">
        <Asset file="rays-yellow.png" kind="decor" className="home-deco home-deco--rays-left" />
        <Asset file="star-blue.png" kind="decor" className="home-deco home-deco--star-blue" />
        <Asset file="star-orange.png" kind="decor" className="home-deco home-deco--star-orange" />
        <Asset file="star-pink.png" kind="decor" className="home-deco home-deco--star-pink" />
        <Asset file="motion-puff.svg" kind="decor" className="home-deco home-deco--puff" />
        <Asset file="rays-yellow.png" kind="decor" className="home-deco home-deco--rays-right" />
        <div className="home-hero__character">
          <Asset file="character-main.webp" size="권장 560×660" alt="안내 캐릭터" />
          <span className="home-hero__mask" aria-hidden="true" />
        </div>
        <div className="home-bubble">
          <Asset file="rays-pink.png" kind="decor" className="home-bubble__rays" />
          <Asset file="speech-bubble.svg" kind="decor" className="home-bubble__shape" />
          <p className="home-bubble__text">
            <strong>{bubbleLines[0]}</strong>
            <span>{bubbleLines[1]}</span>
          </p>
        </div>
      </div>

      <section className="home-alarm" aria-label="업무 타이머">
        <Asset file="alarm-clock.png" kind="decor" className="home-alarm__icon" />
        <div className="home-alarm__center">
          <p className="home-alarm__label">{timerLabel}</p>
          <p className="home-alarm__value">{timerValue}</p>
        </div>
        <label className="home-alarm__check">
          <input
            type="checkbox"
            checked={settings.alertsEnabled}
            onChange={(event) => updateSettings({ alertsEnabled: event.target.checked })}
          />
          <span>알림 받기</span>
        </label>
      </section>

      <div className="home-actions">
        <Button size="large" block className="home-cta home-cta--stretch" onClick={() => navigate(ROUTES.stretch)}>
          <Asset file="icon-play.png" kind="decor" className="home-cta__icon" />
          <span>스트레칭 시작</span>
          <Asset file="sparkle.svg" kind="decor" className="home-cta__spark" />
        </Button>
        <Button variant="soft" block className="home-cta home-cta--stats" onClick={() => navigate(ROUTES.stats)}>
          <Asset file="icon-stats.png" kind="decor" className="home-cta__icon" />
          <span>기록·통계 보기</span>
          <Asset file="sparkle.svg" kind="decor" className="home-cta__spark" />
        </Button>
      </div>

      <details className="home-settings">
        <summary className="home-settings__summary">
          <Asset file="icon-settings.png" kind="decor" className="home-settings__icon" />
          <span>알림·루틴 설정</span>
          <ChevronIcon className="home-settings__chevron" width="20" height="20" />
        </summary>
        <div className="stack home-settings__body">
          <WorkTimeSettings />
          <NotificationPermission />
        </div>
      </details>
    </Screen>
  )
}
