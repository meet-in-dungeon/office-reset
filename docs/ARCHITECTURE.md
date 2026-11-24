# 화면 구조와 공통 개발 규칙 (ARCHITECTURE)

> 작성: 김민지(공통 뼈대 담당). 팀원과 팀원의 AI가 개발 전에 읽는 문서다.
> 근거는 [docs/reference/](reference/README.md)의 확정 사항이다. 이 문서와 다르면 `docs/reference/DECISIONS.md`가 먼저다.
> **"제안" 표시는 아직 팀 합의 전이다.** 임의로 확정하지 말고, 바꾸려면 담당자끼리 합의한다.

## 1. 화면 6개와 주소

주소는 `#` 뒤를 쓴다. (예: `https://사이트/#/stretch`) 새로고침해도 같은 화면에 머문다.

| 화면 | 주소 | 파일 | 담당 | 하는 일 |
|---|---|---|---|---|
| 온보딩 | `#/onboarding` | `src/pages/Onboarding.jsx` | 김민지 | 서비스 소개, 알림 설정. 처음 접속하면 여기로 온다 |
| 메인 | `#/` | `src/pages/Main.jsx` | 김민지 | 타이머, 스트레칭 시작, 오른쪽 위 빡침 버튼, 기록·통계 진입, 설정 |
| 스트레칭 루틴 | `#/stretch` | `src/pages/Stretch.jsx` | 김원규 (영상 재생·음성은 서진수) | 동작 → 호흡 → 완료 |
| 완료 | `#/complete` | `src/pages/Complete.jsx` | 이주연 | 획득 배지와 완료 안내, "업무 복귀" |
| 빡침 명상 | `#/calm` | `src/pages/Calm.jsx` | 이주연 | 자연 배경, 호흡 안내, 돌아가기 |
| 통계 | `#/stats` | `src/pages/Stats.jsx` | 이주연 | 오늘 완료 여부, 총 횟수, 획득 배지 |

브라우저 알림은 화면이 아니다. 타이머가 끝나면 알림을 띄우고, 알림을 누르면 `#/stretch?from=notification`으로 들어온다. (김민지)

## 2. 화면 흐름

```
온보딩 ─▶ 메인 ─▶ 스트레칭 루틴 ─▶ 완료 ─▶ (업무 복귀) 메인
              ├─▶ 빡침 명상 ─▶ (돌아가기) 메인
              ├─▶ 통계 ─▶ (돌아가기) 메인
   타이머 종료 ─▶ 브라우저 알림 ─▶ 스트레칭 루틴 (주소에 from=notification)
```

- 스트레칭 루틴 화면 안의 흐름: (알림으로 들어왔을 때만 큰 "시작" 버튼) → 동작 `ROUTINE_MOVE_COUNT`개 → 호흡 5회 → 완료 화면
- 동작마다 5초 카운트가 끝나면 멈추고, **"다음" 버튼**을 눌러야 넘어간다. 자동 전환과 "이전" 버튼은 없다. (확정)
- "업무 복귀"를 누르면 메인으로 돌아가 타이머를 다시 시작한다. (김민지, 타이머 연결 때 구현)

## 3. 내 화면을 개발하는 방법

1. 내 화면 파일(`src/pages/…`)만 고친다. 다른 사람의 화면 파일과 공통 파일은 먼저 상의한다.
2. 화면 전용 스타일은 화면 파일 옆에 새 CSS를 만든다. (예: `src/pages/Stats.css`) `index.css`, `App.css`는 공통이라 고치지 않는다.
3. 화면 파일 위쪽 주석과 "임시 화면" 표시는 지워도 된다. 기능을 만들면 `dev-note` 문구도 지운다.
4. 공통 파일은 `package.json`, `package-lock.json`, `vite.config.js`, `index.html`, `src/App.jsx`, `src/main.jsx`, `src/index.css`, `src/App.css`다. 바꿔야 하면 `chore/` 브랜치로 따로 올린다. ([TEAM_RULES](TEAM_RULES.md))
5. 새 라이브러리는 설치하기 전에 팀에 알린다. 이 뼈대는 **라이브러리를 추가하지 않았다.**

