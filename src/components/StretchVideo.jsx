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
// 재생 순서 (2026-11-25 팀 결정: 음성 안내 → 영상 1회 → 카운트다운, 영상은 그 뒤에도 계속 반복)
// - playing: false 동안은 첫 장면에서 멈춰 있고(음성 안내 중), true가 되면 처음부터 한 번 끝까지 재생한다.
// - onFirstPlayEnd: 첫 재생이 끝나면 한 번 부른다. 그 뒤 영상은 반복 재생으로 바뀐다.
//   영상이 없거나 오류가 나거나 재생이 막히거나 너무 오래 걸려도(MAX_FIRST_PLAY_MS) 한 번 불러서 카운트다운이 멈추지 않게 한다.
// - 영상마다 길이가 달라도 "끝났을 때"를 기준으로 하므로 따로 설정할 것이 없다.
import { useEffect, useRef, useState } from 'react'
import './StretchVideo.css'

const VIDEO_DIR = `${import.meta.env.BASE_URL}videos/`

// 영상별 화면 맞춤. 16:9 원본을 4:3 상자에 채울 때 어디를 보여줄지(x, y: %)와 확대 비율(scale)을 정한다.
// 비워 두면 가운데·확대 없음. 동작(팔·손·머리)이 잘리면 scale을 줄이거나 x를 옮긴다. 예: 'neck-01.mp4': { x: 55, y: 40, scale: 1.1 }
const VIDEO_FRAMING = {}

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
        <p className="stretch-video__fallback-text">
          {name ? `"${name}" 영상을 준비 중이에요.` : '영상을 준비 중이에요.'}
          <br />
          아래 설명을 따라 해 주세요.
        </p>
      </div>
    )
  }

  const framing = VIDEO_FRAMING[file]
  const framingStyle = framing
    ? { '--video-x': `${framing.x ?? 50}%`, '--video-y': `${framing.y ?? 50}%`, '--video-scale': framing.scale ?? 1 }
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
