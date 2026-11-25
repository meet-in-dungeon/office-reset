# 디자인 에셋 목록

디자이너 제작 에셋 43개가 `public/images/`에 들어 있다. 파일을 **같은 이름으로 바꿔 넣으면** 코드 수정 없이 화면에 반영된다. (이미지가 없을 때만 점선 자리 표시, 스티커는 숨김, 배지는 이모지로 대체된다)
경로는 `import.meta.env.BASE_URL`을 붙여 읽으므로 사이트를 하위 경로(예: `/office-reset/`)에 올려도 된다. (`npx vite build --base=/office-reset/`로 확인)

| 파일 | 쓰는 곳 | 비고 |
|---|---|---|
| `character-welcome.webp` (720×900) | 온보딩 | 강조선 없음 → `sticker-accent.svg`를 옆에 따로 붙임 |
| `character-main.webp` (560×660) | 메인, 스트레칭 시작 단계 | **이미지 안에 강조선 포함** → 별도 강조선을 붙이지 않음 |
| `character-cheer.webp` (560×680) | 루틴 완료 | **이미지 안에 강조선 포함** |
| `character-angry.webp` (256×256) | 메인 빡침 버튼(원형 64px) | 코랄 배경 위에 얼굴 크롭 |
| `character-calm.webp` (560×560) | 빡침 명상 완료 | |
| `sticker-impact.svg` | 메인 빡침 버튼 왼쪽 위 폭발 | 글자 없음. "빡침!"은 코드 텍스트 |
| `sticker-accent.svg` | 온보딩(캐릭터 옆), 스트레칭 카운트 진행 상태 좌우, 알림 배너 | 장식이라 오른쪽은 좌우 반전해서 씀. **캐릭터 이미지는 절대 반전하지 않음** |
| `sticker-confetti.svg` | 루틴 완료 제목 주변 | |
| `calm-landscape.webp` (750×800) | 명상 배경 위쪽 45% | 불투명 이미지. 아래쪽은 CSS 마스크로 라벤더에 녹임 |
| `badges/<배지ID>.webp`, `badges/<등급형 배지ID>-bronze·silver·gold.webp` (360×360) | 완료·통계·명상 | **14종 34장**. 이미지에 메달 틀·리본이 들어 있어 CSS 원형 배경/테두리를 두지 않음 |

배지 ID는 `src/lib/badges.js`의 `BADGE_IDS`(14종, 히든 3종: `hackathon_2026`, `body_boss`, `friday_fire`)와 같다. 등급형은 `tiers`가 있는 10종. 아직 못 받은 등급형 배지는 브론즈 이미지를 흐리게(회색) 보여준다.
