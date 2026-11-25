# 디자인 에셋 목록 (디자이너 전달용)

파일을 **`public/images/`에 같은 이름으로 넣으면** 코드 수정 없이 화면에 나온다. 파일이 없는 동안은 점선 자리 표시(캐릭터) 또는 아무것도 없음(스티커)으로 보인다. 캐릭터는 **배경 투명 webp**.

| 파일명 | 쓰는 화면 | 화면 표시 크기 | 권장 원본 |
|---|---|---|---|
| `character-welcome.webp` | 온보딩 | 약 260×330 | 720×900 |
| `character-main.webp` | 메인, 스트레칭 시작 단계 | 메인 150×220 / 시작 200×240 | 560×660 |
| `character-cheer.webp` | 완료 | 약 170×220 | 560×680 |
| `character-angry.webp` | 메인 빡침 버튼(원형 64×64 안) | 64×64 | 256×256 (얼굴 중심 크롭) |
| `character-calm.webp` | 빡침 명상 완료 | 약 180×180 | 560×560 |
| `sticker-impact.svg` | 메인 빡침 버튼 옆 폭발 | 약 64 | |
| `sticker-accent.svg` | 온보딩·메인·스트레칭 카운트·알림 배너 강조선 | 36~56 | |
| `sticker-confetti.svg` | 완료 화면 색종이 (가로 전체) | 폭 100% | 가로 375 비율 |
| `calm-landscape.webp` | 명상 배경(위쪽, 아래는 라벤더로 이어짐) | 폭 100% | 750×800 이상 |
| `badges/<배지ID>.webp` | 완료·통계·명상 배지 | 통계 72, 완료 120, 명상 64 | 정사각 360 |
| `badges/<등급형 배지ID>-bronze·silver·gold.webp` | 등급형 배지 (attendance, reset_master 등 `tiers`가 있는 것) | 위와 같음 | 정사각 360 |

배지 ID는 `src/lib/badges.js`의 `BADGE_IDS` (14종, 히든 3종 포함: `hackathon_2026`, `body_boss`, `friday_fire`). 이미지가 없으면 기존 이모지가 원 안에 나온다.
