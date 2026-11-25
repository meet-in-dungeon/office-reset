// 루틴 기록 저장과 배지 지급 (담당: 이주연)
//
// 원규 님(스트레칭 화면) 사용법:
//   import { recordRoutine } from '../lib/records'
//   const result = recordRoutine(log)   // 루틴이 끝났을 때 한 번 (마지막 루틴이면 호흡까지 끝난 뒤)
//   navigate(ROUTES.complete)           // 완료 화면이 결과를 알아서 읽는다
//
// log 형식은 docs/ARCHITECTURE.md 6번을 따른다. 배지 판정에 쓰는 값은 아래와 같다.
//   id           같은 루틴이 두 번 저장되지 않게 막는 고유값 (없으면 여기서 만든다)
//   completedAt  루틴을 끝낸 시각, nowLocalISO()로 만든다 (없으면 지금 시각)
//   breathCount  일반 루틴 0, 하루 마지막 루틴 5. 0보다 크면 "하루 완성" 대상이다
//                마지막 루틴에서 호흡을 마치지 못하면 0으로 저장한다. 동작 3개를 마쳤으니 루틴 기록과
//                첫 루틴 배지는 남지만 하루 완성은 나가지 않고, 그날 다음 루틴에서 호흡을 다시 할 수 있다.
//                (김원규 님 제안, 이주연 동의 11/24. 다시 할 수 있는지는 schedule.js의 isLastRoutine이 정한다)
//   moves        이번 루틴에 나온 동작 ID 목록 (스트레칭 도감, 부위별 통계에 쓴다)
//
// 돌려주는 값: { saved, duplicate, newBadges, tierUps, todayCount, totalCount }
//   newBadges  이번에 새로 받은 배지 (하루 완성은 새 날마다 다시 나온다)
//   tierUps    등급이 오른 배지 (실버·골드). tierName에 등급 이름이 들어 있다
//
// 배지는 저장된 기록 전체로 매번 다시 계산한다. 기록만 맞으면 배지가 저절로 맞춰진다.
// 한 번 받은 배지와 등급은 기록이 줄어도 사라지지 않는다.

import { BADGE_IDS, BADGES, badgeMessage, BODY_BOSS_ROUTINES, getBadge, HACKATHON_DAYS, TIER_NAMES, tierIndex } from './badges'
import { STORAGE_KEYS } from './config'
import { readJSON, writeJSON } from './storage'
import { nowLocalISO, todayLocal } from './time'

// 완료 화면에 넘길 마지막 결과. 탭을 닫으면 사라지는 sessionStorage에 잠깐 둔다.
const LAST_RESULT_KEY = 'lastRoutineResult'

// 루틴 기록으로 판정하는 배지와 빡침 명상 기록으로 판정하는 배지
const CALM_BADGE_IDS = [BADGE_IDS.firstCalm]
const ROUTINE_BADGE_IDS = BADGES.map((badge) => badge.id).filter((id) => !CALM_BADGE_IDS.includes(id))

// 동작 ID 앞부분 → 부위 이름 (neck-01 → 목)
export const PART_NAMES = { neck: '목', shoulder: '어깨', wrist: '손목', waist: '허리' }

const dateOf = (iso) => String(iso).slice(0, 10)
const hourOf = (iso) => Number(String(iso).slice(11, 13))

// 'YYYY-MM-DD' ↔ 날짜 계산 (기기 시간 기준, 시차 문제를 피하려고 정오로 만든다)
function toDate(day) {
  const [y, m, d] = day.split('-').map(Number)
  return new Date(y, m - 1, d, 12)
}
function toDay(date) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}
function addDays(day, n) {
  const date = toDate(day)
  date.setDate(date.getDate() + n)
  return toDay(date)
}
const weekdayOf = (day) => toDate(day).getDay() // 0 일요일 ~ 6 토요일
const isWeekday = (day) => weekdayOf(day) >= 1 && weekdayOf(day) <= 5

// 바로 앞 평일 (월요일이면 지난 금요일)
function prevWeekday(day) {
  let prev = addDays(day, -1)
  while (!isWeekday(prev)) prev = addDays(prev, -1)
  return prev
}

const movesOf = (log) => (Array.isArray(log.moves) ? log.moves : Array.isArray(log.moveIds) ? log.moveIds : [])

