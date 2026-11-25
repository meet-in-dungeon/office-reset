// 영상·음성 개발용 테스트 화면 (담당: 서진수). 실제 서비스 화면이 아니다.
// 확인할 것: 영상 재생, 영상이 없는 동작의 대체 안내, 소리 ON/OFF에 따른 음성 안내. (카운트다운 숫자는 읽지 않는다)
// 동작 목록은 실제 루틴 화면과 같은 src/data/stretches.json(원규 님 파일)에서 읽는다.
import { useEffect, useState } from 'react'
import Button from '../components/Button'
import Screen from '../components/Screen'
import StretchVideo from '../components/StretchVideo'
import data from '../data/stretches.json'
import { useCalmBgm, useStretchBgm } from '../lib/bgm'
import { MOVE_SECONDS } from '../lib/config'
import { useSettings } from '../lib/settings'
import {
  getVoiceOptions,
  isSpeechSupported,
  listVoices,
  setVoiceOptions,
  speak,
  useStretchVoice,
} from '../lib/voice'

const SAMPLE_TEXT = '귀를 어깨 쪽으로 천천히 기울여 주세요.'

// 목소리 고르기 (테스트용). 고른 값은 이 페이지에서만 쓰이고, 새로고침하면 기본값으로 돌아간다.
// 마음에 드는 값을 찾으면 src/lib/voice.js의 DEFAULT_VOICE_OPTIONS에 적는다.
function VoicePicker({ soundOn }) {
  const [voices, setVoices] = useState(() => listVoices())
  const [options, setOptions] = useState(() => getVoiceOptions())

  useEffect(() => {
    if (!isSpeechSupported()) return undefined
    const refresh = () => setVoices(listVoices())
    window.speechSynthesis.addEventListener('voiceschanged', refresh)
    // 목록이 이미 채워졌는데 이벤트를 놓친 경우를 위해 잠시 뒤 몇 번 더 확인한다.
    const retries = [0, 300, 1000, 2000].map((ms) => setTimeout(refresh, ms))
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', refresh)
      retries.forEach(clearTimeout)
    }
  }, [])

  const change = (patch) => {
    setVoiceOptions(patch)
    setOptions(getVoiceOptions())
  }

  const koreanCount = voices.filter((voice) => voice.lang.toLowerCase().startsWith('ko')).length

  return (
    <fieldset
      style={{
        display: 'grid',
        gap: 'var(--space-3)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-4)',
      }}
    >
      <legend>목소리 고르기</legend>
      <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-muted)' }}>
        이 브라우저의 목소리 {voices.length}개 (한국어 {koreanCount}개). 한국어가 아닌 목소리는
        한국어 문장을 제대로 읽지 못합니다.
      </p>

      <label>
        목소리{' '}
        <select
          value={options.voiceName}
          onChange={(event) => change({ voiceName: event.target.value })}
        >
          <option value="">기본 (첫 번째 한국어 목소리)</option>
          {options.voiceName && !voices.some((voice) => voice.name === options.voiceName) ? (
            <option value={options.voiceName}>
              {options.voiceName} · 이 브라우저에 없음 (한국어 목소리로 대신 읽음)
            </option>
          ) : null}
          {voices.map((voice) => (
            <option key={voice.name} value={voice.name}>
              {voice.name} · {voice.lang}
              {voice.localService ? '' : ' · 인터넷 필요'}
            </option>
          ))}
        </select>
      </label>

      <label>
        속도 {options.rate.toFixed(1)}{' '}
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={options.rate}
          onChange={(event) => change({ rate: Number(event.target.value) })}
        />
      </label>

      <label>
        높낮이 {options.pitch.toFixed(1)}{' '}
        <input
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={options.pitch}
          onChange={(event) => change({ pitch: Number(event.target.value) })}
        />
      </label>

      <Button variant="soft" onClick={() => speak(SAMPLE_TEXT)} disabled={!soundOn}>
        {soundOn ? '미리 듣기' : '미리 듣기 (위에서 소리 켜기를 체크하세요)'}
      </Button>

      <p style={{ fontSize: 'var(--text-small)' }}>
        고른 값: <code>{JSON.stringify(options)}</code>
      </p>
    </fieldset>
  )
}

// 동작 목록은 원규 님의 stretches.json을 읽기만 한다. (고치지 않는다)
// 실제 루틴과 같은 순서로 보이도록 쓰는 동작(active)을 먼저, 예비(reserve)를 뒤에 둔다.
const TEST_MOVES = [
  ...data.stretches.filter((move) => move.status === 'active'),
  ...data.stretches.filter((move) => move.status !== 'active'),
]

export default function VideoTest() {
  const [settings, updateSettings] = useSettings()
  const [index, setIndex] = useState(0)
  const [remaining, setRemaining] = useState(0)
  const [running, setRunning] = useState(false)
  const [bgmOn, setBgmOn] = useState(false)
  const [calmBgmOn, setCalmBgmOn] = useState(false)
  const move = TEST_MOVES[index]

  useStretchVoice({ id: move.id, narration: move.narration, active: running })
  useStretchBgm(bgmOn)
  useCalmBgm(calmBgmOn)

  useEffect(() => {
    if (!running) return undefined
    const timer = setInterval(() => {
      setRemaining((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [running, index])

  const select = (nextIndex) => {
    setIndex(nextIndex)
    setRunning(false)
    setRemaining(0)
  }

  const startCount = () => {
    setRemaining(MOVE_SECONDS)
    setRunning(true)
  }

  return (
    <Screen title="영상·음성 테스트">
      <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
        <p className="dev-note">개발용 테스트 페이지입니다. 실제 서비스 화면이 아닙니다.</p>

        <label style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={settings.soundOn}
            onChange={(event) => updateSettings({ soundOn: event.target.checked })}
          />
          소리 켜기 (settings.soundOn: {String(settings.soundOn)})
        </label>
        {!isSpeechSupported() ? <p>이 브라우저는 음성 안내(TTS)를 지원하지 않습니다.</p> : null}

        <label style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={bgmOn}
            onChange={(event) => setBgmOn(event.target.checked)}
          />
          BGM 틀기 (루틴의 동작·호흡 단계라고 가정. 소리 켜기도 체크해야 들립니다. 파일:
          public/audio/bgm.mp3)
        </label>

        <label style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={calmBgmOn}
            onChange={(event) => setCalmBgmOn(event.target.checked)}
          />
          빡침 명상 BGM 틀기 (명상 화면에 있다고 가정. 소리 켜기도 체크해야 들립니다. 파일:
          public/audio/calm.mp3)
        </label>

        <VoicePicker soundOn={settings.soundOn} />

        <label>
          동작 고르기{' '}
          <select value={index} onChange={(event) => select(Number(event.target.value))}>
            {TEST_MOVES.map((item, i) => (
              <option key={item.id} value={i}>
                {item.id} · {item.name}
                {item.status === 'active' ? '' : ' (예비)'}
              </option>
            ))}
          </select>
        </label>

        <h2 style={{ fontSize: 'var(--text-large)' }}>
          {move.id} · {move.name}
        </h2>
        <StretchVideo key={move.id} file={move.videoFile} name={move.name} />

        <p style={{ fontSize: 'var(--text-title)', textAlign: 'center' }} aria-live="polite">
          {running ? (remaining === 0 ? '완료' : remaining) : '-'}
        </p>

        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Button block onClick={startCount}>
            5초 카운트 시작
          </Button>
          <Button
            variant="soft"
            block
            onClick={() => select((index + 1) % TEST_MOVES.length)}
          >
            다음 동작
          </Button>
        </div>
      </div>
    </Screen>
  )
}
