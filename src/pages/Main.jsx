// 메인 화면 (담당: 김민지)
// 타이머, 스트레칭 시작 버튼, 오른쪽 위 빡침 버튼, 기록·통계 진입, 간단한 설정.
import Button from '../components/Button'
import Screen from '../components/Screen'
import { navigate, ROUTES } from '../lib/router'
import { useSettings } from '../lib/settings'

const INTERVAL_OPTIONS = [30, 45, 60, 90, 120]

export default function Main() {
  const [settings, updateSettings] = useSettings()

  const calmButton = (
    <Button variant="alert" size="round" aria-label="빡침 버튼" onClick={() => navigate(ROUTES.calm)}>
      빡침
    </Button>
  )

  return (
    <Screen title="오늘의 회복" headerRight={calmButton}>
      <section className="card" aria-label="업무 타이머">
        <p className="muted">다음 스트레칭까지</p>
        <p style={{ fontSize: '2.5rem', fontWeight: 700 }}>{String(settings.intervalMin).padStart(2, '0')}:00</p>
        <p className="dev-note" style={{ marginTop: 'var(--space-3)' }}>
          타이머 동작은 아직 연결 전입니다. (지금은 설정한 주기만 표시)
        </p>
      </section>

      <Button size="large" block onClick={() => navigate(ROUTES.stretch)}>
        스트레칭 시작
      </Button>
      <Button variant="soft" block onClick={() => navigate(ROUTES.stats)}>
        기록·통계 보기
      </Button>

      <section className="card" aria-label="설정">
        <strong>설정</strong>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-3)' }}>
          <label>
            <span className="muted">알림 주기</span>
            <select
              value={settings.intervalMin}
              onChange={(event) => updateSettings({ intervalMin: Number(event.target.value) })}
              style={{ display: 'block', width: '100%', minHeight: 'var(--tap-size)' }}
            >
              {INTERVAL_OPTIONS.map((min) => (
                <option key={min} value={min}>
                  {min}분마다
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
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
