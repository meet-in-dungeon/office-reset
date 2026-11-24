// 기록에 남기는 시각은 "사용자 기기의 현재 시각"을 2026-11-24T13:05:10 형식으로 쓴다. (시간대 표시 없음)
// toISOString()은 세계 표준시(UTC)라서 한국에서는 9시간 어긋난다. 07~10시, 13~15시 같은 시간대 배지와
// "하루" 계산이 틀어지므로 기록에는 이 함수를 쓴다.

const pad = (n) => String(n).padStart(2, '0')

export function nowLocalISO(date = new Date()) {
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  )
}

// 날짜만 필요할 때 (예: 오늘 완료 여부) 2026-11-24 형식
export function todayLocal(date = new Date()) {
  return nowLocalISO(date).slice(0, 10)
}
