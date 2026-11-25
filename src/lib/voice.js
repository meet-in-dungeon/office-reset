// 음성 안내 (담당: 서진수). 브라우저에 들어 있는 글 읽기 기능(TTS, speechSynthesis)을 쓴다.
// 녹음 파일이나 새 라이브러리는 쓰지 않는다.
//
// 소리는 사용자 설정 settings.soundOn이 true일 때만 낸다. (김민지 님 src/lib/settings.js)
// 사무실을 생각해 기본값은 꺼짐이다.
//
// 사용 예 (원규 님 Stretch.jsx, 동작 화면에서 한 줄):
//   useStretchVoice({ id: move.id, narration: move.name, active: stage === 'move' })
//   → 동작이 바뀌면 narration에 넘긴 글을 한 번 읽는다. 카운트다운 숫자는 읽지 않는다.
//   2026-11-25 팀 결정: 동작 설명 문장 대신 동작 이름(move.name, 예: "목 옆 늘이기")만 읽는다.
//
// 다 읽은 뒤 알림을 받고 싶을 때 (onEnd는 넣지 않아도 된다):
//   useStretchVoice({ id: move.id, narration: move.name, active: stage === 'move', onEnd: () => setVoiceDone(true) })
//   → 읽기가 끝나면 동작마다 한 번 onEnd를 부른다.
//     기다리는 화면이 멈추지 않도록, 소리가 꺼져 있거나 브라우저가 음성을 지원하지 않거나
//     읽기에 실패하면 바로 부르고, VOICE_MAX_WAIT_MS(8초)가 지나도 안 끝나면 그때 부른다.
//     다 읽기 전에 다음 동작으로 넘어가거나 active가 false가 되면 이전 동작의 onEnd는 부르지 않는다.
//
// 주의
// - 브라우저는 사용자가 화면을 한 번도 누르지 않았으면 소리를 막는다.
//   메인의 "스트레칭 시작"이나 알림 뒤 "시작" 버튼을 누른 다음에는 정상으로 나온다.
// - 한국어 목소리는 운영체제·브라우저마다 다르다. 한국어 목소리가 없으면 기본 목소리로 읽는다.
import { useEffect, useRef } from 'react'
import { getSettings, useSettings } from './settings'

const LANG = 'ko-KR'

// 동작 이름은 2~3초면 다 읽는다. 브라우저가 소리를 막아 "끝남" 신호가 안 오는 경우를 대비한 최대 대기 시간.
const VOICE_MAX_WAIT_MS = 8000

// 목소리 설정. 목소리는 사용자 컴퓨터·브라우저에 깔린 것만 쓸 수 있어서 "있으면 먼저 쓸 이름"만 정한다.
// voiceName이 없거나 그 컴퓨터에 없으면 첫 번째 한국어 목소리로 읽는다.
// rate: 말하는 속도 (0.5 느림 ~ 1 보통 ~ 2 빠름), pitch: 목소리 높낮이 (0 낮음 ~ 1 보통 ~ 2 높음)
// 테스트 페이지(/video-test.html)에서 들어 보고 고른 값을 여기에 적는다.
// 2026-11-24 서진수 선택: Chrome의 "Google 한국의" 목소리, 속도 1.0
// ("Google 한국의"는 Chrome에만 있고 인터넷 연결이 필요하다. 없으면 그 컴퓨터의 한국어 목소리로 읽는다)
export const DEFAULT_VOICE_OPTIONS = {
  voiceName: 'Google 한국의',
  rate: 1,
  pitch: 1,
}

let voiceOptions = { ...DEFAULT_VOICE_OPTIONS }

export function getVoiceOptions() {
  return voiceOptions
}

// 테스트 페이지에서 목소리를 바꿔 들어 볼 때 쓴다. (저장되지 않고, 새로고침하면 기본값으로 돌아간다)
export function setVoiceOptions(patch) {
  voiceOptions = { ...voiceOptions, ...patch }
}

export function isSpeechSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

// 이 브라우저에서 쓸 수 있는 목소리 목록. 한국어 목소리를 앞에 둔다.
// 목소리 목록은 페이지가 열리고 조금 뒤에 채워질 수 있다. (voiceschanged 이벤트)
export function listVoices() {
  if (!isSpeechSupported()) return []
  const voices = window.speechSynthesis.getVoices()
  const isKorean = (voice) => voice.lang?.toLowerCase().startsWith('ko')
  return [...voices.filter(isKorean), ...voices.filter((voice) => !isKorean(voice))]
}

