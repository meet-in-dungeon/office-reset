// 빡침 명상 화면 (담당: 이주연)
// 자연 배경 + 호흡 안내 + 돌아가기. 호흡을 마치면 명상 기록으로 남긴다.
// 아래는 뼈대용 임시 화면이다. 이 파일은 담당자가 자유롭게 바꾼다.
import Button from '../components/Button'
import Screen from '../components/Screen'
import { navigate, ROUTES } from '../lib/router'

export default function Calm() {
  return (
    <Screen title="잠깐 숨 돌리기">
      <p className="dev-note">임시 화면입니다. 자연 배경과 호흡 안내를 여기에 만듭니다.</p>
      <Button variant="soft" block onClick={() => navigate(ROUTES.home)}>
        돌아가기
      </Button>
    </Screen>
  )
}
