// 스트레칭 루틴 배경음악(BGM) (담당: 서진수). 새 라이브러리 없이 브라우저의 Audio를 쓴다.
//
// 사용 예 (원규 님 Stretch.jsx에서 한 줄, 원규 님과 합의 후 연결):
//   useStretchBgm(stage === 'move' || stage === 'breath')
//   → 동작과 호흡 단계 동안 BGM이 반복 재생되고, 그 밖의 단계나 화면을 떠나면 멈춘다.
//
// - 소리는 settings.soundOn이 true일 때만 낸다. (기본은 꺼짐, 사무실을 고려)
// - 음성 안내(voice.js)가 잘 들리도록 BGM은 작은 소리(BGM_VOLUME)로 튼다.
// - 음악 파일은 public/audio/bgm.mp3에 둔다. 사용 권한을 확인한 파일만 올린다.
//   파일이 없거나 재생이 막혀도 에러 없이 조용히 넘어가고, 루틴은 그대로 진행된다.
//
// 음악 출처 (2026-11-24 서진수 확인)
// - public/audio/bgm.mp3: Pixabay Music (https://pixabay.com/music/)에서 받음. 2분 19초, 약 4.2MB
// - 라이선스: Pixabay Content License. 무료 상업적 사용 가능, 출처 표기 의무 없음
//   (음악 파일만 따로 떼어 팔거나 재배포하는 것은 금지. 앱 배경음악으로 쓰는 것은 괜찮다)
// - 음악을 바꾸면 이 기록도 함께 고친다.
import { useEffect } from 'react'
import { useSettings } from './settings'

const BGM_FILE = `${import.meta.env.BASE_URL}audio/bgm.mp3`
const BGM_VOLUME = 0.25 // 0(무음) ~ 1(최대)

// 화면이 바뀌어도 같은 음악을 이어서 틀 수 있게 하나만 만든다.
let audio = null

function getAudio() {
  if (typeof Audio === 'undefined') return null
  if (!audio) {
    audio = new Audio(BGM_FILE)
    audio.loop = true
    audio.volume = BGM_VOLUME
    audio.preload = 'auto'
  }
  return audio
}

export function playBgm() {
  const bgm = getAudio()
  if (!bgm) return
  // 파일이 없거나, 사용자가 화면을 한 번도 누르지 않아 브라우저가 소리를 막으면 실패한다. 무시한다.
  bgm.play().catch(() => {})
}

// 멈춘다. rewind가 true면 다음에 처음부터 튼다.
export function stopBgm({ rewind = false } = {}) {
  if (!audio) return
  audio.pause()
  if (rewind) audio.currentTime = 0
}

// active: BGM을 틀어야 하는 단계인지 (예: 동작·호흡 단계)
export function useStretchBgm(active) {
  const [settings] = useSettings()
  const soundOn = settings.soundOn

  useEffect(() => {
    if (active && soundOn) playBgm()
    else stopBgm()
  }, [active, soundOn])

  // 루틴 화면을 떠나면 멈추고, 다음 루틴은 처음부터 튼다.
  useEffect(() => () => stopBgm({ rewind: true }), [])
}
