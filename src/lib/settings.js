// 사용자 설정(알림 주기, 업무 시간, 소리 ON/OFF 등)을 읽고 바꾼다. 새로고침해도 유지된다.
//
// 사용 예:
//   const [settings, updateSettings] = useSettings()
//   settings.soundOn                       // 소리가 켜져 있는지
//   settings.dailyRoutineCount             // 하루 알림 횟수 (읽기 전용, 업무 시간 설정으로 계산한 값)
//   updateSettings({ soundOn: true })      // 일부 값만 바꾸기
//
// React 밖에서는 getSettings()로 읽을 수 있다.
// dailyRoutineCount는 저장하지 않는다. 출근·퇴근·점심·알림 주기를 바꾸면 자동으로 다시 계산된다.

import { useSyncExternalStore } from 'react'
import { getAlertTimes, normalizeInterval } from './alertTimes'
import { DEFAULT_SETTINGS, STORAGE_KEYS } from './config'
import { readJSON, writeJSON } from './storage'

const listeners = new Set()
let stored = null // 저장되는 값
let cache = null // 저장값 + 계산값 (화면에 주는 값)

function derive(values) {
  return { ...values, dailyRoutineCount: getAlertTimes(values).length }
}

function load() {
  stored = { ...DEFAULT_SETTINGS, ...readJSON(STORAGE_KEYS.settings, {}) }
  delete stored.dailyRoutineCount
  // 예전에 저장된 45분·90분 같은 값은 허용되는 주기(30분/1시간/2시간)로 바꾼다. (다음에 설정을 저장할 때 함께 저장된다)
  stored.intervalMin = normalizeInterval(stored.intervalMin)
  cache = derive(stored)
}

function notify() {
  listeners.forEach((listener) => listener())
}

export function getSettings() {
  if (cache === null) load()
  return cache
}

export function updateSettings(patch) {
  getSettings()
  stored = { ...stored, ...patch }
  delete stored.dailyRoutineCount
  writeJSON(STORAGE_KEYS.settings, stored)
  cache = derive(stored)
  notify()
}

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// 다른 탭에서 설정을 바꿨을 때도 따라간다.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEYS.settings) {
      cache = null
      notify()
    }
  })
}

export function useSettings() {
  const settings = useSyncExternalStore(subscribe, getSettings)
  return [settings, updateSettings]
}
