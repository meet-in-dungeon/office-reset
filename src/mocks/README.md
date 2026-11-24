# 목업(가짜) 데이터

상대 기능이 아직 `main`에 없을 때, **내 브라우저의 저장소(`localStorage`)에 샘플 데이터를 넣어서** 내 화면을 테스트하는 파일들이다.
앱 코드(`src/pages`, `src/lib` 등)는 바꾸지 않는다. 이 폴더의 파일을 **앱 코드에서 `import` 하지 않는다.** 실제 기능이 합쳐지면 목업 없이도 동작해야 한다.

관련 규칙: [docs/TEAM_RULES.md](../../docs/TEAM_RULES.md) 6번

## 들어 있는 파일

| 파일 | 저장소 키 | 내용 | 주로 쓰는 사람 |
|---|---|---|---|
| `routineLogs.sample.json` | `routineLogs` | 루틴 기록 3건 (일반 2건, 하루 마지막 루틴 1건) | 이주연(완료·통계 화면 테스트) |
| `badges.sample.json` | `badges` | 위 기록으로 계산된 배지 상태 (`first_routine`, `daily_full`) | 이주연 |
| `timer.sample.json` | `timer` | 마지막으로 알림이 뜬 시각 | 김원규(알림으로 들어온 기록 테스트) |

- 형식의 기준은 [docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md) 5, 6번이다. 형식이 바뀌면 ARCHITECTURE.md를 먼저 고치고 이 파일도 같이 고친다.
- `calmLogs`(빡침 명상 기록)는 형식이 아직 정해지지 않아 샘플이 없다. 이주연 님이 형식을 정하면 `calmLogs.sample.json`을 추가한다.
- 샘플 날짜는 `2026-11-24`로 적혀 있다. 아래 넣기 코드는 이 날짜를 **오늘 날짜로 바꿔서** 저장하므로 "오늘 완료" 화면도 테스트할 수 있다.

## 넣는 방법

1. `npm run dev`로 개발 서버를 켜고 브라우저에서 앱을 연다.
2. 개발자 도구(F12) → **Console** 탭에 아래 코드를 붙여 넣고 Enter. 넣고 싶은 키만 골라 써도 된다.
3. 페이지를 새로고침한다.

```js
// 기록·배지·알림 상태를 한 번에 넣는다 (내 브라우저의 같은 키 값은 덮어쓴다)
const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10)
const load = async (key, file) => {
  const text = await (await fetch(`/src/mocks/${file}`)).text()
  localStorage.setItem(key, JSON.stringify(JSON.parse(text.replaceAll('2026-11-24', today))))
}
await load('routineLogs', 'routineLogs.sample.json')
await load('badges', 'badges.sample.json')
await load('timer', 'timer.sample.json')
```

## 지우는 방법

```js
['routineLogs', 'badges', 'timer'].forEach((key) => localStorage.removeItem(key))
sessionStorage.removeItem('lastRoutineResult')
```

실제 기능을 이어 붙여 테스트하기 전에는 꼭 지운다. 목업 기록이 남아 있으면 "하루 완성" 같은 판정이 실제와 다르게 보인다.

## 새 목업을 추가할 때

- 파일 이름은 `저장소키.sample.json`으로 한다.
- 샘플은 최소한으로 둔다. (정상 1건, 경계 사례 1~2건)
- 만든 사람은 이 README의 표에 한 줄을 추가하고, PR 설명 "확인 방법"에 "목업으로 테스트했다"고 적는다.
- 목업은 내 브라우저에서만 쓰는 값이다. 비밀 값이나 개인정보를 넣지 않는다.
