// 원형 카운트다운. 가운데에 큰 숫자(또는 글자), 둘레에 남은 시간만큼 줄어드는 링. (담당: 김민지)
// ratio: 0~1 (1이면 가득, 0이면 비어 있음)
// state: 스트레칭 동작 화면의 세 상태 (2026-11-25 팀 결정). 안 주면 호흡 화면용 기본 모양.
//   'prepare' 준비: 흰 바탕 + 라벤더 테두리, 링은 움직이지 않는다 (children = '준비')
//   'run'     진행: 노란 바탕 + 보라 진행 링, 큰 숫자
//   'done'    완료: 민트 바탕 + 체크 표시
// 카운트다운은 자동으로 진행되는 표시 요소이고 누르는 버튼이 아니다.
import { CheckIcon } from './Icons'

const RADIUS = 46
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function CountRing({ children, ratio, state }) {
  const offset = CIRCUMFERENCE * (1 - Math.min(Math.max(ratio, 0), 1))
  const showBar = state !== 'prepare' && state !== 'done'
  return (
    <div className={`count-ring${state ? ` count-ring--${state}` : ''}`}>
      <svg className="count-ring__svg" viewBox="0 0 104 104" aria-hidden="true">
        <circle className="count-ring__track" cx="52" cy="52" r={RADIUS} />
        {showBar ? (
          <circle
            className="count-ring__bar"
            cx="52"
            cy="52"
            r={RADIUS}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
          />
        ) : null}
      </svg>
      {state === 'done' ? (
        <>
          <CheckIcon className="count-ring__check" width="44" height="44" />
          <span className="visually-hidden">완료</span>
        </>
      ) : (
        <span className="count-ring__value">{children}</span>
      )}
    </div>
  )
}

// 진행 상태에서 링 좌우에 붙는 노란 만화풍 강조선. 디자이너의 강조선 에셋(sticker-accent.svg)이 오면 그 이미지로 바뀐다.
// side: 'left' | 'right'
export function CountAccent({ side }) {
  return (
    <span className={`count-accent count-accent--${side}`} aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  )
}