## 4. 화면 이동 (`src/lib/router.js`)

```js
import { navigate, ROUTES, useRoute } from '../lib/router'

navigate(ROUTES.stretch)                            // 화면 이동
navigate(ROUTES.stretch, { from: 'notification' })  // 값을 같이 전달 (#/stretch?from=notification)
const { path, query } = useRoute()                  // 지금 화면과 전달된 값
```

- 주소 목록은 `ROUTES`에 있다. 문자열(`'/stretch'`)을 직접 쓰지 말고 `ROUTES`를 쓴다.
- 객체나 긴 데이터는 주소로 넘기지 못한다. 화면 사이에 데이터를 넘길 때는 아래 5번의 저장소를 쓴다.

## 5. 브라우저 저장소 (`localStorage`)

서버 없이 브라우저에만 저장한다. 키 이름은 `src/lib/config.js`의 `STORAGE_KEYS`에 있다. 읽고 쓸 때는 `src/lib/storage.js`의 `readJSON`, `writeJSON`을 쓴다. (저장소를 못 쓰는 환경에서도 에러가 나지 않는다)

| 키 | 내용 | 쓰는 사람 | 읽는 사람 |
|---|---|---|---|
| `settings` | 사용자 설정 | 김민지 | 전원 |
| `timer` | 업무 타이머 상태 (형식은 타이머 구현 때 정함) | 김민지 | 김민지 |
| `lastPart` | 직전에 한 부위 (`neck` / `shoulder` / `wrist` / `waist`) | 김민지 | 김원규 |
| `routineLogs` | 루틴 기록 배열 | 이주연 | 이주연, 김원규 |
| `badges` | 배지 상태 | 이주연 | 이주연 |

### 설정 (`settings`)

```js
{ onboarded: false, intervalMin: 60, soundOn: false }
```

- `onboarded`: 온보딩을 마쳤는지. `intervalMin`: 알림 주기(분). `soundOn`: 소리 ON/OFF (기본은 꺼짐, 사무실을 고려)
- 읽기: `const [settings, updateSettings] = useSettings()` (`src/lib/settings.js`). 소리 설정이 필요한 영상·음성 기능(서진수)은 `settings.soundOn`을 쓴다.
- 알림 허용 여부는 저장하지 않고 브라우저의 `Notification.permission`에서 바로 읽는다.

## 6. 루틴 기록 형식 (`routineLogs`) — 제안

이주연 님의 배지 설계안(9-1)을 기준으로 하고, 김원규 님이 요청한 항목(`parts`, `breathCount`)을 더했다. **김원규 님과 이주연 님이 합의하면 바꿀 수 있다.**

```js
{
  id: 'r_1732339200000',          // 중복 저장 방지용 고유값
  parts: ['neck'],                // 이번 루틴의 부위 (원규 님 방식이면 1개)
  moves: ['neck-01', 'neck-02', 'neck-03'], // 동작 ID. "부위-번호" 형식으로 통일 (neck_tilt 같은 이름은 쓰지 않는다)
  breathCount: 5,                 // 마친 호흡 횟수
  startedAt: '2026-11-24T13:05:10',   // nowLocalISO()로 만든다
  completedAt: '2026-11-24T13:05:50',
  completed: true,                // 루틴 인정 기준을 채웠는지
  skippedMoves: 0,                // 넘긴 동작 수 (정의 필요, 아래 7번)
  fromNotification: true,         // 알림을 눌러 시작했는지 (주소의 from=notification)
  notifiedAt: '2026-11-24T13:04:50' // 알림이 뜬 시각. 알림 없이 시작했으면 null (김민지가 기록)
}
```

- 시각은 `src/lib/time.js`의 `nowLocalISO()`로 만든다. `toISOString()`은 9시간 어긋나서 시간대 배지와 "하루" 계산이 틀어진다.
- 루틴이 끝나면 김원규 님의 화면이 이 기록을 만들어 이주연 님의 기록 저장·배지 지급 함수에 넘긴다. 함수 이름과 완료 화면에 결과를 넘기는 방식은 두 분이 정한다. (이 뼈대에는 만들지 않았다)

## 7. 팀 합의가 필요한 것