function pickVoice() {
  const voices = window.speechSynthesis.getVoices()
  const chosen = voiceOptions.voiceName
    ? voices.find((voice) => voice.name === voiceOptions.voiceName)
    : null
  return chosen ?? voices.find((voice) => voice.lang?.toLowerCase().startsWith('ko')) ?? null
}

// 읽고 있던 문장을 멈춘다.
export function stopSpeaking() {
  if (isSpeechSupported()) window.speechSynthesis.cancel()
}

// 문장을 읽는다. 소리가 꺼져 있거나 브라우저가 지원하지 않으면 아무것도 하지 않고 false를 돌려준다.
// 읽고 있던 문장은 끊고 새 문장을 읽는다.
export function speak(text, { onEnd } = {}) {
  if (!text || !isSpeechSupported() || !getSettings().soundOn) return false

  const synth = window.speechSynthesis
  synth.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = LANG
  utterance.rate = voiceOptions.rate
  utterance.pitch = voiceOptions.pitch
  const voice = pickVoice()
  if (voice) {
    utterance.voice = voice
    utterance.lang = voice.lang
  }
  if (onEnd) {
    utterance.onend = onEnd
    utterance.onerror = onEnd
  }
  synth.speak(utterance)
  return true
}

// 스트레칭 동작 화면용 음성 안내.
// - id가 바뀌면(새 동작) narration에 넘긴 글을 읽는다. (지금은 동작 이름)
// - 카운트다운 숫자는 읽지 않는다. (2026-11-24 팀 결정으로 제거)
//   예전처럼 remaining을 넘겨도 쓰지 않고 무시한다.
// - active가 false가 되거나, 소리를 끄거나, 화면을 떠나면 바로 멈춘다.
// - onEnd(선택): 다 읽으면 동작마다 한 번 부른다. (자세한 규칙은 파일 맨 위 주석)
export function useStretchVoice({ id, narration, active = true, onEnd }) {
  const [settings] = useSettings()
  const soundOn = settings.soundOn
  const onEndRef = useRef(onEnd)
  const endedIdRef = useRef(null) // onEnd를 이미 부른 동작 id

  useEffect(() => {
    onEndRef.current = onEnd
  }, [onEnd])

  // 새 동작이 나오면 안내 문장 읽기, 다 읽으면 onEnd
  useEffect(() => {
    if (!active) return undefined
    // 이 동작의 음성 단계는 이미 끝났다. (소리를 껐다가 다시 켜도 같은 동작의 안내를 또 읽지 않는다)
    if (endedIdRef.current === id) return undefined

    let stale = false // 다음 동작으로 넘어갔거나 화면이 바뀌면 true
    const finish = () => {
      if (stale || endedIdRef.current === id) return
      endedIdRef.current = id
      onEndRef.current?.()
    }

    // 소리가 꺼져 있으면 기다릴 것이 없으니 바로 알린다.
    if (!soundOn || !narration) {
      finish()
      return () => {
        stale = true
      }
    }

    // 읽기 시작을 한 박자(0ms 타이머) 미룬다. 개발 모드의 React StrictMode는 effect를 "실행 → 정리 → 다시 실행"으로 곧바로 두 번 돌리는데,
    // 한 박자 미루면 첫 번째 실행은 정리되어 읽기가 시작되지 않아 같은 문장이 두 번 읽히지 않는다.
    const starter = setTimeout(() => {
      if (stale) return
      if (!speak(narration, { onEnd: finish })) finish() // 읽을 수 없으면 바로 알린다.
    }, 0)
    const timer = setTimeout(finish, VOICE_MAX_WAIT_MS)
    return () => {
      stale = true
      clearTimeout(starter)
      clearTimeout(timer)
    }
  }, [id, narration, active, soundOn])

  // 소리를 끄거나 동작 화면이 끝나면 멈추기
  useEffect(() => {
    if (!active || !soundOn) stopSpeaking()
  }, [active, soundOn])

  // 화면을 떠나면 멈추기
  useEffect(() => stopSpeaking, [])
}
