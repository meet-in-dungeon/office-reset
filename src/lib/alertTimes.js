// 하루 알림 시각을 계산하는 순수 함수. (설정값을 읽지 않고, 받은 값으로만 계산한다)
// 규칙의 기준은 docs/ALERT_RULES.md 이다.
//
// 규칙
//   - 출근 시각(workStart)에서 알림 주기(intervalMin)만큼씩 더한 시각마다 알린다.
//   - 알림 주기는 30분 / 1시간 / 2시간 중 하나다. (다른 값이 저장되어 있으면 normalizeInterval이 바꾼다)
//   - 퇴근 시각(workEnd)과 같거나 늦은 시각에는 알리지 않는다.
//   - 점심시간(lunchStart 이상 lunchEnd 미만)에 걸리는 시각은 건너뛴다. 건너뛴 알림은 다시 보내지 않는다.
//   - 알림은 평일(월~금)에만 있다. 주말(토·일)에는 알림 시각이 하나도 없다.
//   - 오후 2시 이상 4시 미만에 정기 알림이 없으면 추가 알림을 하나 넣는다. (아래 pickExtraAlert)
//   - 기본값(09:00~18:00, 점심 12:00~13:00, 60분)이면 10, 11, 13, 14, 15, 16, 17시로 7회다.
//   - 마지막 알림 시각(17:00)이 "하루의 마지막 루틴"이다. 추가 알림도 이 목록에 들어가므로 판정이 어긋나지 않는다.

// 선택할 수 있는 알림 주기(분)
export const ALERT_INTERVAL_OPTIONS = [30, 60, 120]

// 오후 추가 알림을 넣는 시간대 [14:00, 16:00)와 기본 시각 15:00, 정기 알림과의 최소 간격(분), 옮길 때의 단위(분)
const EXTRA_WINDOW_START = 14 * 60
const EXTRA_WINDOW_END = 16 * 60
const EXTRA_DEFAULT = 15 * 60
const EXTRA_MIN_GAP = 30
const EXTRA_STEP = 5

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

// 허용되는 주기(30, 60, 120)가 아니면 가까운 허용 값으로 바꾼다. 예전에 저장된 45분은 30분, 90분은 60분이 된다.
export function normalizeInterval(value) {
  const minutes = Number(value)
  if (ALERT_INTERVAL_OPTIONS.includes(minutes)) return minutes
  const lower = ALERT_INTERVAL_OPTIONS.filter((option) => option <= minutes)
  return lower.length > 0 ? lower[lower.length - 1] : ALERT_INTERVAL_OPTIONS[0]
}

// 알림을 보내는 요일인지. 평일(월~금)만 true. (요일 선택 기능은 MVP에서 제외)
export function isAlertDay(date = new Date()) {
  const day = date.getDay()
  return day >= 1 && day <= 5
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

// 규칙 5~8: 오후 2시 이상 4시 미만에 정기 알림이 없을 때 넣을 추가 알림 시각(분). 넣을 수 없으면 null.
//   - 15:00에 보낼 수 있으면 15:00 (근무시간·점심시간 안이고, 정기 알림과 30분 이상 떨어져 있을 때)
//   - 아니면 오후 2~4시 안에서 가장 가까운 보낼 수 있는 시각 (5분 단위, 같은 거리면 더 이른 시각)
function pickExtraAlert(regular, canSendAt) {
  const hasRegular = regular.some((t) => t >= EXTRA_WINDOW_START && t < EXTRA_WINDOW_END)
  if (hasRegular) return null

  const ok = (t) => canSendAt(t) && regular.every((r) => Math.abs(r - t) >= EXTRA_MIN_GAP)
  if (ok(EXTRA_DEFAULT)) return EXTRA_DEFAULT

  let best = null
  for (let t = EXTRA_WINDOW_START; t < EXTRA_WINDOW_END; t += EXTRA_STEP) {
    if (!ok(t)) continue
    const distance = Math.abs(t - EXTRA_DEFAULT)
    if (best === null || distance < best.distance) best = { t, distance }
  }
  return best === null ? null : best.t
}

// 요일과 상관없이, 평일 하루의 알림 시각 목록. (설정 화면의 미리보기에 쓴다)
export function getWeekdayAlertTimes(settings) {
  if (validateWorkTime(settings)) return []
  const start = toMinutes(settings.workStart)
  const end = toMinutes(settings.workEnd)
  const interval = normalizeInterval(settings.intervalMin)

  const lunchStart = settings.lunchEnabled ? toMinutes(settings.lunchStart) : null
  const lunchEnd = settings.lunchEnabled ? toMinutes(settings.lunchEnd) : null
  const canSendAt = (t) => t >= start && t < end && !(lunchStart !== null && t >= lunchStart && t < lunchEnd)

  const times = []
  for (let t = start + interval; t < end; t += interval) {
    if (canSendAt(t)) times.push(t)
  }

  const extra = pickExtraAlert(times, canSendAt)
  if (extra !== null) times.push(extra)

  return times.sort((a, b) => a - b).map(toHHMM)
}

// 하루 알림 시각 목록. 예: ['10:00', '11:00', '13:00', ...]. 알림이 없는 날(주말)은 빈 목록이다.
export function getAlertTimes(settings, date = new Date()) {
  if (!isAlertDay(date)) return []
  return getWeekdayAlertTimes(settings)
}
