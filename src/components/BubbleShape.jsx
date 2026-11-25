// 말풍선 외곽 모양. 몸체와 꼬리를 하나의 닫힌 SVG path로 그려서 외곽선이 끊기거나 겹치지 않는다.
// 글자는 넣지 않는다(HTML 텍스트가 그대로 위에 올라간다). 스타일은 App.css의 .bubble__shape 에서 맞춘다.
// vector-effect="non-scaling-stroke" 로 말풍선 크기가 바뀌어도 외곽선은 항상 1.5px로 보인다. (담당: 김민지)
const BUBBLE_PATH =
  'M50 0 C80 0 100 16 100 46 C100 78 80 98 50 98 C34 98 22 96 -6 92 C6 86 6 76 4 66 C0 58 0 52 0 46 C0 16 20 0 50 0 Z'

export default function BubbleShape() {
  return (
    <svg className="bubble__shape" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path d={BUBBLE_PATH} vectorEffect="non-scaling-stroke" />
    </svg>
  )
}