export function getRoutineLogs() {
  const logs = readJSON(STORAGE_KEYS.routineLogs, [])
  return Array.isArray(logs) ? logs : []
}

export function getCalmLogs() {
  const logs = readJSON(STORAGE_KEYS.calmLogs, [])
  return Array.isArray(logs) ? logs : []
}

export function getBadgeState() {
  const state = readJSON(STORAGE_KEYS.badges, {})
  return state && typeof state === 'object' && !Array.isArray(state) ? state : {}
}

// 평일 연속 실천 최고 기록. 주말에 한 루틴은 연속을 끊지도 늘리지도 않는다. (설계안 8장)
function bestWeekdayStreak(days) {
  const weekdays = [...days].filter(isWeekday).sort()
  let best = 0
  let run = 0
  let last = null
  weekdays.forEach((day) => {
    run = last && prevWeekday(day) === last ? run + 1 : 1
    best = Math.max(best, run)
    last = day
  })
  return best
}

// 지금 이어지고 있는 평일 연속 기록. 오늘 아직 안 했으면 오늘이 끝날 때까지 유지한다.
function currentWeekdayStreak(days, today) {
  const set = new Set(days)
  let day = isWeekday(today) && set.has(today) ? today : prevWeekday(today)
  let streak = 0
  while (set.has(day)) {
    streak += 1
    day = prevWeekday(day)
  }
  return streak
}

// 월~금 5일을 모두 채운 주의 수. 주는 월요일 날짜로 묶는다.
function perfectWeeks(days) {
  const weeks = new Map()
  days.filter(isWeekday).forEach((day) => {
    const monday = addDays(day, -((weekdayOf(day) + 6) % 7))
    weeks.set(monday, (weeks.get(monday) ?? new Set()).add(day))
  })
  return [...weeks.values()].filter((set) => set.size === 5).length
}

// 기록에서 배지 판정 값을 계산한다.
function computeMetrics(routineLogs, calmLogs) {
  const days = [...new Set(routineLogs.map((log) => dateOf(log.completedAt)))]
  const fullDays = [...new Set(routineLogs.filter((log) => Number(log.breathCount) > 0).map((log) => dateOf(log.completedAt)))]
  const moves = new Set(routineLogs.flatMap(movesOf))
  const perDay = {}
  routineLogs.forEach((log) => {
    const day = dateOf(log.completedAt)
    perDay[day] = (perDay[day] ?? 0) + 1
  })
  const maxRoutinesInDay = Math.max(0, ...Object.values(perDay))
  return {
    maxRoutinesInDay,
    bodyBoss: maxRoutinesInDay >= BODY_BOSS_ROUTINES ? 1 : 0,
    firstRoutine: routineLogs.length,
    activeDays: days.length,
    totalRoutines: routineLogs.length,
    fullDays: fullDays.length,
    fullDayList: fullDays.sort(),
    bestWeekdayStreak: bestWeekdayStreak(days),
    uniqueMoves: moves.size,
    morningRoutines: routineLogs.filter((log) => hourOf(log.completedAt) >= 7 && hourOf(log.completedAt) < 10).length,
    lunchRoutines: routineLogs.filter((log) => hourOf(log.completedAt) >= 13 && hourOf(log.completedAt) < 15).length,
    fridayEvening: routineLogs.filter((log) => weekdayOf(dateOf(log.completedAt)) === 5 && hourOf(log.completedAt) >= 17).length,
    perfectWeeks: perfectWeeks(days),
    // 넘긴 동작 수(skippedMoves)가 0인 루틴. 값이 없는 예전 기록은 넘기기가 없던 때라 0으로 본다.
    noSkipRoutines: routineLogs.filter((log) => !(Number(log.skippedMoves) > 0)).length,
    hackathonRoutines: routineLogs.filter((log) => {
      const day = dateOf(log.completedAt)
      return day >= HACKATHON_DAYS.from && day <= HACKATHON_DAYS.to
    }).length,
    calmCount: calmLogs.length,
  }
}

function toResultBadge(id, extra) {
  const badge = getBadge(id)
  if (!badge) return null
  const tierName = typeof extra?.tier === 'number' && Array.isArray(badge.tiers) ? TIER_NAMES[extra.tier] : undefined
  return { ...badge, ...extra, tierName, message: badgeMessage(badge, extra) }
}

