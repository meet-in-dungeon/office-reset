// 통계 화면 (담당: 이주연)
// 오늘 완료 여부, 총 완료 횟수, 획득 배지를 보여준다. 새로고침해도 기록이 유지되어야 한다.
// 아래는 뼈대용 임시 화면이다. 이 파일은 담당자가 자유롭게 바꾼다.
import Button from '../components/Button'
import Screen from '../components/Screen'
import { navigate, ROUTES } from '../lib/router'

export default function Stats() {
  return (
    <Screen title="기록·통계">
      <p className="dev-note">임시 화면입니다. 오늘 완료 여부, 총 횟수, 배지를 여기에 만듭니다.</p>
      <Button variant="soft" block onClick={() => navigate(ROUTES.home)}>
        메인으로
      </Button>
    </Screen>
  )
}
