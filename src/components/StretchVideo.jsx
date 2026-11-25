// 스트레칭 동작 영상 (담당: 서진수)
//
// 사용 예 (원규 님 Stretch.jsx의 영상 자리):
//   <StretchVideo key={move.id} file={move.videoFile} name={move.name} />
//
// - file: 동작 데이터의 videoFile (예: 'neck-01.mp4'). 파일은 public/videos/ 에 둔다.
// - name: 동작 이름. 대체 안내 문구와 화면 읽기 프로그램용 설명에 쓴다.
// - 영상은 항상 음소거·반복 재생한다. 소리 안내는 음성(TTS, src/lib/voice.js)이 맡는다.
//   (브라우저는 소리 있는 영상의 자동 재생을 막기 때문이다)
// - 파일이 없거나 재생에 실패하면 글 안내로 바뀐다. 루틴은 그대로 진행할 수 있다.
// - 동작이 바뀔 때 key를 주면 이전 동작의 실패 상태가 남지 않는다.
//
// 재생 순서 (2026-11-26 팀 결정: 음성 안내와 영상이 동시에 시작, 영상은 최소 1회 재생 후 계속 반복)
// - playing: false 동안은 첫 장면에서 멈춰 있고, true가 되면 처음부터 한 번 끝까지 재생한다. (스트레칭 화면은 항상 true로 바로 시작)
// - onFirstPlayEnd: 첫 재생이 끝나면 한 번 부른다. 그 뒤 영상은 반복 재생으로 바뀐다.
//   영상이 없거나 오류가 나거나 재생이 막히거나 너무 오래 걸려도(MAX_FIRST_PLAY_MS) 한 번 불러서 카운트다운이 멈추지 않게 한다.
// - 영상마다 길이가 달라도 "끝났을 때"를 기준으로 하므로 따로 설정할 것이 없다.
import { useEffect, useRef, useState } from 'react'
import { VideoOffIcon } from './Icons'
import './StretchVideo.css'

const VIDEO_DIR = `${import.meta.env.BASE_URL}videos/`

// 영상별 화면 맞춤. 16:9 원본을 4:3 상자에 채울 때(좌우가 잘림) 어디를 보여줄지와 얼마나 확대할지를 정한다. 원본 MP4는 건드리지 않는다.
//   x: 가로 위치(0~100, 보여줄 구간을 왼쪽↔오른쪽으로), scale: 확대 비율, ox·oy: 확대의 기준점(0~100%, oy 0이면 위쪽 고정=머리·손이 안 잘림, 100이면 아래쪽 고정=의자까지 보임)
// 값은 영상 전체를 40장면 훑어 사람(머리·팔·손)이 차지하는 가장 큰 범위를 구하고, 그 범위가 항상 들어오는 선에서 정했다. (2026-11-26)
//   목: 얼굴·어깨 중심 1.3배(neck-01·02는 손이 무릎까지 내려와 1.15배) / 손목: 얼굴·상체·양손 중심 1.25배(팔을 길게 뻗는 wrist-02는 1.05배) / 어깨·허리: 팔 전체와 의자가 보이는 범위(1.0~1.08배)
// 원본 영상 자체에서 손이 위 가장자리에 닿는 동작(shoulder-04, waist-02, waist-04)은 확대하지 않는다. 비워 두면 가운데·확대 없음.
const VIDEO_FRAMING = {
  'neck-01.mp4': { x: 52, ox: 50, oy: 0, scale: 1.15 },
  'neck-02.mp4': { x: 53, ox: 50, oy: 12, scale: 1.15 },
  'neck-03.mp4': { x: 39, ox: 50, oy: 26, scale: 1.3 },
  'neck-04.mp4': { x: 53, ox: 50, oy: 31, scale: 1.3 },
  'shoulder-01.mp4': { x: 44, ox: 50, oy: 100, scale: 1.08 },
  'shoulder-02.mp4': { x: 50, ox: 50, oy: 100, scale: 1.08 },
  'shoulder-03.mp4': { x: 29, ox: 50, oy: 100, scale: 1.08 },
  'shoulder-04.mp4': { x: 50, ox: 50, oy: 50, scale: 1.0 },
  'wrist-02.mp4': { x: 50, ox: 50, oy: 100, scale: 1.05 },
  'wrist-03.mp4': { x: 51, ox: 50, oy: 33, scale: 1.25 },
  'wrist-04.mp4': { x: 51, ox: 50, oy: 33, scale: 1.25 },
  'waist-01.mp4': { x: 50, ox: 50, oy: 100, scale: 1.08 },
  'waist-02.mp4': { x: 58, ox: 50, oy: 50, scale: 1.0 },
  'waist-03.mp4': { x: 48, ox: 50, oy: 100, scale: 1.06 },
  'waist-04.mp4': { x: 53, ox: 50, oy: 50, scale: 1.0 },
}

