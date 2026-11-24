// 루틴 기록 저장과 배지 지급 (담당: 이주연)
//
// 원규 님(스트레칭 화면) 사용법:
//   import { recordRoutine } from '../lib/records'
//   const result = recordRoutine(log)   // 루틴이 끝났을 때 한 번 (마지막 루틴이면 호흡까지 끝난 뒤)
//   navigate(ROUTES.complete)           // 완료 화면이 결과를 알아서 읽는다
//
// log 형식은 docs/ARCHITECTURE.md 6번을 따른다. 배지 판정에 꼭 필요한 값은 아래 셋이다.
//   id           같은 루틴이 두 번 저장되지 않게 막는 고유값 (없으면 여기서 만든다)
//   completedAt  루틴을 끝낸 시각, nowLocalISO()로 만든다 (없으면 지금 시각)
//   breathCount  일반 루틴 0, 하루 마지막 루틴 5. 0보다 크면 "하루 완성" 대상이다
//
// 돌려주는 값: { saved, duplicate, newBadges, tierUps, todayCount, totalCount }
//   newBadges  이번에 새로 받은 배지 목록 (badges.js의 배지 + 하루 완성은 받은 날 수 count)
//   tierUps    등급이 오른 배지 목록. 등급은 2차라 지금은 항상 빈 목록이다
//
// 배지는 저장된 기록 전체로 매번 다시 계산한다. 기록만 맞으면 배지가 저절로 맞춰진다.

import { BADGE_IDS, getBadge } from './badges'
import { STORAGE_KEYS } from './config'
import { readJSON, writeJSON } from './storage'
import { nowLocalISO, todayLocal } from './time'

// 완료 화면에 넘길 마지막 결과. 탭을 닫으면 사라지는 sessionStorage에 잠깐 둔다.
const LAST_RESULT_KEY = 'lastRoutineResult'

const dateOf = (iso) => String(iso).slice(0, 10)

export function getRoutineLogs() {
  const logs = readJSON(STORAGE_KEYS.routineLogs, [])
  return Array.isArray(logs) ? logs : []
}

export function getBadgeState() {
  const state = readJSON(STORAGE_KEYS.badges, {})
  return state && typeof state === 'object' && !Array.isArray(state) ? state : {}
}

// 기록 전체에서 루틴 배지 상태를 다시 계산한다. (빡침 배지는 루틴 기록과 따로라 이전 값을 유지한다)
function computeBadgeState(logs, prevState) {
  const next = { ...prevState }
  delete next[BADGE_IDS.firstRoutine]
  delete next[BADGE_IDS.dailyFull]

  const sorted = [...logs].sort((a, b) => String(a.completedAt).localeCompare(String(b.completedAt)))

  if (sorted.length > 0) {
    next[BADGE_IDS.firstRoutine] = { unlockedAt: sorted[0].completedAt }
  }

  const lastRoutines = sorted.filter((log) => Number(log.breathCount) > 0)
  if (lastRoutines.length > 0) {
    const days = [...new Set(lastRoutines.map((log) => dateOf(log.completedAt)))]
    next[BADGE_IDS.dailyFull] = {
      unlockedAt: lastRoutines[0].completedAt,
      days,
      count: days.length,
    }
  }

  return next
}

function toResultBadge(id, extra) {
  const badge = getBadge(id)
  return badge ? { ...badge, ...extra } : null
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

  const prevState = getBadgeState()
  const nextState = computeBadgeState(nextLogs, prevState)
  writeJSON(STORAGE_KEYS.badges, nextState)

  const newBadges = []
  if (!prevState[BADGE_IDS.firstRoutine] && nextState[BADGE_IDS.firstRoutine]) {
    newBadges.push(toResultBadge(BADGE_IDS.firstRoutine))
  }
  const day = dateOf(entry.completedAt)
  const prevDays = prevState[BADGE_IDS.dailyFull]?.days ?? []
  const nextDaily = nextState[BADGE_IDS.dailyFull]
  if (nextDaily?.days.includes(day) && !prevDays.includes(day)) {
    newBadges.push(toResultBadge(BADGE_IDS.dailyFull, { count: nextDaily.count }))
  }

  const result = {
    saved: true,
    duplicate: false,
    newBadges: newBadges.filter(Boolean),
    tierUps: [],
    ...countLogs(nextLogs, day),
  }
  saveLastResult(result)
  return result
}

function countLogs(logs, day = todayLocal()) {
  return {
    todayCount: logs.filter((log) => dateOf(log.completedAt) === day).length,
    totalCount: logs.length,
  }
}

// ---------------------------------------------------------------------------
// 빡침 명상 기록 (calmLogs). 빡침 화면(Calm.jsx)이 호흡 3회를 끝까지 마치면 부른다.
//   recordCalm({ id, startedAt, completedAt, breathCount })
//   돌려주는 값: { saved, duplicate, newBadges }
// ---------------------------------------------------------------------------

export function getCalmLogs() {
  const logs = readJSON(STORAGE_KEYS.calmLogs, [])
  return Array.isArray(logs) ? logs : []
}

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
    return { saved: false, duplicate: true, newBadges: [] }
  }

  writeJSON(STORAGE_KEYS.calmLogs, [...logs, entry])

  const state = getBadgeState()
  const newBadges = []
  if (!state[BADGE_IDS.firstCalm]) {
    writeJSON(STORAGE_KEYS.badges, { ...state, [BADGE_IDS.firstCalm]: { unlockedAt: entry.completedAt } })
    newBadges.push(toResultBadge(BADGE_IDS.firstCalm))
  }

  return { saved: true, duplicate: false, newBadges: newBadges.filter(Boolean) }
}

// 통계 화면용: 오늘 완료 여부, 오늘·전체 횟수, 받은 배지
export function getStats() {
  const logs = getRoutineLogs()
  const state = getBadgeState()
  const { todayCount, totalCount } = countLogs(logs)
  return {
    todayDone: todayCount > 0,
    todayCount,
    totalCount,
    badges: Object.keys(state)
      .map((id) => toResultBadge(id, state[id]))
      .filter(Boolean),
  }
}
