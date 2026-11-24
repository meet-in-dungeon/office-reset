# 팀원별 AI 프롬프트

Claude Code나 Codex를 열 때 복사해서 붙여 넣는 문장이다. 규칙은 [AGENTS.md](../AGENTS.md)와 [TEAM_RULES.md](TEAM_RULES.md)가 기준이고, 이 문서는 그 규칙을 AI에게 전달하는 방법이다.
담당 파일과 작업 단위는 [WORK_UNITS.md](../WORK_UNITS.md) 4번 표가 기준이다. 표가 바뀌면 이 문서의 "담당 파일"도 같이 고친다.

## 쓰는 순서

1. 새 대화를 시작할 때 **1. 공통 시작 프롬프트** 뒤에 **2. 내 프롬프트**를 이어 붙여 한 번에 보낸다.
2. 작업 중에 상황에 맞게 **3. 상황별 프롬프트**를 쓴다.
3. 작업이 끝나면 **4. 끝났을 때 프롬프트**로 점검하고 PR을 올린다.

AI는 이 저장소의 `AGENTS.md`를 자동으로 읽는다. 단, 내 컴퓨터에 최신 `main`이 합쳐져 있어야 최신 규칙을 읽는다. 시작 전에 `git switch main`, `git pull`, 내 브랜치에서 `git merge main`을 한다.

## 1. 공통 시작 프롬프트 (모두)

```text
AGENTS.md, docs/TEAM_RULES.md, docs/ARCHITECTURE.md, WORK_UNITS.md, src/mocks/README.md를 먼저 읽어 줘.
읽고 나서 다음을 쉬운 말로 알려 줘.
1) 현재 브랜치와 git status
2) 내 작업 단위와 수정해도 되는 파일
3) 오늘 이 브랜치에서 할 작업 순서
작업 규칙:
- 내 담당 파일 안에서만 수정해 줘. 다른 사람 파일과 공통 파일은 고치기 전에 이유를 말하고 내 허락을 받아 줘.
- 커밋과 push는 작게 자주 해도 되지만, PR은 내가 "작업 끝났다"고 말하기 전에는 만들거나 제안하지 마.
- PR 대신 내 브랜치에 push까지만 안내해 줘.
- 상대 기능이 아직 없으면 기다리지 말고 src/mocks/ 의 샘플 데이터(README.md 방법)로 테스트해 줘. 필요한 샘플이 없으면 ARCHITECTURE.md의 데이터 형식대로 src/mocks/에 새로 만들어 줘. 목업은 앱 코드에서 import하지 마.
- 새 라이브러리 설치와 package.json 수정은 하지 마.
- main에 직접 push하거나 병합하지 마.
```

## 2. 내 프롬프트

### 김민지 — 공통 뼈대, 메인, 온보딩, 알림

```text
내 이름은 김민지, 역할은 팀장이고 공통 뼈대·메인 화면·온보딩·알림을 맡았어.
내 담당 파일: src/pages/Main.jsx, Onboarding.jsx, src/components/*, src/lib/alerts.js, alertTimes.js, schedule.js, settings.js, router.js, storage.js, config.js.
공통 파일(App.jsx, App.css, config.js)은 내 기능에 꼭 필요한 줄만 고치고, 고칠 때마다 알려 줘. 나중에 PR 설명의 "공통 파일 변경" 칸에 적어야 해.
다른 사람의 파일(Stretch.jsx, Complete.jsx, Stats.jsx, Calm.jsx, records.js, badges.js, StretchVideo.jsx)은 고치지 말고 문제가 보이면 담당자에게 전달할 문장만 써 줘.
내가 쓰는 저장소 키는 settings와 timer야. 형식을 바꾸려면 먼저 ARCHITECTURE.md를 어떻게 고칠지 보여 줘.
알림 설정과 발송 규칙은 docs/ALERT_RULES.md가 기준이야. 알림 관련 코드를 고칠 때는 이 문서의 1~2번 규칙과 4번 계산 예시를 테스트 값으로 써 줘. 문서와 코드가 다르면 임의로 정하지 말고 어느 쪽이 맞는지 나에게 물어봐 줘.
```

### 김원규 — 스트레칭 루틴 화면

