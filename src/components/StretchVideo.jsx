// 스트레칭 동작 영상 (담당: 서진수)
//
// 사용 예 (원규 님 Stretch.jsx의 영상 자리):
//   <StretchVideo key={move.id} file={move.videoFile} name={move.name} />
//
// 첫 재생이 끝난 뒤 카운트다운을 시작하고 싶을 때 (onFirstPlayEnd는 넣지 않아도 된다):
//   <StretchVideo key={move.id} file={move.videoFile} name={move.name} onFirstPlayEnd={() => setVideoDone(true)} />
//
// - file: 동작 데이터의 videoFile (예: 'neck-01.mp4'). 파일은 public/videos/ 에 둔다.
// - name: 동작 이름. 대체 안내 문구와 화면 읽기 프로그램용 설명에 쓴다.
// - onFirstPlayEnd: 영상이 처음 한 번 끝까지 재생되면 한 번 부른다. 그 뒤로 영상은 계속 반복 재생된다.
//   카운트가 영원히 시작되지 않는 일이 없도록, 아래 경우에도 바로(또는 늦어도 FIRST_PLAY_MAX_WAIT_MS 뒤) 부른다.
//   · 영상 파일이 없거나 재생에 실패해 글 안내로 바뀌었을 때
//   · 휴대폰 절전 모드 등으로 브라우저가 자동 재생을 막았을 때
//   · 인터넷이 느려 영상이 오래 멈춰 있을 때
// - 영상은 항상 음소거·반복 재생한다. 소리 안내는 음성(TTS, src/lib/voice.js)이 맡는다.
//   (브라우저는 소리 있는 영상의 자동 재생을 막기 때문이다)
// - 파일이 없거나 재생에 실패하면 글 안내로 바뀐다. 루틴은 그대로 진행할 수 있다.
// - 동작이 바뀔 때 key를 주면 이전 동작의 상태(실패, 첫 재생 끝남)가 남지 않는다.
import { useEffect, useRef, useState } from 'react'
import './StretchVideo.css'

const VIDEO_DIR = `${import.meta.env.BASE_URL}videos/`

// 영상이 가장 긴 것이 약 19초다. 이 시간이 지나도 첫 재생이 안 끝나면 끝난 것으로 본다.
const FIRST_PLAY_MAX_WAIT_MS = 30000

export default function StretchVideo({ file, name, onFirstPlayEnd }) {
  const [failed, setFailed] = useState(false)
  const [firstPlayDone, setFirstPlayDone] = useState(false)
  const videoRef = useRef(null)
  const callbackRef = useRef(onFirstPlayEnd)
  const notifiedRef = useRef(false)
  const showFallback = !file || failed

  useEffect(() => {
    callbackRef.current = onFirstPlayEnd
  }, [onFirstPlayEnd])

  // 첫 재생 끝 신호는 한 번만 보낸다.
  const notifyFirstPlayEnd = () => {
    if (notifiedRef.current) return
    notifiedRef.current = true
    setFirstPlayDone(true)
    callbackRef.current?.()
  }

  // 글 안내로 바뀌었으면 기다릴 영상이 없으니 바로 신호를 보낸다.
  useEffect(() => {
    if (showFallback) notifyFirstPlayEnd()
  }, [showFallback])

  // 자동 재생이 막혔는지 확인하고, 너무 오래 걸리면 끝난 것으로 본다.
  useEffect(() => {
    if (showFallback) return undefined
    const video = videoRef.current
    video?.play()?.catch?.((error) => {
      // 영상을 바꾸거나 화면을 떠나 재생이 중단된 경우(AbortError)는 막힌 것이 아니다.
      if (error?.name !== 'AbortError') notifyFirstPlayEnd()
    })
    const timer = setTimeout(notifyFirstPlayEnd, FIRST_PLAY_MAX_WAIT_MS)
    return () => clearTimeout(timer)
  }, [showFallback])

  // 첫 재생이 끝나면 신호를 보내고, 처음부터 다시 반복 재생한다.
  const handleEnded = () => {
    notifyFirstPlayEnd()
    const video = videoRef.current
    if (video) {
      video.currentTime = 0
      video.play()?.catch?.(() => {})
    }
  }

  if (showFallback) {
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

  return (
    <div className="stretch-video">
      <video
        ref={videoRef}
        className="stretch-video__player"
        src={`${VIDEO_DIR}${file}`}
        aria-label={name ? `${name} 동작 영상` : '스트레칭 동작 영상'}
        autoPlay
        muted
        loop={firstPlayDone}
        playsInline
        preload="auto"
        onEnded={handleEnded}
        onError={() => setFailed(true)}
      />
    </div>
  )
}
