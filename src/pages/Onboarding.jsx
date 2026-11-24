// 온보딩 화면 (담당: 김민지)
// 1차: 서비스 소개 + 업무 시간·알림 주기 설정 한 장. 3페이지 완성(프롤로그·알림 설정·사용 가이드/주의사항)은 2차.
import Button from '../components/Button'
import Screen from '../components/Screen'
import WorkTimeSettings from '../components/WorkTimeSettings'
import { navigate, ROUTES } from '../lib/router'
import { updateSettings } from '../lib/settings'

export default function Onboarding() {
  function start() {
    updateSettings({ onboarded: true })
    navigate(ROUTES.home)
  }

  return (
    <Screen title="하루 회복 루틴">
      <p>일하는 중간에 짧게 스트레칭하고 호흡하며 몸을 되돌려요.</p>

      <div className="card">
        <strong>언제 알려 드릴까요?</strong>
        <p className="muted" style={{ marginBottom: 'var(--space-3)' }}>
          출근 시각부터 정해진 주기마다 알려 드려요. 나중에 바꿀 수 있어요.
        </p>
        <WorkTimeSettings />
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