const MAX_FIRST_PLAY_MS = 25000

export default function StretchVideo({ file, name, playing = true, onFirstPlayEnd }) {
  const [failed, setFailed] = useState(false)
  const videoRef = useRef(null)
  const endedRef = useRef(false)
  const endCbRef = useRef(onFirstPlayEnd)
  const unavailable = !file || failed

  useEffect(() => {
    endCbRef.current = onFirstPlayEnd
  })

  // 첫 재생 끝 신호는 동작마다 한 번만 보낸다.
  const finishFirstPlay = () => {
    if (endedRef.current) return
    endedRef.current = true
    endCbRef.current?.()
  }

  // 영상이 없거나 오류가 난 동작은 기다릴 것이 없다.
  useEffect(() => {
    if (unavailable) finishFirstPlay()
  }, [unavailable])

  // playing이 true가 되면 처음부터 한 번 재생한다. 재생이 막히거나 너무 오래 걸리면 기다리지 않는다.
  useEffect(() => {
    const video = videoRef.current
    if (unavailable || !playing || !video || endedRef.current) return undefined
    let alive = true // 동작이 바뀌어 이 영상이 사라진 뒤에는 신호를 보내지 않는다
    const timer = setTimeout(() => {
      if (!alive || endedRef.current) return
      finishFirstPlay()
      video.loop = true
      video.play().catch(() => {})
    }, MAX_FIRST_PLAY_MS)
    video.loop = false
    video.currentTime = 0
    video.play().catch(() => {
      if (!alive) return
      clearTimeout(timer)
      finishFirstPlay()
    })
    return () => {
      alive = false
      clearTimeout(timer)
    }
  }, [playing, unavailable])

  // 첫 재생이 끝나면 카운트다운을 시작하라고 알리고, 영상은 계속 반복한다.
  const handleEnded = () => {
    const video = videoRef.current
    finishFirstPlay()
    if (video) {
      video.loop = true
      video.currentTime = 0
      video.play().catch(() => {})
    }
  }

  if (unavailable) {
    return (
      <div className="stretch-video stretch-video--fallback" role="note">
        <span className="stretch-video__fallback-icon">
          <VideoOffIcon width="22" height="22" />
        </span>
        <p className="stretch-video__fallback-text">
          <strong>영상이 준비 중이에요.</strong>
          아래 동작 설명을 따라 해 주세요.
        </p>
      </div>
    )
  }

  const framing = VIDEO_FRAMING[file]
  const framingStyle = framing
    ? {
        '--video-x': `${framing.x ?? 50}%`,
        '--video-ox': `${framing.ox ?? 50}%`,
        '--video-oy': `${framing.oy ?? 50}%`,
        '--video-scale': framing.scale ?? 1,
      }
    : undefined

  return (
    <div className="stretch-video">
      <video
        className="stretch-video__player"
        ref={videoRef}
        style={framingStyle}
        src={`${VIDEO_DIR}${file}`}
        aria-label={name ? `${name} 동작 영상` : '스트레칭 동작 영상'}
        muted
        playsInline
        preload="auto"
        onEnded={handleEnded}
        onError={() => setFailed(true)}
      />
    </div>
  )
}
