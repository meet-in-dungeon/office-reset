// 팀 공통 설정값. 값을 바꿀 때는 팀에 먼저 알린다. (자세한 설명: docs/ARCHITECTURE.md)

// 한 번의 루틴에서 하는 스트레칭 동작 수. (팀 합의: 3개, 필요하면 이 숫자만 바꾼다)
export const ROUTINE_MOVE_COUNT = 3

// 동작 하나의 카운트 시간(초)
export const MOVE_SECONDS = 5

// 루틴 마지막 호흡 횟수 (호흡 1회의 길이는 미확정)
export const BREATH_COUNT = 5

// 알림 클릭 후 스트레칭 화면의 첫 단계로 큰 "시작" 버튼을 보여줄지. (제안 단계, 팀 의견 수렴 중)
export const START_GATE_ENABLED = true

// 업무 타이머 기본 주기(분)
export const DEFAULT_INTERVAL_MIN = 60

// 스트레칭 부위 (동작 ID는 neck-01, shoulder-02 처럼 "부위-번호" 형식)
export const PARTS = ['neck', 'shoulder', 'wrist', 'waist']

// 브라우저 저장소(localStorage) 키 이름
export const STORAGE_KEYS = {
  settings: 'settings', // 사용자 설정 (민지)
  timer: 'timer', // 업무 타이머 상태 (민지)
  lastPart: 'lastPart', // 직전에 한 부위 (원규의 스트레칭 화면이 읽고 씀. 키 이름만 공통으로 정함)
  routineLogs: 'routineLogs', // 루틴 기록 (주연)
  badges: 'badges', // 배지 상태 (주연)
}

// 사용자 설정 기본값
export const DEFAULT_SETTINGS = {
  onboarded: false, // 온보딩을 마쳤는지
  intervalMin: DEFAULT_INTERVAL_MIN, // 알림 주기(분)
  soundOn: false, // 소리 ON/OFF (사무실을 생각해 기본은 꺼짐)
}
