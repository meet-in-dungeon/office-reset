// 오늘의 알림 일정과 "하루의 마지막 루틴" 판정.
//
// 사용 예:
//   import { isLastRoutine, getNextAlert } from '../lib/schedule'
//   if (isLastRoutine()) { /* 동작 뒤에 호흡 5회를 붙인다 (breathCount: 5) */ }
//   const next = getNextAlert()   // 다음 알림 시각(Date) 또는 null
//
// "하루의 마지막 루틴" = 오늘 마지막 알림 시각(기본 17:00) 이후에 시작한 루틴.
//   - 단, 오늘 이미 호흡까지 끝낸 기록(breathCount > 0)이 있으면 더는 마지막이 아니다. (호흡은 하루 한 번)
//   - 알림을 놓치거나 직접 스트레칭을 여러 번 해도 판정이 어긋나지 않도록 "횟수"가 아니라 "시각"으로 판단한다.
//   - 알림이 꺼져 있거나 알림 시각이 하나도 없으면 false다.

import { getAlertTimes, toMinutes } from './alertTimes'
import { STORAGE_KEYS } from './config'
import { getSettings } from './settings'
import { readJSON } from './storage'
import { todayLocal } from './time'

// 오늘의 알림 시각 목록 ['10:00', '11:00', ...]
export function getTodayAlertTimes(settings = getSettings()) {
  return getAlertTimes(settings)
}

// 지금 이후의 가장 가까운 오늘 알림 시각(Date). 없으면 null. 알림이 꺼져 있어도 일정은 계산해 준다.
export function getNextAlert(now = new Date(), settings = getSettings()) {
  for (const hhmm of getAlertTimes(settings, now)) {
    const [h, m] = hhmm.split(':').map(Number)
    const at = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0)
    if (at.getTime() > now.getTime()) return at
  }
  return null
}

export function isLastRoutine(now = new Date(), settings = getSettings()) {
  if (!settings.alertsEnabled) return false
  const times = getAlertTimes(settings, now)
  if (times.length === 0) return false

  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  if (nowMinutes < toMinutes(times[times.length - 1])) return false

  const today = todayLocal(now)
  const logs = readJSON(STORAGE_KEYS.routineLogs, [])
  const alreadyDidBreath =
    Array.isArray(logs) &&
    logs.some((log) => log?.completed && log?.breathCount > 0 && String(log.completedAt ?? '').startsWith(today))
  return !alreadyDidBreath
}
