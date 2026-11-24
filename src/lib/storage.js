// 브라우저 저장소(localStorage)를 안전하게 읽고 쓴다.
// 저장소를 쓸 수 없거나(시크릿 모드 등) 값이 깨져 있어도 에러 없이 기본값을 돌려준다.

export function readJSON(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function writeJSON(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function removeKey(key) {
  try {
    window.localStorage.removeItem(key)
  } catch {
    // 저장소를 쓸 수 없으면 무시한다
  }
}