// 배지 상태를 다시 계산하고, 새로 받은 배지와 등급이 오른 배지를 골라낸다.
//   ids   이번에 판정할 배지
//   when  이번 기록의 시각 (처음 받은 날, 등급이 오른 날로 쓴다)
function evaluateBadges(ids, metrics, prevState, when) {
  const state = { ...prevState }
  const newBadges = []
  const tierUps = []

  ids.forEach((id) => {
    const badge = getBadge(id)
    if (!badge) return
    const value = metrics[badge.metric] ?? 0
    const prev = prevState[id]
    const prevTier = prev ? (typeof prev.tier === 'number' ? prev.tier : 0) : -1
    const tier = Math.max(tierIndex(badge.tiers, value), prevTier)
    if (tier < 0) return

    const next = {
      unlockedAt: prev?.unlockedAt ?? when,
      tier,
      count: Math.max(value, prev?.count ?? 0),
      tierUpAt: tier > prevTier ? when : (prev?.tierUpAt ?? prev?.unlockedAt ?? when),
    }
    if (id === BADGE_IDS.dailyFull) next.days = metrics.fullDayList
    state[id] = next

    if (!prev) newBadges.push(toResultBadge(id, next))
    else if (tier > prevTier) tierUps.push(toResultBadge(id, next))
    else if (badge.repeat === 'daily') {
      // 하루 완성은 새 날에 다시 하면 카드가 또 나온다 (같은 날 두 번은 안 나옴)
      const day = dateOf(when)
      const prevDays = Array.isArray(prev.days) ? prev.days : []
      if (next.days?.includes(day) && !prevDays.includes(day)) newBadges.push(toResultBadge(id, next))
    }
  })

  return { state, newBadges: newBadges.filter(Boolean), tierUps: tierUps.filter(Boolean) }
}

function saveLastResult(result) {
  try {
    window.sessionStorage.setItem(LAST_RESULT_KEY, JSON.stringify(result))
  } catch {
    // sessionStorage를 쓸 수 없으면 완료 화면은 배지 없이 안내만 보여준다
  }
}

