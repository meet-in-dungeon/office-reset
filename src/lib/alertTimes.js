// 하루 알림 시각을 계산하는 순수 함수. (설정값을 읽지 않고, 받은 값으로만 계산한다)
//
// 규칙
//   - 출근 시각(workStart)에서 알림 주기(intervalMin)만큼씩 더한 시각마다 알린다.
//   - 퇴근 시각(workEnd)과 같거나 늦은 시각에는 알리지 않는다.
//   - 점심시간(lunchStart 이상 lunchEnd 미만)에 걸리는 시각은 건너뛴다.
//   - 기본값(09:00~18:00, 점심 12:00~13:00, 60분)이면 10, 11, 13, 14, 15, 16, 17시로 7회다.
//   - 마지막 알림 시각(17:00)이 "하루의 마지막 루틴"이다.

export function toMinutes(hhmm) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(hhmm ?? '')
  if (!match) return NaN
  return Number(match[1]) * 60 + Number(match[2])
}

export function toHHMM(minutes) {
  const h = String(Math.floor(minutes / 60)).padStart(2, '0')
  const m = String(minutes % 60).padStart(2, '0')
  return `${h}:${m}`
}

// 설정이 올바르면 '', 아니면 사용자에게 보여줄 안내 문구를 돌려준다.
export function validateWorkTime(settings) {
  const start = toMinutes(settings.workStart)
  const end = toMinutes(settings.workEnd)
  if (Number.isNaN(start) || Number.isNaN(end)) return '출근·퇴근 시각을 입력해 주세요.'
  if (end <= start) return '퇴근 시각은 출근 시각보다 늦어야 해요.'
  if (settings.lunchEnabled) {
    const lunchStart = toMinutes(settings.lunchStart)
    const lunchEnd = toMinutes(settings.lunchEnd)
    if (Number.isNaN(lunchStart) || Number.isNaN(lunchEnd)) return '점심시간을 입력해 주세요.'
    if (lunchEnd <= lunchStart) return '점심 끝 시각은 시작 시각보다 늦어야 해요.'
    if (lunchStart < start || lunchEnd > end) return '점심시간은 근무 시간 안에 있어야 해요.'
  }
  return ''
}

// 하루 알림 시각 목록. 예: ['10:00', '11:00', '13:00', ...]
export function getAlertTimes(settings) {
  if (validateWorkTime(settings)) return []
  const start = toMinutes(settings.workStart)
  const end = toMinutes(settings.workEnd)
  const interval = Number(settings.intervalMin)
  if (!(interval > 0)) return []

  const lunchStart = settings.lunchEnabled ? toMinutes(settings.lunchStart) : null
  const lunchEnd = settings.lunchEnabled ? toMinutes(settings.lunchEnd) : null

  const times = []
  for (let t = start + interval; t < end; t += interval) {
    if (lunchStart !== null && t >= lunchStart && t < lunchEnd) continue
    times.push(toHHMM(t))
  }
  return times
}