| 항목 | 상태 | 메모 |
|---|---|---|
| 한 번의 루틴 동작 수 | **3개로 확정** | `config.js`의 `ROUTINE_MOVE_COUNT` |
| 동작 선정 방식 | 미확정 | 김원규 님 문서는 "한 부위의 동작 3개(직전 부위 연속 금지)", 이주연 님 문서는 "12개 풀에서 랜덤 3개" |
| 루틴 인정 기준에 호흡 5회 포함 여부 | 미확정 | 김원규 님 흐름은 호흡까지, 이주연 님 정의는 동작 3개 완료 |
| 호흡 1회의 길이 | 미확정 | 루틴 전체 시간에 가장 큰 영향 |
| 알림 후 큰 "시작" 버튼 첫 단계 | **제안** (김원규 님이 의견 수렴 중) | `config.js`의 `START_GATE_ENABLED`로 켜고 끈다. 알림 클릭 때만 보여주는 것을 제안 |
| "넘기기" 정의 | 미확정 | 버튼이 "다음"뿐이라, "5초 카운트가 끝나기 전에 다음을 누르면 넘기기"로 볼지 정해야 `skippedMoves`·"스킵은 사치" 배지를 계산할 수 있다 |
| 시연 모드 | 제안 (이주연 님) | 설계안은 `?demo=1`인데, 화면 이동이 `#`를 쓰므로 주소는 `사이트/?demo=1#/`가 된다. 읽을 때는 `location.search`를 본다 |
| "이전 동작" 버튼 | **없음으로 확정** | 김민지 결정. 김원규 님 설계에 있었던 이전 버튼은 뺀다 |

## 8. 공통 설정값 (`src/lib/config.js`)

`ROUTINE_MOVE_COUNT`(3), `MOVE_SECONDS`(5), `BREATH_COUNT`(5), `START_GATE_ENABLED`, `DEFAULT_INTERVAL_MIN`(60), `PARTS`, `STORAGE_KEYS`, `DEFAULT_SETTINGS`. 값을 바꿀 때는 팀에 먼저 알린다.

## 9. 디자인 기준

모바일을 기준으로 만들고, PC에서는 가운데에 좁은 화면(최대 480px)으로 보여준다. 분위기는 차분하고 편안한 명상·스트레칭 앱이다. 값은 `src/index.css`에 있고, 화면 CSS에서는 `var(--이름)`으로 가져다 쓴다.

| 구분 | 이름 | 용도 |
|---|---|---|
| 색 | `--color-primary` / `--color-primary-strong` / `--color-primary-soft` | 주요 버튼과 강조 / 눌렀을 때 / 연한 배경 |
| 색 | `--color-calm`, `--color-calm-soft` | 빡침 명상 등 진정 화면 |
| 색 | `--color-alert`, `--color-alert-soft` | 빡침 버튼, 주의 |
| 색 | `--color-text`, `--color-text-muted`, `--color-border`, `--color-bg`, `--color-surface` | 글자, 보조 글자, 테두리, 배경, 카드 |
| 글자 | `--text-title`, `--text-large`, `--text-body`, `--text-small` | 크기 (글꼴은 Pretendard가 있으면 쓰고, 없으면 기본 한글 글꼴) |
| 여백 | `--space-1` ~ `--space-6` | 4px 단위 |
| 모양 | `--radius-md`, `--radius-lg`, `--radius-round`, `--shadow-card`, `--tap-size` | 모서리, 그림자, 손가락 버튼 최소 높이(48px) |

- 공통 부품: `src/components/Screen.jsx`(화면 틀), `src/components/Button.jsx`(버튼: `primary`, `soft`, `ghost`, `alert`, 크기 `large`, `round`)
- 화면에는 `<Screen title="…">`을 쓰면 제목과 여백이 맞는다.
- 이 색과 분위기는 노션 아이디어 덤프의 디자인 방향을 바탕으로 한 초안이다. 배지 아이콘, 3D 캐릭터와 어울리는 색 조정은 2차에서 다듬는다.
- 소리를 쓰는 기능은 `settings.soundOn`을 따른다. 사무실에서 갑자기 소리가 나지 않도록 기본은 꺼짐이다.
