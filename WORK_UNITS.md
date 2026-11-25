# WORK_UNITS: 업무 분담과 작업 단위

> 상태: **초안 3** (2026-11-24, PR 최소화 규칙과 작업 단위 표 반영).
> 실제 담당은 4번 작업 단위 표와 [docs/reference/WORK_ASSIGNMENT.md](docs/reference/WORK_ASSIGNMENT.md)가 기준이다. 3번의 역할 A~D 표기는 쓰지 않는다. (제안, 팀 확인 필요)

## 1. 팀
| 이름 | 역할 | GitHub 계정 |
|---|---|---|
| 김민지 | 팀장 | k-im-rose |
| 김원규 | 팀원 | kwkworks |
| 서진수 | 팀원 | jsseo0420 |
| 이주연 | 팀원 | agogdim99-ux |

GitHub 계정 연결은 팀장이 확인했다. (2026-11-24)

## 2. 사전 작업 (먼저 진행)
최종 개발 업무 전에 진행하는 5건이다.

| # | 사전 작업 | 담당 | 상태 |
|---|---|---|---|
| 1 | 스트레칭 콘텐츠 조사 및 선정 | 미정 | 미시작 |
| 2 | 배지 획득 규칙 설계 | 미정 | 미시작 |
| 3 | 3D 캐릭터 영상 제작 기술 검증 | 미정 | 미시작 |
| 4 | 타이머 및 브라우저 알림 기술 검증 | 김민지 | 진행 전 |
| 5 | GitHub 협업 환경 준비 | 김민지 | 완료 단계 |

- 1번의 목표: 목, 어깨, 손목, 허리 4개 부위, 부위별 3개 동작을 우선 조사한다.
- 담당이 "미정"인 작업은 정해지면 이 표를 고친다.

## 3. 최종 개발 역할 (A~D): 확정 필요
회의록에 정리된 역할 틀이다. 담당자는 **별도 확정이 필요하다.**

| 역할 | 담당 영역 (회의록) | 담당자 |
|---|---|---|
| A | 서비스 기획 및 디자인 | 미배정 |
| B | 서비스 기능 개발 | 미배정 |
| C | 콘텐츠 및 루틴 개발 | 미배정 |
| D | AI 및 기술 통합 | 미배정 |

웹캠 자세 인식이 MVP에서 제외되었으므로 D 역할의 범위는 배정할 때 다시 정한다.

## 4. 작업 단위
**PR은 이 표의 한 줄이 끝났을 때 한 번 올린다.** 중간 저장은 PR 없이 push만 한다. ([docs/TEAM_RULES.md](docs/TEAM_RULES.md) 2번) 담당 파일은 이 표가 기준이며, 파일 하나에는 담당자 한 명만 둔다.
상태 기준일: 2026-11-24 오후. (GitHub PR 상태를 확인해 적었다)

