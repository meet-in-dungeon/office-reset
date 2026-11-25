// 배지 정의 (담당: 이주연)
// 배지 이름·문구·조건·등급표를 한곳에 모았다. 판정과 저장은 records.js가 한다.
// 기준: 이주연 "배지 획득 규칙 설계안" (2차는 설계안대로 진행, 이주연 결정 11/24)
//
// 1차 배지
//   - 첫 루틴(first_routine): 처음으로 루틴을 완료했을 때 평생 1번
//   - 하루 완성(daily_full): 그날 "하루의 마지막 루틴"(호흡까지)을 끝냈을 때. 날짜마다 1번
//       기록의 breathCount가 0보다 크면 하루 마지막 루틴으로 본다. 받은 날 수로 등급이 오른다
//   - 첫 빡침 해소(first_calm): 빡침 명상에서 호흡 3회 안내를 끝까지 마쳤을 때 (이주연 결정, 11/24)
// 2차 배지: 출근 도장, 리셋 장인, 평일 개근상, 스트레칭 도감, 모닝 리셋, 식곤증 격파, 불금(히든)
// 벤치마킹 후 추가 (이주연 결정, 11/24): 이번 주 개근상(듀오링고 '완벽한 일주일'), 스킵은 사치(듀오링고 '무결점 학습자'),
//   해커톤 기념(포스퀘어 '할로윈 2010' 같은 기간 한정 배지, 히든. 11/26까지 루틴 1번)
//   "광속 리셋"은 알림 시각 기록이 정해지지 않아 아직 만들지 않는다.
//   히든 "몸관리 끝판왕"은 하루 루틴 7번 (기본 알림 7번을 모두 따라 하면 받는다. 이주연 결정, 11/25)
//
// 등급 규칙 (설계안 3장): 처음 받는 순간이 브론즈, 반복하면 실버·골드로 오르고 내려가지 않는다.
//   등급은 색만으로 구분하지 않고 "브론즈/실버/골드" 글자를 같이 보여준다.
//   tiers가 없는 배지는 등급이 없는 단일 배지다.
//
// metric: records.js가 기록에서 계산하는 값의 이름
//   firstRoutine 루틴 수 / activeDays 루틴을 한 날 수 / totalRoutines 루틴 수 / fullDays 하루 완성한 날 수
//   bestWeekdayStreak 평일 연속 최고 기록 / uniqueMoves 만난 서로 다른 동작 수
//   morningRoutines 7~10시 루틴 수 / lunchRoutines 13~15시 루틴 수 / fridayEvening 금요일 17시 이후 루틴 수
//   perfectWeeks 월~금 5일 모두 한 주 수 / noSkipRoutines 넘긴 동작 없이 끝낸 루틴 수
//   hackathonRoutines 해커톤 기간(HACKATHON_DAYS)에 한 루틴 수
//   maxRoutinesInDay 하루에 가장 많이 한 루틴 수
//   calmCount 빡침 명상 수 (빡침 명상 기록으로 따로 계산)
// tierMessage의 {N}은 지금 값으로 바뀐다.

export const TIER_NAMES = ['브론즈', '실버', '골드']

// 해커톤 기념 배지를 받을 수 있는 기간 (이 날짜에 한 루틴만 센다)
export const HACKATHON_DAYS = { from: '2026-11-24', to: '2026-11-26' }

export const BADGE_IDS = {
  firstRoutine: 'first_routine',
  attendance: 'attendance',
  resetMaster: 'reset_master',
  dailyFull: 'daily_full',
  weekdayStreak: 'weekday_streak',
  moveDex: 'move_dex',
  morning: 'morning',
  lunchSlayer: 'lunch_slayer',
  perfectWeek: 'perfect_week',
  noSkip: 'no_skip',
  firstCalm: 'first_calm',
  hackathon: 'hackathon_2026',
  bodyBoss: 'body_boss',
  fridayFire: 'friday_fire',
}

// 몸관리 끝판왕: 하루에 이만큼 루틴을 하면 받는다
export const BODY_BOSS_ROUTINES = 7

