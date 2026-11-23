# 기여 방법 (처음 쓰는 사람용)

용어부터 정리한다.

- **브랜치**: 내 작업용 복사본 줄기다. 여기서 마음껏 고쳐도 `main`은 안전하다.
- **커밋**: 변경 내용을 저장하는 단위다.
- **Push**: 내 컴퓨터의 커밋을 GitHub에 올리는 일이다.
- **Pull Request(PR)**: "내 브랜치를 main에 합쳐 달라"는 요청이다. 팀원이 확인한 뒤 합친다.

## 1. 브랜치 만들기

작업을 시작하기 전에 항상 `main`을 최신으로 만든 뒤 브랜치를 만든다.

```bash
git switch main
git pull
git switch -c feature/stretch-timer
```

브랜치 이름 규칙:

| 종류 | 형식 | 예시 |
|---|---|---|
| 새 기능 | `feature/기능명` | `feature/breathing-guide` |
| 오류 수정 | `fix/수정명` | `fix/timer-reset` |
| 환경·유지보수 | `chore/작업명` | `chore/add-icons` |

영어 소문자와 하이픈(`-`)만 쓴다. `main`에서 직접 작업하지 않는다.

## 2. 커밋하고 Push 하기

```bash
git status                    # 바뀐 파일 확인
git add src/pages/Timer.jsx   # 올릴 파일 지정 (파일을 직접 적는 것을 권장)
git commit -m "feat: 스트레칭 타이머 화면 추가"
git push -u origin feature/stretch-timer   # 처음 push 할 때만 -u 사용, 이후엔 git push
```

커밋 메시지는 `종류: 내용` 형식으로 쓴다. 종류는 `feat`(기능), `fix`(수정), `chore`(설정), `docs`(문서)를 쓴다.

`git add .` 는 `.env` 같은 파일을 실수로 올릴 수 있으니 `git status`를 보고 쓴다.

## 3. Pull Request 만들기

1. push 후 터미널에 나오는 링크를 열거나, GitHub 저장소 페이지의 **Compare & pull request** 버튼을 누른다.
2. 템플릿에 맞춰 제목과 내용을 쓴다. 제목 예: `feat: 스트레칭 타이머 화면 추가`
3. 오른쪽 **Reviewers**에서 팀원 1명을 지정한다.
4. **Create pull request**를 누른다.

PR은 작게 만든다. 한 PR에 기능 하나만 담는다.

## 4. 다른 사람 코드 확인하기 (리뷰)

1. PR의 **Files changed** 탭에서 바뀐 코드를 본다.
2. 이상한 부분은 줄 옆 `+` 버튼으로 댓글을 단다.
3. 괜찮으면 **Review changes → Approve**를 누른다.
4. 승인을 받으면 PR 작성자가 **Merge pull request**를 누른다.

급해도 내 PR은 내가 승인하지 않는다.

## 5. 최신 상태로 가져오기

다른 팀원의 작업이 `main`에 합쳐졌다면 내 브랜치에도 반영한다. 하루 시작할 때와 PR 올리기 전에 한다.

```bash
git switch main
git pull
git switch feature/stretch-timer
git merge main
```

## 6. 충돌이 났을 때

같은 파일의 같은 부분을 두 사람이 고치면 충돌(conflict)이 난다. 당황하지 않아도 된다.

1. `git merge main` 후 "CONFLICT"가 나오면 `git status`로 충돌 파일을 확인한다.
2. 파일을 열면 아래처럼 표시되어 있다.
   ```
   <<<<<<< HEAD
   내가 쓴 코드
   =======
   상대가 쓴 코드
   >>>>>>> main
   ```
3. 어느 쪽을 남길지(또는 둘을 합칠지) 정하고 `<<<<<<<`, `=======`, `>>>>>>>` 줄을 모두 지운다. 누구 코드인지 모르겠으면 그 코드를 쓴 팀원에게 물어본다.
4. 저장한 뒤 아래 명령을 실행한다.
   ```bash
   git add 충돌났던_파일
   git commit
   npm run build    # 잘 되는지 확인
   git push
   ```
5. 너무 꼬였으면 `git merge --abort`로 합치기 전 상태로 되돌린 뒤 팀원에게 도움을 요청한다.

## 자주 하는 실수

- `main`에서 바로 작업했다 → 커밋 전이면 `git switch -c feature/이름`으로 브랜치를 만들면 변경 내용이 따라온다.
- push가 거절된다 → 브랜치 이름을 확인하고, `git pull`로 최신 상태를 받은 뒤 다시 push 한다.
- `.env`를 올렸다 → 바로 팀장에게 알린다. 키는 폐기하고 새로 발급해야 한다.
