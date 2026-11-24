// 화면 이동 (라이브러리 설치 없이 주소의 # 뒤를 사용하는 방식)
//
// 주소 예: https://사이트/#/stretch?from=notification
//   - 새로고침해도 같은 화면에 머문다.
//   - 알림을 눌렀을 때 특정 화면(#/stretch)으로 바로 보낼 수 있다.
//
// 사용 예:
//   import { navigate, ROUTES, useRoute } from '../lib/router'
//   navigate(ROUTES.stretch)                         // 화면 이동
//   navigate(ROUTES.stretch, { from: 'notification' }) // 값을 같이 전달
//   const { path, query } = useRoute()               // 지금 화면과 전달된 값

import { useMemo, useSyncExternalStore } from 'react'

export const ROUTES = {
  home: '/',
  onboarding: '/onboarding',
  stretch: '/stretch',
  complete: '/complete',
  calm: '/calm',
  stats: '/stats',
}

function getHash() {
  return window.location.hash
}

function subscribe(listener) {
  window.addEventListener('hashchange', listener)
  return () => window.removeEventListener('hashchange', listener)
}

function parse(hash) {
  const raw = hash.replace(/^#/, '') || '/'
  const [pathPart, queryPart = ''] = raw.split('?')
  const path = pathPart || '/'
  return { path, query: Object.fromEntries(new URLSearchParams(queryPart)) }
}

export function useRoute() {
  const hash = useSyncExternalStore(subscribe, getHash)
  return useMemo(() => parse(hash), [hash])
}

export function toHref(path, query) {
  const qs = query ? new URLSearchParams(query).toString() : ''
  return `#${path}${qs ? `?${qs}` : ''}`
}

// replace: true 이면 "뒤로 가기" 기록을 남기지 않고 바꾼다.
export function navigate(path, query, { replace = false } = {}) {
  const href = toHref(path, query)
  if (replace) {
    window.location.replace(href)
  } else {
    window.location.hash = href.slice(1)
  }
}