// 통계 화면 배지함에 보이는 순서
export const BADGES = [
  {
    id: BADGE_IDS.firstRoutine,
    name: '첫 스트레칭 성공!',
    icon: '🐣', // 설계안 아이콘. 배지 디자인이 나오면 바꾼다
    message: '잘했어요! 첫 스트레칭 완료. 허리 수술비 3천만 원 아끼기, 지금 시작됐어요',
    condition: '처음으로 루틴 완료',
    metric: 'firstRoutine',
  },
  {
    id: BADGE_IDS.attendance,
    name: '출근 도장',
    icon: '📅',
    message: '오늘도 출근 도장 쾅! 몸도 같이 출근했네요',
    tierMessage: '벌써 {N}일째 도장! 개근상 노려볼까요?',
    condition: '스트레칭한 날 수',
    metric: 'activeDays',
    tiers: [3, 10, 20],
    tierUnit: '일',
  },
  {
    id: BADGE_IDS.resetMaster,
    name: '리셋 장인',
    icon: '🔁',
    message: '리셋 10번 달성. 몸이 기억하기 시작했어요',
    tierMessage: '리셋 {N}번. 이제 장인이라 불러도 돼요',
    condition: '누적 루틴 횟수',
    metric: 'totalRoutines',
    tiers: [10, 30, 100],
    tierUnit: '회',
  },
  {
    id: BADGE_IDS.dailyFull,
    name: '나를 위한 하루',
    icon: '🌕',
    message: '오늘은 일만 한 게 아니라 나도 챙긴 하루였어요!',
    tierMessage: '하루 완성 {N}일째. 꾸준함이 쌓이고 있어요',
    condition: '하루의 마지막 루틴(호흡까지) 완료',
    metric: 'fullDays',
    repeat: 'daily', // 날짜마다 1번 카드가 나오고, 받은 날 수가 쌓인다
    tiers: [1, 5, 15],
    tierUnit: '일',
  },
  {
    id: BADGE_IDS.weekdayStreak,
    name: '평일 개근상',
    icon: '🔥',
    message: '평일 3일 연속! 습관의 씨앗이 심어졌어요',
    tierMessage: '평일 {N}일 연속! 부장님도 못 따라올 꾸준함',
    condition: '평일 연속 실천 (주말은 건너뜀)',
    metric: 'bestWeekdayStreak',
    tiers: [3, 5, 10],
    tierUnit: '일',
  },
  {
    id: BADGE_IDS.perfectWeek,
    name: '이번 주 개근상',
    icon: '🏫',
    message: '월요일부터 금요일까지 개근! 개근상은 초등학교 이후 처음이죠?',
    tierMessage: '개근한 주 {N}번째! 이 정도면 사내 표창감이에요',
    condition: '한 주 월~금 5일 모두 스트레칭',
    metric: 'perfectWeeks',
    tiers: [4, 7, 10], // 개근한 주 수 (이주연 결정, 11/24)
    tierUnit: '주',
  },
  {
    id: BADGE_IDS.moveDex,
    name: '스트레칭 도감',
    icon: '🎲',
    message: '새로운 동작 4개 발견! 도감이 채워지고 있어요 🎲',
    tierMessage: '도감 {N}/12! 아직 못 만난 동작이 기다려요',
    goldMessage: '도감 완성! 모든 동작을 만나 봤어요',
    condition: '서로 다른 동작 만나기 (전체 12개)',
    metric: 'uniqueMoves',
    tiers: [4, 8, 12],
    tierUnit: '개',
  },
  {
    id: BADGE_IDS.noSkip,
    name: '스킵은 사치',
    icon: '⏩',
    message: '넘기기 없이 끝까지! 스킵은 사치였네요 ⏩',
    tierMessage: '논스톱 완주 {N}번. 끝까지 하는 사람이 멋있어요',
    condition: '넘긴 동작 없이 루틴 완료',
    metric: 'noSkipRoutines',
    tiers: [3, 10, 30],
    tierUnit: '회',
  },
  {
    id: BADGE_IDS.morning,
    name: '모닝 리셋',
    icon: '☀️',
    message: '출근하자마자 리셋! 오늘 하루 출발이 좋아요 ☀️',
    tierMessage: '아침 리셋 {N}번. 모닝 루틴 완성!',
    condition: '오전 7~10시에 루틴 완료',
    metric: 'morningRoutines',
    tiers: [1, 5, 15],
    tierUnit: '회',
  },
  {
    id: BADGE_IDS.lunchSlayer,
    name: '식곤증 격파',
    icon: '🍚',
    message: '점심 먹고 졸린 그 시간, 이겨냈습니다 🍚',
    tierMessage: '식곤증 {N}번 격파. 오후의 지배자!',
    condition: '오후 1~3시에 루틴 완료',
    metric: 'lunchRoutines',
    tiers: [1, 5, 15],
    tierUnit: '회',
  },
  {
    id: BADGE_IDS.firstCalm,
    name: '인간 공기청정기',
    icon: '😤', // 설계안 아이콘. 배지 디자인이 나오면 바꾼다
    message: '나쁜 기분은 내쉬고, 좋은 공기는 들이쉬고! 마음 공기 정화 완료',
    condition: '빡침 명상에서 호흡 3회 완료',
    metric: 'calmCount',
    tiers: [1, 10, 30], // 명상 누적 횟수 (이주연 결정, 11/24)
    tierUnit: '회',
  },
  {
    id: BADGE_IDS.hackathon,
    name: '던만 해커톤 기념',
    icon: '🎪',
    message: '던만 해커톤 기간에 함께 몸을 챙겼어요! 이 배지는 지금만 받을 수 있어요',
    condition: '11/24~11/26 기간 한정, 루틴 1회',
    hint: '지금 이 3일 동안만 몰래 열리는 배지…', // 히든 배지: 받기 전에는 이름 대신 ???와 힌트만 보인다
    hidden: true, // 히든 배지로 바꿈 (이주연 결정, 11/25). 11/26까지 루틴 1번만 해도 받는다
    metric: 'hackathonRoutines',
    limited: true, // 기간 한정 배지. 기간이 지나면 받을 수 없다
  },
  {
    id: BADGE_IDS.bodyBoss,
    name: '몸관리 끝판왕',
    icon: '👑',
    message: '오늘 하루, 몸관리 만렙 찍었습니다! 👑',
    condition: `하루에 루틴 ${BODY_BOSS_ROUTINES}번`,
    hint: '하루를 누구보다 꾸준히 보내면…?', // 히든 배지
    hidden: true,
    metric: 'bodyBoss', // 하루 최다 루틴 수가 기준 이상이면 1
  },
  {
    id: BADGE_IDS.fridayFire,
    name: '불금에도 스트레칭 퐈이어',
    icon: '🔥',
    message: '불타는 금요일, 어깨도 활활! 좋은 주말 보내세요 🔥',
    condition: '금요일 오후 5시 이후 루틴 완료',
    hint: '한 주의 마지막 그 시간…', // 히든 배지: 받기 전에는 이름 대신 ???와 힌트만 보인다
    hidden: true,
    metric: 'fridayEvening',
  },
]

export function getBadge(id) {
  return BADGES.find((badge) => badge.id === id) ?? null
}

// 누적 값(count)이 등급표(tiers)의 몇 번째 칸까지 왔는지. 아직 브론즈 전이면 -1
// 등급이 없는 배지는 1 이상이면 0(받음)으로 본다.
export function tierIndex(tiers, count) {
  if (!Array.isArray(tiers)) return count >= 1 ? 0 : -1
  let index = -1
  tiers.forEach((need, i) => {
    if (count >= need) index = i
  })
  return index
}

// 카드에 보여줄 문구. 처음 받을 때는 message, 등급이 오를 때는 tierMessage({N} 바꿈)
export function badgeMessage(badge, { tier = 0, count = 0 } = {}) {
  if (!badge) return ''
  if (tier >= 2 && badge.goldMessage) return badge.goldMessage
  if (tier >= 1 && badge.tierMessage) return badge.tierMessage.replaceAll('{N}', String(count))
  return badge.message
}
