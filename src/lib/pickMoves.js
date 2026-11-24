// 12개 동작 중 이번 루틴에 보여 줄 동작을 고른다.
// 규칙: 같은 부위는 여러 번 나와도 된다. 같은 동작은 12개가 한 번씩 다 나오기 전에는 다시 나오지 않는다.
// (한 루틴 안의 동작도 서로 다르다.)
// 참고: 동작 수(12)가 한 루틴 동작 수(3)로 나누어떨어지면(4루틴마다 한 바퀴) 위 규칙이 정확히 지켜진다.
// 나누어떨어지지 않으면 한 바퀴가 끝나는 루틴에서 직전 바퀴의 동작이 일찍 다시 나올 수 있다.

const STORAGE_KEY = 'officeReset.stretch.shownMoveIds'

/**
 * 순수 함수: 저장소 없이 계산만 한다.
 * @param {string[]} allIds   고를 수 있는 동작 ID 전체 (예: active 12개)
 * @param {string[]} shownIds 현재 한 바퀴에서 이미 나온 동작 ID
 * @param {number} count      이번 루틴에 필요한 동작 수
 * @param {() => number} random 0 이상 1 미만의 난수 함수
 * @returns {{ picked: string[], shownIds: string[] }}
 */
export function pickNextIds(allIds, shownIds, count, random = Math.random) {
  const wanted = Math.min(count, allIds.length)
  let shown = shownIds.filter((id) => allIds.includes(id))
  const picked = []

  while (picked.length < wanted) {
    let pool = allIds.filter((id) => !shown.includes(id) && !picked.includes(id))
    if (pool.length === 0) {
      // 한 바퀴를 다 돌았으니 새 바퀴를 시작한다. 방금 이번 루틴에서 고른 것은 새 바퀴에서도 "나온 것"으로 친다.
      shown = [...picked]
      pool = allIds.filter((id) => !shown.includes(id))
    }
    const choice = pool[Math.floor(random() * pool.length)]
    picked.push(choice)
  }

  return { picked, shownIds: [...shown, ...picked] }
}

function readShownIds() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeShownIds(ids) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch {
    // 저장이 막혀 있어도 루틴은 계속 진행한다. (다음 루틴에서 중복이 나올 수 있다.)
  }
}

/**
 * 동작 목록에서 count개를 골라 돌려주고, 나온 동작을 브라우저에 기억한다.
 * @param {object[]} moves stretches.json의 동작 목록 (status가 "active"인 것만 쓴다)
 * @param {number} count
 */
export function pickMoves(moves, count = 3) {
  const active = moves.filter((m) => m.status === 'active')
  const allIds = active.map((m) => m.id)
  const { picked, shownIds } = pickNextIds(allIds, readShownIds(), count)
  writeShownIds(shownIds)
  return picked.map((id) => active.find((m) => m.id === id))
}
