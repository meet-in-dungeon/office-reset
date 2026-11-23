# office-reset

사무실 직장인을 위한 스트레칭·호흡 루틴 웹 서비스다. 던만 해커톤 팀 프로젝트이며, 모바일 화면을 먼저 만들고 PC에서도 쓸 수 있게 한다.

- 기술: React + Vite (JavaScript)
- 팀: meet-in-dungeon (4명)

## 1. 처음 한 번만 준비하기

필요한 프로그램은 세 가지다.

| 프로그램 | 확인 명령어 | 설치 |
|---|---|---|
| Git | `git --version` | https://git-scm.com |
| Node.js 24 이상 | `node -v` | https://nodejs.org (LTS) |
| GitHub CLI (선택) | `gh --version` | https://cli.github.com |

GitHub 계정이 `meet-in-dungeon` 조직에 초대되어 있어야 한다. 초대 메일을 수락했는지 확인한다.

## 2. 저장소 가져오기 (Clone)

```bash
git clone https://github.com/meet-in-dungeon/office-reset.git
cd office-reset
```

처음 push 할 때 로그인 창이 뜨면 GitHub 계정으로 로그인한다.

## 3. 설치와 실행

```bash
npm install     # 필요한 라이브러리 설치 (처음 한 번, 의존성이 바뀌면 다시)
npm run dev     # 개발 서버 실행
```

터미널에 나온 주소(보통 http://localhost:5173)를 브라우저로 연다. 폰에서 보려면 `npm run dev -- --host`로 실행하고, 같은 와이파이에서 터미널에 나온 Network 주소로 접속한다.

| 명령어 | 하는 일 |
|---|---|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 배포용 빌드. PR 올리기 전에 에러가 없는지 확인한다 |
| `npm run lint` | 코드 검사 |

환경 변수가 필요하면 `cp .env.example .env` 후 값을 채운다. `.env`는 GitHub에 올라가지 않는다.

## 4. 폴더 구조

```
src/
  components/   여러 화면에서 쓰는 작은 부품
  pages/        화면 단위 파일
  lib/          공통 함수
  App.jsx       화면 연결
  main.jsx      시작점
docs/           협업 규칙 문서
```

## 5. 협업 흐름 (요약)

1. `main`을 최신으로 받는다.
2. 내 브랜치를 만든다. 예: `feature/stretch-timer`
3. 개발하고 커밋한다.
4. GitHub에 push 한다.
5. Pull Request(PR)를 만든다.
6. 팀원 1명 이상이 확인(승인)한다.
7. 문제가 없으면 `main`에 병합한다.

자세한 방법은 [CONTRIBUTING.md](CONTRIBUTING.md), 팀 약속은 [docs/TEAM_RULES.md](docs/TEAM_RULES.md)를 본다.

## 6. AI로 개발할 때 (Claude Code)

이 저장소 폴더에서 Claude Code를 실행하면 `CLAUDE.md`가 `AGENTS.md`를 불러와 공통 규칙이 자동으로 적용된다. 규칙 파일은 따로 내려받지 않는다.

## 7. 개발 문서

- [PRD.md](PRD.md): 서비스 기획과 요구사항
- [TECH_SPEC.md](TECH_SPEC.md): 기술 스택과 구현 방식
- [WORK_UNITS.md](WORK_UNITS.md): 업무 분담과 작업 단위

아직 확정되지 않은 항목은 `미확정`으로 표시되어 있다. 팀 합의 후 채운다.
