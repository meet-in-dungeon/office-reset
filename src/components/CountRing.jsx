// 원형 카운트다운. 가운데에 큰 숫자(또는 글자), 둘레에 남은 시간만큼 줄어드는 라벤더 링. (담당: 김민지)
// value: 가운데에 보일 내용, ratio: 0~1 (1이면 가득, 0이면 비어 있음)
// 숫자는 화면 낭독기가 읽도록 aria-live를 쓰는 쪽(Stretch.jsx)에서 정한다.
const RADIUS = 46
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function CountRing({ children, ratio, done = false }) {
  const offset = CIRCUMFERENCE * (1 - Math.min(Math.max(ratio, 0), 1))
  return (
    <div className={`count-ring${done ? ' count-ring--done' : ''}`}>
      <svg className="count-ring__svg" viewBox="0 0 104 104" aria-hidden="true">
        <circle className="count-ring__track" cx="52" cy="52" r={RADIUS} />
        <circle
          className="count-ring__bar"
          cx="52"
          cy="52"
          r={RADIUS}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="count-ring__value">{children}</span>
    </div>
  )
}
