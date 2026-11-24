// 알림 발송. 정해진 알림 시각(lib/schedule.js)이 되면 앱 안 안내(AlertBanner)를 띄우고,
// 브라우저 알림 권한이 있으면 시스템 알림도 보낸다. 알림을 누르면 스트레칭 화면(#/stretch?from=notification)으로 간다.
//
// 사용 예:
//   useAlertScheduler()                 // App에서 한 번만 호출한다. (김민지)
//   getLastNotifiedAt()                 // 가장 최근 알림이 뜬 시각 'YYYY-MM-DDTHH:mm:ss' (루틴 기록의 notifiedAt에 쓴다)
//
// 범위: 브라우저 탭이 열려 있는 동안의 알림이다. 브라우저를 완전히 종료한 상태의 알림은 지원하지 않는다.

import { useEffect, useSyncExternalStore } from 'react'
import { ALERT_GRACE_MIN, STORAGE_KEYS } from './config'
import { getAlertTimes } from './alertTimes'
import { navigate, ROUTES } from './router'
import { getSettings } from './settings'
import { readJSON, writeJSON } from './storage'
import { nowLocalISO, todayLocal } from './time'

const isSupported = typeof window !== 'undefined' && 'Notification' in window

// ---- 앱 안에서 보여 주는 "지금 알림이 와 있다" 상태 ----
const listeners = new Set()
let pending = null // { slot, firedAt } 또는 null

function notify() {
  listeners.forEach((listener) => listener())
}

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function usePendingAlert() {
  return useSyncExternalStore(subscribe, () => pending)
}

export function dismissPendingAlert() {
  pending = null
  notify()
}

// 알림(앱 안 안내나 시스템 알림)을 눌러 스트레칭을 시작한다.
export function startRoutineFromAlert() {
  dismissPendingAlert()
  navigate(ROUTES.stretch, { from: 'notification' })
}

// ---- 알림이 뜬 시각 기록 ----
function readTimer() {
  const value = readJSON(STORAGE_KEYS.timer, {})
  return value && typeof value === 'object' ? value : {}
}

export function getLastNotifiedAt() {
  return readTimer().lastNotifiedAt ?? null
}

// ---- 시스템 알림 ----
export function getNotificationPermission() {
  return isSupported ? Notification.permission : 'unsupported'
}

export async function requestNotificationPermission() {
  if (!isSupported) return 'unsupported'
  return Notification.requestPermission()
}

function showSystemNotification(slotLabel) {
  if (!isSupported || Notification.permission !== 'granted') return
  try {
    const n = new Notification('스트레칭 할 시간이에요', {
      body: '잠깐 몸을 풀고 올까요? 누르면 바로 시작해요.',
      tag: `office-reset-alert-${slotLabel}-${Date.now()}`, // 같은 tag면 이전 알림이 조용히 교체되어 매번 다르게
      silent: !getSettings().soundOn, // 소리 설정을 따른다. (사무실을 고려해 기본은 무음)
    })
    n.onclick = () => {
      window.focus()
      n.close()
      startRoutineFromAlert()
    }
  } catch {
    // 알림을 만들 수 없는 환경이면 앱 안 안내만 쓴다.
  }
}

// 지금 이 탭을 보고 있는지. 보고 있으면 앱 안 안내만 띄워 알림이 겹치지 않게 한다.
function isUserLookingAtTab() {
  return document.visibilityState === 'visible' && document.hasFocus()
}

function fire(slot, { force = false } = {}) {
  const firedAt = nowLocalISO()
  writeJSON(STORAGE_KEYS.timer, { ...readTimer(), lastSlot: slot, lastNotifiedAt: firedAt })
  pending = { slot, firedAt }
  notify()
  if (force || !isUserLookingAtTab()) showSystemNotification(slot)
}

// 5초 뒤 테스트 알림. 설정 화면의 "알림 테스트"와 시연에서 쓴다. (다른 탭으로 이동해서 확인한다)
export function sendTestAlert(delaySeconds = 5) {
  return window.setTimeout(() => fire(`test-${Date.now()}`, { force: true }), delaySeconds * 1000)
}

// ---- 알림 시각 확인 ----
// 가장 최근에 지난 알림 시각이 아직 안 알린 시각이고 허용 시간(ALERT_GRACE_MIN) 안이면 알린다.
export function checkAlerts(now = new Date()) {
  const settings = getSettings()
  if (!settings.onboarded || !settings.alertsEnabled) return false

  const today = todayLocal(now)
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const due = getAlertTimes(settings, now)
    .map((hhmm) => ({ hhmm, minutes: Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3)) }))
    .filter((item) => item.minutes <= nowMinutes)
    .pop()
  if (!due || nowMinutes - due.minutes > ALERT_GRACE_MIN) return false

  const slot = `${today}T${due.hhmm}`
  if (readTimer().lastSlot === slot) return false

  fire(slot)
  return true
}

// 앱 어디에 있든 알림 시각을 확인한다. 숨은 탭은 타이머가 늦어질 수 있어서
// 1초마다 "지금 시각"으로 확인하고, 탭으로 돌아오면 바로 한 번 더 확인한다.
export function useAlertScheduler() {
  useEffect(() => {
    const check = () => checkAlerts()
    check()
    const interval = window.setInterval(check, 1000)
    window.addEventListener('focus', check)
    document.addEventListener('visibilitychange', check)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', check)
      document.removeEventListener('visibilitychange', check)
    }
  }, [])
}
