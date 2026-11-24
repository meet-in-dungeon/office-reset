// 루틴 완료 화면 (담당: 이주연)
// 루틴 종료 후 새로 받은 배지와 완료 안내를 보여주고, "업무 복귀"로 메인에 돌아간다.
// 아래는 뼈대용 임시 화면이다. 이 파일은 담당자가 자유롭게 바꾼다.
import Button from '../components/Button'
import Screen from '../components/Screen'
import { navigate, ROUTES } from '../lib/router'

export default function Complete() {
  return (
    <Screen title="루틴 완료">
      <p className="dev-note">임시 화면입니다. 획득한 배지 카드와 완료 안내를 여기에 만듭니다.</p>
      <Button block onClick={() => navigate(ROUTES.home)}>
        업무 복귀
      </Button>
    </Screen>
  )
}
