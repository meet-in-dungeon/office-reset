// 온보딩 화면 (담당: 김민지)
// 1차: 서비스 소개 + 업무 시간·알림 주기 설정 한 장. 3페이지 완성(프롤로그·알림 설정·사용 가이드/주의사항)은 2차.
import Button from '../components/Button'
import Screen from '../components/Screen'
import NotificationPermission from '../components/NotificationPermission'
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
        <strong>이렇게 쓰세요</strong>
        <ol style={{ margin: 'var(--space-2) 0 0', paddingLeft: 'var(--space-5)', display: 'grid', gap: 'var(--space-2)' }}>
          <li>정해진 시각(평일)에 알림이 오면 눌러서 스트레칭을 시작해요.</li>
          <li>동작 3개를 5초씩 따라 해요. 하루의 마지막 루틴에는 호흡 5회가 붙어요.</li>
          <li>루틴을 마치면 배지를 받고, 통계에서 기록을 볼 수 있어요.</li>
        </ol>
      </div>

      <div className="card">
        <strong>언제 알려 드릴까요?</strong>
        <p className="muted" style={{ marginBottom: 'var(--space-3)' }}>
          출근 시각부터 정해진 주기마다 알려 드려요. 나중에 바꿀 수 있어요.
        </p>
        <WorkTimeSettings />
      </div>

      <div className="card">
        <strong>알림을 받아 볼까요?</strong>
        <p className="muted" style={{ marginBottom: 'var(--space-3)' }}>
          허용하지 않아도 쓸 수 있어요. 이 화면 안에서 알려 드려요.
        </p>
        <NotificationPermission />
      </div>

      <div className="card">
        <strong>주의해 주세요</strong>
        <p className="muted">
          통증이 느껴지면 바로 멈추고 무리하지 마세요. 몸에 이상이 있다면 전문가와 상담해 주세요.
        </p>
      </div>

      <Button block onClick={start}>
        시작하기
      </Button>
    </Screen>
  )
}