| 작업 단위 | 담당 | 브랜치 | 수정해도 되는 파일 | 완료 기준 | 상태 |
|---|---|---|---|---|---|
| 공통 뼈대·메인·온보딩 | 김민지 | (병합 완료) | `src/pages/Main.jsx`, `Onboarding.jsx`, `src/components/*`, `src/lib/router.js`, `storage.js`, `config.js` | 화면 6개 이동, 디자인 기준 | 완료 (#5) |
| 알림 일정·발송 | 김민지 | `feature/timer-notification` | `src/lib/alerts.js`, `alertTimes.js`, `schedule.js`, `settings.js`, `src/components/AlertBanner.jsx`, `NotificationPermission.jsx`, `WorkTimeSettings.jsx` (공통 `App.jsx`, `config.js`는 필요한 줄만) | 정해진 시각에 알림이 뜨고, 누르면 `#/stretch?from=notification`으로 이동 | PR #8 리뷰 대기 |
| 알림 규칙 반영 | 김민지 | 미정 (#8 브랜치에서 새로 만든다) | `src/lib/alertTimes.js`, `settings.js`, `schedule.js`, `alerts.js`, `src/components/WorkTimeSettings.jsx` (공통 `config.js`는 필요한 줄만) | [docs/ALERT_RULES.md](docs/ALERT_RULES.md) 5번 순서대로: ① 주기 30분/1시간/2시간 ② 주말 알림 없음 ③ (시간이 남으면) 오후 2~4시 추가 알림 | 미시작 (#8 병합 후) |
| 스트레칭 루틴 화면 | 김원규 | `feature/stretch-routine` | `src/pages/Stretch.jsx`, `Stretch.css`, `src/data/stretches.json`, `src/lib/pickMoves.js` | 영상 없이도 동작 3개 → (마지막 루틴이면 호흡 5회) → 완료 | PR #7 리뷰 대기 |
| 루틴 완료 → 기록 연결 | 김원규 | 미정 | `src/pages/Stretch.jsx` | 루틴이 끝나면 `recordRoutine(log)`를 한 번 부른다 | 시작 가능 (주연 #9가 병합됨. 단 #7이 먼저 병합되어야 같은 파일을 이어서 고칠 수 있다) |
| 영상 재생·음성·BGM | 서진수 | `feature/voice-move-name` | `src/components/StretchVideo.jsx`, `StretchVideo.css`, `src/lib/voice.js`, `src/lib/bgm.js`, `public/videos/`, `public/audio/`, `src/video-test/`, `video-test.html` | 영상이 재생되고 없으면 대체 안내, 소리 설정 반영. 음성은 동작 이름만 읽는다(카운트다운 음성 제거). BGM은 스트레칭(동작·호흡 단계)과 빡침 명상 화면에서 작게 반복 재생. 영상 한 바퀴(`onLoop`)·음성 읽기 끝(`onEnd`) 선택 신호 | PR 리뷰 대기 (#11, #15, #18 병합. 이번 PR: 동작 이름 읽기 사용법, `onLoop`·`onEnd` 추가) |
| 영상 자리 연결 | 서진수 | (병합 완료) | `src/pages/Stretch.jsx`의 영상 자리(`stretch-video-slot`) **한 줄만** | 루틴 화면에서 영상이 나온다 | 완료 (영상은 #7, 스트레칭 BGM 연결은 #16, 빡침 명상 BGM 연결은 #20에 포함. 동작 이름 읽기와 `onLoop`·`onEnd` 사용은 김원규 님이 `Stretch.jsx`에서 한다) |
| 기록·배지 판정 | 이주연 | `feature/badge-records` | `src/lib/records.js`, `badges.js` | `recordRoutine`으로 기록 저장, 배지 3종 판정, 중복 지급 방지 | 완료 (#9 병합) |
| 완료·통계·빡침 화면 | 이주연 | `feature/complete-screen` | `src/pages/Complete.jsx`, `Stats.jsx`, `Calm.jsx`와 각 `.css` | 완료 화면에 배지 표시, 통계 유지, 빡침 화면 진입·복귀 | 작업 중 (push됨, PR 전) |
| 배포 | 서진수 | `chore/deploy` | 배포 설정 (공통 파일이라 팀 합의 후) | HTTPS 주소에서 작동 | 완료 (2026-11-25, Vercel). 주소: https://office-reset-seven.vercel.app . `main`에 병합되면 자동으로 다시 배포된다. 공통 파일(`vite.config.js`, `package.json` 등)은 바꾸지 않았다 |

## 4-1. 리뷰 당번표 (당번 배정은 제안, 팀 확인 필요)
그날 올라온 PR을 당번 한 명이 모아서 승인한다. 리뷰어를 PR마다 고르지 않는다. 당번이 아닌 사람은 리뷰 요청을 받지 않는다.

| 날짜 | 당번 | 당번의 PR을 보는 사람 | 비고 |
|---|---|---|---|
| 11/24(화) | 김민지 | 이주연 | 이미 #7 리뷰를 요청받음. 주연 님은 #8(민지 PR) 담당 |
| 11/25(수) | 이주연 | 김민지 | 최종 병합일. 통합 테스트 담당이 전체 PR을 훑고, 팀장이 최종 병합을 확인 |
| 11/26(목) | 없음 | | 10:00 제출 마감 전에는 새 PR을 올리지 않는다 |

- **리뷰 시간**(PR 승인): 14:30, 17:00. 중간 점검(진행 공유): 14:00, 17:30. 두 시간은 다르다. ([docs/TEAM_RULES.md](docs/TEAM_RULES.md) 3번)
- 다른 사람이 PR 때문에 막혀 있으면 리뷰 시간을 기다리지 않고 당번이 바로 본다.
- 일정이 바뀌면 당번표를 고치고 단톡방에 알린다.

## 5. 일정 (노션 기준)
| 날짜 | 할 일 | 끝났을 때 상태 |
|---|---|---|
| 11/23(월) | POC → MVP, 본격 개발 | 핵심 흐름 하나가 처음부터 끝까지 동작 |
| 11/24(화) | 기능 개발, 디버깅 | 중간 점검: 완료·미완료·막힌 점 공유, 범위 정리 |
| 11/25(수) | 최종 merge, 발표 자료 준비 | 기능 범위 고정, 최종 점검표 확인 |
| 11/26(목) | 10:00 제출 마감, 14:00 입장, 14:30 온라인 발표 | |

테스트, 발표, 제출의 최종 책임자는 아직 지정되지 않았다.

## 6. 작성 규칙
- 한 사람이 한 작업 단위의 화면과 로직을 함께 맡는다.
- 수정 가능한 파일 범위를 적는다. 범위 밖 파일은 담당자와 상의한다.
- 작업 단위가 끝나서 PR을 올리면 상태를 "PR #번호 리뷰 대기"로, 병합되면 "완료"로 고친다. (이 표를 고치는 것은 해당 작업의 PR에 함께 넣는다)
- 공통 파일 변경은 [docs/TEAM_RULES.md](docs/TEAM_RULES.md)의 규칙을 따른다.
- 이 문서를 바꾼 뒤에는 실시간 전달 사항에 한 줄 남긴다.