```text
내 이름은 김원규, 스트레칭 루틴 화면을 맡았어.
내 담당 파일: src/pages/Stretch.jsx, Stretch.css, src/data/stretches.json, src/lib/pickMoves.js. 이 파일 밖은 고치지 마.
다른 사람 기능과 연결하는 방법:
- 영상: 서진수 님의 StretchVideo 컴포넌트를 영상 자리(stretch-video-slot)에 끼우는 한 줄은 서진수 님이 맡았어. 내가 건드리지 마.
- 기록: 루틴이 끝나면 ARCHITECTURE.md 6번 형식의 log를 만들어 이주연 님의 recordRoutine(log)를 한 번만 불러야 해. 이주연 님의 PR이 아직 main에 없으면 recordRoutine이 없으니, 지금은 만든 log를 콘솔에 찍어서 형식만 확인하고, 실제 연결은 그 PR이 병합된 뒤에 하자. (src/mocks/routineLogs.sample.json이 올바른 log 형식의 예시야)
- 알림: 알림으로 들어왔는지는 주소의 from=notification, 알림 시각은 getLastNotifiedAt()으로 읽어. 알림 없이 테스트하려면 src/mocks/timer.sample.json을 저장소에 넣어서 확인해.
- 마지막 루틴인지는 isLastRoutine()으로 알 수 있어. 내가 만든 임시 ?last=1은 이걸로 바꿔 줘.
```

### 서진수 — 영상 재생, 음성, 배포

```text
내 이름은 서진수, 스트레칭 영상 재생·음성 안내·배포를 맡았어.
내 담당 파일: src/components/StretchVideo.jsx, StretchVideo.css, src/lib/voice.js, public/videos/, src/video-test/, video-test.html.
Stretch.jsx는 김원규 님 파일이야. 내 컴포넌트를 쓰는 연결은 한 줄이면 되게 만들어 줘:
<StretchVideo key={move.id} file={move.videoFile} name={move.name} />
이 사용법이 StretchVideo.jsx 맨 위 주석에 항상 정확히 적혀 있게 해 줘. 연결은 김원규 님의 PR이 main에 병합된 뒤, 그 영상 자리 한 줄만 고칠 거야.
소리는 settings.soundOn을 따라야 해(기본 꺼짐). 영상 파일 이름은 stretches.json의 동작 ID와 같아야 해(예: neck-01.mp4).
배포 설정(vite.config.js, package.json 등 공통 파일)은 바꾸기 전에 어떤 영향이 있는지 먼저 설명해 줘.
영상 파일은 용량이 크니 커밋 전에 크기를 알려 줘.
```

### 이주연 — 기록, 배지, 완료·통계·빡침 화면

```text
내 이름은 이주연, 루틴 기록·배지·완료 화면·통계 화면·빡침 명상 화면을 맡았어.
내 담당 파일: src/lib/records.js, badges.js, src/pages/Complete.jsx, Stats.jsx, Calm.jsx와 각 .css. 이 밖은 고치지 마.
내가 쓰는 저장소 키는 routineLogs, badges, calmLogs야. 루틴 기록 형식은 ARCHITECTURE.md 6번을 따르고, 바꾸려면 김원규 님과 합의가 필요하니 먼저 어떻게 바꿀지 보여 줘.
김원규 님의 Stretch.jsx가 아직 main에 없거나 기록을 안 만들어도 기다리지 말고, src/mocks/README.md 방법으로 routineLogs.sample.json과 badges.sample.json을 localStorage에 넣어서 완료·통계 화면을 테스트해 줘. (이미 만들어져 있어. 앱 코드에서는 불러오지 마.) 테스트가 끝나면 README의 "지우는 방법"으로 정리해 줘.
빡침 명상 기록(calmLogs) 형식은 내가 정할 거야. 정해지면 src/mocks/calmLogs.sample.json을 추가하고 README 표에 한 줄 넣어 줘.
빡침 명상 호흡 속도는 config.js의 BREATH_INHALE_SECONDS, BREATH_EXHALE_SECONDS를 쓰고 값은 바꾸지 마.
```

## 3. 상황별 프롬프트

**상대 기능이 없어서 막혔을 때 (목업)**

