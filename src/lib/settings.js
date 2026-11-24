// 사용자 설정(알림 주기, 소리 ON/OFF 등)을 읽고 바꾼다. 새로고침해도 유지된다.
//
// 사용 예:
//   const [settings, updateSettings] = useSettings()
//   settings.soundOn                       // 소리가 켜져 있는지
//   updateSettings({ soundOn: true })      // 일부 값만 바꾸기
//
// React 밖에서는 getSettings()로 읽을 수 있다.

import { useSyncExternalStore } from 'react'
import { DEFAULT_SETTINGS, STORAGE_KEYS } from './config'
import { readJSON, writeJSON } from './storage'

const listeners = new Set()
let cache = null

function load() {
  return { ...DEFAULT_SETTINGS, ...readJSON(STORAGE_KEYS.settings, {}) }
}

function notify() {
  listeners.forEach((listener) => listener())
}

export function getSettings() {
  if (cache === null) cache = load()
  return cache
}

export function updateSettings(patch) {
  cache = { ...getSettings(), ...patch }
  writeJSON(STORAGE_KEYS.settings, cache)
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
