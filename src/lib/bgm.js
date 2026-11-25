// 배경음악(BGM) (담당: 서진수). 새 라이브러리 없이 브라우저의 Audio를 쓴다.
// 스트레칭 루틴용과 빡침 명상용, 두 가지 음악을 따로 튼다.
//
// 사용 예 1 (원규 님 Stretch.jsx에서 한 줄):
//   useStretchBgm(stage === 'move' || stage === 'breath')
//   → 동작과 호흡 단계 동안 BGM이 반복 재생되고, 그 밖의 단계나 화면을 떠나면 멈춘다.
//
// 사용 예 2 (주연 님 Calm.jsx에서 한 줄, 주연 님과 합의 후 연결):
//   useCalmBgm()
//   → 빡침 명상 화면에 들어와 호흡이 시작되면 BGM이 반복 재생되고,
//     완료 화면에서도 계속 나오다가 "돌아가기"로 화면을 떠나면 멈춘다.
//
// - 소리는 settings.soundOn이 true일 때만 낸다. (기본은 꺼짐, 사무실을 고려)
// - 음성 안내(voice.js)가 잘 들리도록 BGM은 작은 소리(BGM_VOLUME)로 튼다.
// - 음악 파일은 public/audio/에 둔다. 사용 권한을 확인한 파일만 올린다.
//   파일이 없거나 재생이 막혀도 에러 없이 조용히 넘어가고, 화면은 그대로 진행된다.
//
// 음악 출처 (음악을 바꾸거나 추가하면 이 기록도 함께 고친다)
// - public/audio/bgm.mp3 (스트레칭): Pixabay Music (https://pixabay.com/music/)에서 받음.
//   2분 35초, 약 4.7MB. 2026-11-25 서진수가 새 곡으로 교체 (이전 곡: 2분 19초, 약 4.2MB)
//   곡 이름·작곡가는 기록하지 못했다.
// - public/audio/calm.mp3 (빡침 명상): Pixabay Music (https://pixabay.com/music/)에서 받음.
//   1분 58초, 약 3.6MB. 2026-11-25 서진수 확인
//   Pixabay 검색어 "relaxing piano" 결과에서 골랐다. (https://pixabay.com/music/search/relaxing%20piano/)
//   곡 이름·작곡가는 기록하지 못했다.
// - 두 곡 모두 라이선스: Pixabay Content License. 무료 상업적 사용 가능, 출처 표기 의무 없음
//   (음악 파일만 따로 떼어 팔거나 재배포하는 것은 금지. 앱 배경음악으로 쓰는 것은 괜찮다)
//   라이선스 요약: https://pixabay.com/service/license-summary/ (2026-11-25 확인)
import { useEffect } from 'react'
import { useSettings } from './settings'

const BGM_VOLUME = 0.25 // 0(무음) ~ 1(최대)

const TRACKS = {
  stretch: 'audio/bgm.mp3',
  calm: 'audio/calm.mp3',
}

// 화면이 바뀌어도 같은 음악을 이어서 틀 수 있게 음악마다 하나씩만 만든다.
const players = {}

function getAudio(track) {
  if (typeof Audio === 'undefined' || !TRACKS[track]) return null
  if (!players[track]) {
    const audio = new Audio(`${import.meta.env.BASE_URL}${TRACKS[track]}`)
    audio.loop = true
    audio.volume = BGM_VOLUME
    audio.preload = 'auto'
    players[track] = audio
  }
  return players[track]
}

// track: 'stretch'(스트레칭 루틴) 또는 'calm'(빡침 명상)
export function playBgm(track = 'stretch') {
  const bgm = getAudio(track)
  if (!bgm) return
  // 파일이 없거나, 사용자가 화면을 한 번도 누르지 않아 브라우저가 소리를 막으면 실패한다. 무시한다.
  bgm.play().catch(() => {})
}

// 멈춘다. rewind가 true면 다음에 처음부터 튼다.
export function stopBgm(track = 'stretch', { rewind = false } = {}) {
  const bgm = players[track]
  if (!bgm) return
  bgm.pause()
  if (rewind) bgm.currentTime = 0
}

function useBgm(track, active) {
  const [settings] = useSettings()
  const soundOn = settings.soundOn

  useEffect(() => {
    if (active && soundOn) playBgm(track)
    else stopBgm(track)
  }, [track, active, soundOn])

  // 화면을 떠나면 멈추고, 다음에 들어오면 처음부터 튼다.
  useEffect(() => () => stopBgm(track, { rewind: true }), [track])
}

// 스트레칭 루틴용. active: BGM을 틀어야 하는 단계인지 (예: 동작·호흡 단계)
export function useStretchBgm(active) {
  useBgm('stretch', active)
}

// 빡침 명상용. 화면에 있는 동안 계속 튼다. (잠시 끄고 싶으면 false를 넘긴다)
export function useCalmBgm(active = true) {
  useBgm('calm', active)
}
