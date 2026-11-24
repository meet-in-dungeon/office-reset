// 온보딩 화면 (담당: 김민지)
// 1차: 서비스 소개 + 알림 주기 설정 한 장. 3페이지 완성(프롤로그·알림 설정·사용 가이드/주의사항)은 2차.
import Button from '../components/Button'
import Screen from '../components/Screen'
import { navigate, ROUTES } from '../lib/router'
import { useSettings } from '../lib/settings'

const INTERVAL_OPTIONS = [30, 45, 60, 90, 120]

export default function Onboarding() {
  const [settings, updateSettings] = useSettings()

  function start() {
    updateSettings({ onboarded: true })
    navigate(ROUTES.home)
  }

  return (
    <Screen title="하루 회복 루틴">
      <p>일하는 중간에 짧게 스트레칭하고 호흡하며 몸을 되돌려요.</p>

      <div className="card">
        <label htmlFor="interval">
          <strong>얼마나 자주 알려 드릴까요?</strong>
        </label>
        <p className="muted">보통 1시간마다 알림을 받아요. 나중에 바꿀 수 있어요.</p>
        <select
          id="interval"
          value={settings.intervalMin}
          onChange={(event) => updateSettings({ intervalMin: Number(event.target.value) })}
          style={{ marginTop: 'var(--space-3)', minHeight: 'var(--tap-size)', width: '100%' }}
        >
          {INTERVAL_OPTIONS.map((min) => (
            <option key={min} value={min}>
              {min}분마다
            </option>
          ))}
        </select>
      </div>

      <p className="dev-note">
        임시 화면입니다. 알림 허용 요청, 사용 가이드, 주의사항은 이어서 구현합니다.
      </p>

      <Button block onClick={start}>
        시작하기
      </Button>
    </Screen>
  )
}