```text
상대 기능이 아직 main에 없어서 내 화면을 테스트할 수 없어. src/mocks/README.md를 읽고, 이미 있는 샘플(routineLogs, badges, timer)로 테스트해 줘. 필요한 샘플이 없으면 ARCHITECTURE.md의 데이터 형식 그대로 src/mocks/에 새로 만들고 README 표에 한 줄 추가해 줘. 앱 코드는 바꾸지 마. 테스트가 끝나면 목업으로 확인했다는 점, 목업을 지운 방법, 실제 연결 시 확인할 점을 알려 줘.
```

**PR을 올린 뒤 다음 작업을 시작할 때**

```text
내 PR은 리뷰 대기 중이야. 그 브랜치에는 더 이상 커밋하지 말고, 지금 브랜치에서 새 브랜치(feature/다음-작업-이름)를 만들어서 WORK_UNITS.md의 내 다음 작업 단위를 시작해 줘. 새 브랜치를 만들기 전에 git status와 어떤 브랜치에서 따는지 알려 줘.
```

**앞 PR이 병합되었을 때**

```text
내 앞 PR이 main에 병합됐어. 안전하게 최신 main을 지금 브랜치에 합쳐 줘. 합치기 전에 git status로 미커밋 변경 사항이 없는지 확인하고, 충돌이 나면 양쪽 내용을 보여 주고 어떻게 풀지 설명한 뒤 내 확인을 받아 줘. 임의로 한쪽을 지우지 마.
```

**다른 사람 파일을 고쳐야 할 것 같을 때**

```text
내 담당이 아닌 파일 <파일 이름>을 고쳐야 할 것 같아. 직접 고치지 말고, 왜 필요한지와 어떤 줄을 어떻게 바꿔야 하는지, 담당자에게 단톡방에 보낼 문장을 써 줘.
```

## 4. 끝났을 때 프롬프트 (PR 직전)

내가 "작업 끝났다"고 판단했을 때만 쓴다. 작업이 덜 끝났으면 push만 한다.

```text
작업 단위를 마무리하려고 해. 아래를 확인하고 결과를 표로 알려 줘.
1) WORK_UNITS.md 4번 표에서 내 작업 단위의 완료 기준을 모두 채웠는지
2) npm run build, npm run lint 실행 결과
3) git diff main...HEAD 기준으로 내 담당 파일 밖에서 바뀐 파일이 있는지 (공통 파일이면 PR 설명의 "공통 파일 변경" 칸에 적을 문장도)
4) package.json, 새 라이브러리, 비밀 값이 들어가지 않았는지
5) 내가 브라우저에서 직접 확인해야 할 항목과 방법 (실제로 테스트하지 못한 것은 정상이라고 말하지 마)
6) 코드와 함께 고쳐야 할 문서가 있으면 같은 커밋에 포함
모두 괜찮으면 push까지 하고, PR 제목과 PR 본문(.github/pull_request_template.md 형식) 초안을 써 줘. PR은 내가 확인한 뒤 만들게.
```

## 5. 리뷰 당번일 때 쓰는 프롬프트

리뷰 당번(WORK_UNITS.md 4-1번)이 리뷰 시간(14:30, 17:00)에 쓴다. 쌓인 PR을 한 번에 본다. 당번이 아닌 날에는 리뷰를 하지 않는다.

```text
오늘 내가 리뷰 당번이야. 열려 있는 PR 목록(gh pr list)을 보고, 내 PR이 아닌 것들을 하나씩 리뷰해 줘.
TEAM_RULES.md 3번의 4가지만 확인하면 돼.
1) 빌드 성공 2) 담당 파일 밖·공통 파일 변경과 그 이유 3) 새 라이브러리·비밀 값 4) 해당 화면이 열리는지
PR마다 "막아야 할 것"과 "댓글로만 남길 것"을 나눠서 알려 주고, 승인해도 되는지 의견을 줘.
승인과 병합은 하지 말고, 내가 GitHub에서 직접 누를 수 있게 확인 방법을 알려 줘.
```

아래는 PR 하나만 볼 때 쓰는 짧은 버전이다.

```text
이 PR(번호: <번호>)을 리뷰해 줘. TEAM_RULES.md 3번의 4가지만 확인하면 돼.
1) 빌드 성공 2) 담당 파일 밖·공통 파일 변경과 그 이유 3) 새 라이브러리·비밀 값 4) 해당 화면이 열리는지
문제가 있으면 "막아야 할 것"과 "댓글로만 남길 것"을 나눠서 알려 줘. 병합은 하지 말고, 내가 확인할 방법을 알려 줘.
```
