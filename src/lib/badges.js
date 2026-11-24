// 배지 정의 (담당: 이주연)
// 1차 배지 3종의 이름·문구·조건을 한곳에 모았다. 판정과 저장은 records.js가 한다.
//
// 지급 규칙 (1차)
//   - 첫 루틴(first_routine): 처음으로 루틴을 완료했을 때 평생 1번
//   - 하루 완성(daily_full): 그날 "하루의 마지막 루틴"(호흡까지)을 끝냈을 때. 날짜마다 1번
//       기록의 breathCount가 0보다 크면 하루 마지막 루틴으로 본다. (일반 루틴은 0, 마지막 루틴은 5)
//   - 첫 빡침 해소(first_calm): 빡침 명상에서 호흡 3회 안내를 끝까지 마쳤을 때 평생 1번 (이주연 결정, 11/24)
//
// 등급(브론즈·실버·골드)과 나머지 배지는 2차다.

export const BADGE_IDS = {
  firstRoutine: 'first_routine',
  dailyFull: 'daily_full',
  firstCalm: 'first_calm',
}

export const BADGES = [
  {
    id: BADGE_IDS.firstRoutine,
    name: '첫 스트레칭 성공!',
    icon: '🐣', // 설계안 아이콘. 배지 디자인이 나오면 바꾼다
    message: '잘했어요! 첫 스트레칭 완료. 허리 수술비 3천만 원 아끼기, 지금 시작됐어요',
    condition: '처음으로 루틴 완료',
    repeat: 'once', // 평생 1번
  },
  {
    id: BADGE_IDS.dailyFull,
    name: '나를 위한 하루',
    icon: '🌕', // 설계안 아이콘. 배지 디자인이 나오면 바꾼다
    message: '오늘은 일만 한 게 아니라 나도 챙긴 하루였어요!',
    condition: '하루의 마지막 루틴(호흡까지) 완료',
    repeat: 'daily', // 날짜마다 1번, 받은 날 수가 쌓인다
  },
  {
    id: BADGE_IDS.firstCalm,
    name: '인간 공기청정기',
    icon: '😤', // 설계안 아이콘. 배지 디자인이 나오면 바꾼다
    message: '나쁜 기분은 내쉬고, 좋은 공기는 들이쉬고! 마음 공기 정화 완료',
    condition: '빡침 명상에서 호흡 3회 완료',
    repeat: 'once',
  },
]

export function getBadge(id) {
  return BADGES.find((badge) => badge.id === id) ?? null
}
