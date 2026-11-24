// 스트레칭 루틴 화면 (담당: 김원규)
// 흐름: (알림으로 들어오면 큰 시작 버튼) → 동작 ROUTINE_MOVE_COUNT개(5초 카운트, "다음" 버튼) → 완료 화면
// 호흡 5회는 매 루틴이 아니라 "하루의 마지막 루틴"에서만 동작 뒤에 붙는다. isLastRoutine() (src/lib/schedule.js)으로 알 수 있다.
// 알림으로 들어오면 주소가 #/stretch?from=notification 이 된다. (useRoute().query.from)
// 아래는 뼈대용 임시 화면이다. 이 파일은 담당자가 자유롭게 바꾼다.
import Button from '../components/Button'
import Screen from '../components/Screen'
import { BREATH_COUNT, MOVE_SECONDS, ROUTINE_MOVE_COUNT, START_GATE_ENABLED } from '../lib/config'
import { navigate, ROUTES, useRoute } from '../lib/router'

export default function Stretch() {
  const { query } = useRoute()

  return (
    <Screen title="스트레칭">
      <p className="dev-note">
        임시 화면입니다. 동작 {ROUTINE_MOVE_COUNT}개 × {MOVE_SECONDS}초, 하루 마지막 루틴에만 호흡 {BREATH_COUNT}회를 붙입니다.
        <br />
        알림으로 들어옴: {query.from === 'notification' ? '예' : '아니오'} / 시작 버튼 단계 사용:{' '}
        {START_GATE_ENABLED ? '예' : '아니오'}
      </p>
      <Button block onClick={() => navigate(ROUTES.complete)}>
        (임시) 루틴 완료로 이동
      </Button>
      <Button variant="ghost" block onClick={() => navigate(ROUTES.home)}>
        메인으로
      </Button>
    </Screen>
  )
}