// 완료 화면에서 마지막 루틴 결과를 읽는다. 없으면 null
export function readLastResult() {
  try {
    const raw = window.sessionStorage.getItem(LAST_RESULT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearLastResult() {
  try {
    window.sessionStorage.removeItem(LAST_RESULT_KEY)
  } catch {
    // 무시한다
  }
}

function countLogs(logs, day = todayLocal()) {
  return {
    todayCount: logs.filter((log) => dateOf(log.completedAt) === day).length,
    totalCount: logs.length,
  }
}

export function recordRoutine(log) {
  const logs = getRoutineLogs()
  const empty = { newBadges: [], tierUps: [] }

  // 중간에 나간 루틴(completed: false)이나 잘못된 값은 저장하지 않는다.
  if (!log || typeof log !== 'object' || log.completed === false) {
    return { saved: false, duplicate: false, ...empty, ...countLogs(logs) }
  }

  const entry = {
    ...log,
    id: log.id || `r_${Date.now()}`,
    completedAt: log.completedAt || nowLocalISO(),
    breathCount: Number(log.breathCount) || 0,
    // 저장되는 기록은 모두 완료된 루틴이다. schedule.js의 isLastRoutine()이 이 값을 본다.
    completed: true,
  }

  // 같은 루틴이 두 번 들어오면(버튼 연타, 탭 여러 개) 저장도 배지도 다시 하지 않는다.
  if (logs.some((saved) => saved.id === entry.id)) {
    return { saved: false, duplicate: true, ...empty, ...countLogs(logs) }
  }

  const nextLogs = [...logs, entry]
  writeJSON(STORAGE_KEYS.routineLogs, nextLogs)

  const metrics = computeMetrics(nextLogs, getCalmLogs())
  const { state, newBadges, tierUps } = evaluateBadges(ROUTINE_BADGE_IDS, metrics, getBadgeState(), entry.completedAt)
  writeJSON(STORAGE_KEYS.badges, state)

  const result = {
    saved: true,
    duplicate: false,
    newBadges,
    tierUps,
    breathCount: entry.breathCount, // 완료 화면이 "호흡을 마치지 못한 마지막 루틴"인지 알 때 쓴다
    ...countLogs(nextLogs, dateOf(entry.completedAt)),
  }
  saveLastResult(result)
  return result
}

// ---------------------------------------------------------------------------
// 빡침 명상 기록 (calmLogs). 빡침 화면(Calm.jsx)이 호흡 3회를 끝까지 마치면 부른다.
//   recordCalm({ id, startedAt, completedAt, breathCount })
//   돌려주는 값: { saved, duplicate, newBadges, tierUps }
// ---------------------------------------------------------------------------

export function recordCalm(log = {}) {
  const logs = getCalmLogs()
  const entry = {
    ...log,
    id: log.id || `c_${Date.now()}`,
    completedAt: log.completedAt || nowLocalISO(),
    breathCount: Number(log.breathCount) || 0,
  }

  // 같은 명상이 두 번 들어오면 저장도 배지도 다시 하지 않는다.
  if (logs.some((saved) => saved.id === entry.id)) {
    return { saved: false, duplicate: true, newBadges: [], tierUps: [] }
  }

  const nextLogs = [...logs, entry]
  writeJSON(STORAGE_KEYS.calmLogs, nextLogs)

  const metrics = computeMetrics(getRoutineLogs(), nextLogs)
  const { state, newBadges, tierUps } = evaluateBadges(CALM_BADGE_IDS, metrics, getBadgeState(), entry.completedAt)
  writeJSON(STORAGE_KEYS.badges, state)

  return { saved: true, duplicate: false, newBadges, tierUps }
}

// ---------------------------------------------------------------------------
// 통계 화면용
// ---------------------------------------------------------------------------

// 요약: 오늘 완료 여부, 오늘·전체 횟수, 받은 배지, 배지별 지금 값(진행률)
export function getStats() {
  const logs = getRoutineLogs()
  const state = getBadgeState()
  const metrics = computeMetrics(logs, getCalmLogs())
  const { todayCount, totalCount } = countLogs(logs)
  return {
    todayDone: todayCount > 0,
    todayCount,
    totalCount,
    badges: Object.keys(state)
      .map((id) => toResultBadge(id, state[id]))
      .filter(Boolean),
    progress: Object.fromEntries(BADGES.map((badge) => [badge.id, metrics[badge.metric] ?? 0])),
  }
}

// 이번 주(월~금) 상세 통계: 요일별 횟수, 부위별 횟수, 시간대별 횟수, 빡침 명상 횟수, 평일 연속 기록
//   today를 넘기면 그날 기준으로 계산한다 (테스트용)
export function getWeeklyStats(today = todayLocal()) {
  const logs = getRoutineLogs()
  const calmLogs = getCalmLogs()
  const monday = addDays(today, -((weekdayOf(today) + 6) % 7))
  const weekDays = [0, 1, 2, 3, 4].map((n) => addDays(monday, n))
  const inWeek = (log) => weekDays.includes(dateOf(log.completedAt))
  const weekLogs = logs.filter(inWeek)
  const weekCalm = calmLogs.filter(inWeek)

  const parts = Object.fromEntries(Object.keys(PART_NAMES).map((part) => [part, 0]))
  weekLogs.flatMap(movesOf).forEach((moveId) => {
    const part = String(moveId).split('-')[0]
    if (part in parts) parts[part] += 1
  })

  // 시간대: 오전(12시 전), 점심 후(12~15시), 오후(15시부터)
  const bucketOf = (log) => {
    const hour = hourOf(log.completedAt)
    return hour < 12 ? 'morning' : hour < 15 ? 'afternoon' : 'evening'
  }
  const times = { morning: { routine: 0, calm: 0 }, afternoon: { routine: 0, calm: 0 }, evening: { routine: 0, calm: 0 } }
  weekLogs.forEach((log) => (times[bucketOf(log)].routine += 1))
  weekCalm.forEach((log) => (times[bucketOf(log)].calm += 1))

  const allDays = [...new Set(logs.map((log) => dateOf(log.completedAt)))]
  return {
    days: weekDays.map((day, index) => ({
      day,
      label: ['월', '화', '수', '목', '금'][index],
      count: weekLogs.filter((log) => dateOf(log.completedAt) === day).length,
      isToday: day === today,
    })),
    weekCount: weekLogs.length,
    parts,
    moveCount: weekLogs.flatMap(movesOf).length,
    times,
    calmCount: weekCalm.length,
    streak: { current: currentWeekdayStreak(allDays, today), best: bestWeekdayStreak(allDays) },
  }
}
