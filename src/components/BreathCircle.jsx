// 호흡 원: 들이쉬면 커지고 내쉬면 작아지는 반투명 라벤더 원. 가운데에 안내 글자와 남은 초. (담당: 김민지, 스트레칭 마지막 호흡 화면에서 사용)
// breathingIn: 지금 들이쉬는 중인지, seconds: 이번 단계 길이(초, 커지는·작아지는 데 걸리는 시간), left: 남은 초
// 가장 크게 퍼졌을 때(원 + 바깥 테두리 겹)를 기준으로 칸을 잡아 두어서 아래 안내 글자와 겹치지 않는다. (움직임 줄이기 설정이면 크기 변화 없이 글자만 바뀐다)
import { useEffect, useState } from 'react'

export default function BreathCircle({ breathingIn, seconds, left }) {
  // 처음 그려진 직후에 키우기 시작해야 첫 들이쉬기에서도 커지는 모습이 보인다.
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(frame)
  }, [])
  const grow = mounted && breathingIn

  return (
    <div className="breath-area">
      <div
        className={`breath-circle ${grow ? 'breath-circle--in' : 'breath-circle--out'}`}
        style={{ transitionDuration: `${seconds}s` }}
        aria-hidden="true"
      >
        <span className="breath-circle__label">{breathingIn ? '들이쉬기' : '내쉬기'}</span>
        <span className="breath-circle__left">{left}</span>
      </div>
    </div>
  )
}
