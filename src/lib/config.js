// 팀 공통 설정값. 값을 바꿀 때는 팀에 먼저 알린다. (자세한 설명: docs/ARCHITECTURE.md)

// 한 번의 루틴에서 하는 스트레칭 동작 수. (팀 합의: 3개, 필요하면 이 숫자만 바꾼다)
export const ROUTINE_MOVE_COUNT = 3

// 동작 하나의 카운트 시간(초)
export const MOVE_SECONDS = 5

// 호흡 횟수(5회). 매 루틴이 아니라 "하루의 마지막 루틴"에서만 한다. 마지막 루틴인지는 lib/schedule.js의 isLastRoutine()으로 안다. (호흡 1회의 길이는 미확정)
export const BREATH_COUNT = 5

// 호흡 1회의 길이(초): 들이쉬기 + 내쉬기. 김원규 님이 정한 시작값이며 아직 미확정이다. (5회면 약 40초)
// 빡침 명상 화면의 호흡 안내도 같은 값을 쓰면 두 화면의 호흡 속도가 맞는다.
export const BREATH_INHALE_SECONDS = 4
export const BREATH_EXHALE_SECONDS = 4

// 알림 클릭 후 스트레칭 화면의 첫 단계로 큰 "시작" 버튼을 보여줄지. (제안 단계, 팀 의견 수렴 중)
export const START_GATE_ENABLED = true

// 알림 시각이 지났어도 이 시간(분) 안에 앱이 깨어나면 늦게라도 알려 준다. (숨은 탭은 타이머가 늦어질 수 있다)
// 이보다 오래 지난 알림은 건너뛴다. (노트북을 덮어 둔 뒤 몇 시간 늦게 알림이 쏟아지는 것을 막는다)
export const ALERT_GRACE_MIN = 5

// 업무 타이머 기본 주기(분)
export const DEFAULT_INTERVAL_MIN = 60

// 스트레칭 부위 (동작 ID는 neck-01, shoulder-02 처럼 "부위-번호" 형식)
export const PARTS = ['neck', 'shoulder', 'wrist', 'waist']

// 브라우저 저장소(localStorage) 키 이름
export const STORAGE_KEYS = {
  settings: 'settings', // 사용자 설정 (민지)
  timer: 'timer', // 업무 타이머 상태 (민지)
  routineLogs: 'routineLogs', // 루틴 기록 (주연)
  badges: 'badges', // 배지 상태 (주연)
  calmLogs: 'calmLogs', // 빡침 명상 기록 (주연이 쓰고 읽음)
}

// 사용자 설정 기본값
export const DEFAULT_SETTINGS = {
  onboarded: false, // 온보딩을 마쳤는지
  intervalMin: DEFAULT_INTERVAL_MIN, // 알림 주기(분)
  soundOn: false, // 소리 ON/OFF (사무실을 생각해 기본은 꺼짐)
  alertsEnabled: true, // 알림 받기 켜기/끄기
  workStart: '09:00', // 출근 시각 (24시간 "HH:mm")
  workEnd: '18:00', // 퇴근 시각. 이 시각에는 알림이 없다
  lunchEnabled: true, // 점심시간에는 알림을 건너뛸지
  lunchStart: '12:00',
  lunchEnd: '13:00',
  // dailyRoutineCount(하루 알림 횟수)는 저장하지 않고 위 값으로 계산해서 settings에 담아 준다. (읽기 전용)
}
