// 12개 동작 중 이번 루틴에 보여 줄 동작을 고른다.
// 규칙: 같은 부위는 여러 번 나와도 된다. 같은 동작은 12개가 한 번씩 다 나오기 전에는 다시 나오지 않는다.
// (한 루틴 안의 동작도 서로 다르다.)
// 참고: 동작 수(12)가 한 루틴 동작 수(3)로 나누어떨어지면(4루틴마다 한 바퀴) 위 규칙이 정확히 지켜진다.
// 나누어떨어지지 않으면 한 바퀴가 끝나는 루틴에서 직전 바퀴의 동작이 일찍 다시 나올 수 있다.
//
// 사용 순서 (화면이 다시 그려져도 같은 결과가 나오게 "고르기"와 "기억하기"를 나눴다)
//   1) const plan = planRoutine(data.stretches, ROUTINE_MOVE_COUNT)   // 고르기만 한다. 저장하지 않는다.
//   2) 화면에 동작이 보이기 시작하면 saveShownIds(plan.shownIds)       // 나온 동작을 기억한다. 몇 번 불러도 같은 값이 저장된다.

import { readJSON, writeJSON } from './storage'

// 이 기능 전용 저장 이름. (공통 STORAGE_KEYS에는 없는 이름이라 여기서만 쓴다)
const SHOWN_IDS_KEY = 'shownMoveIds'

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

/**
 * 동작 목록에서 count개를 고른다. 저장하지 않는다.
 * @param {object[]} moves stretches.json의 동작 목록 (status가 "active"인 것만 쓴다)
 * @param {number} count
 * @returns {{ moves: object[], shownIds: string[] }} shownIds는 saveShownIds에 넘길 값
 */
export function planRoutine(moves, count) {
  const active = moves.filter((m) => m.status === 'active')
  const allIds = active.map((m) => m.id)
  const stored = readJSON(SHOWN_IDS_KEY, [])
  const { picked, shownIds } = pickNextIds(allIds, Array.isArray(stored) ? stored : [], count)
  return { moves: picked.map((id) => active.find((m) => m.id === id)), shownIds }
}

// 나온 동작을 브라우저에 기억한다. (절대값을 저장하므로 여러 번 불러도 결과가 같다)
export function saveShownIds(shownIds) {
  writeJSON(SHOWN_IDS_KEY, shownIds)
}
