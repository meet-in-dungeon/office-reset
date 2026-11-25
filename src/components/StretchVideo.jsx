// 스트레칭 동작 영상 (담당: 서진수)
//
// 사용 예 (원규 님 Stretch.jsx의 영상 자리):
//   <StretchVideo key={move.id} file={move.videoFile} name={move.name} />
//
// 영상이 한 바퀴 끝날 때마다 알림을 받고 싶을 때 (onLoop는 넣지 않아도 된다):
//   <StretchVideo key={move.id} file={move.videoFile} name={move.name} onLoop={() => setLoops((n) => n + 1)} />
//
// - file: 동작 데이터의 videoFile (예: 'neck-01.mp4'). 파일은 public/videos/ 에 둔다.
// - name: 동작 이름. 대체 안내 문구와 화면 읽기 프로그램용 설명에 쓴다.
// - onLoop: 영상이 한 바퀴 끝날 때마다 부른다. (첫 바퀴가 끝나면 1번째, 다음 바퀴가 끝나면 2번째 …)
//   기다리는 화면이 멈추지 않도록, 아래 경우에는 바로 한 번 부른다.
//   · 영상 파일이 없거나 재생에 실패해 글 안내로 바뀌었을 때
//   · 휴대폰 절전 모드 등으로 브라우저가 자동 재생을 막았을 때
//   · 인터넷이 느려 FIRST_LOOP_MAX_WAIT_MS(30초)가 지나도 첫 바퀴가 안 끝났을 때
//     (이 경우 나중에 실제로 바퀴가 끝나면 그때도 다시 부른다)
// - 영상은 항상 음소거·반복 재생한다. 소리 안내는 음성(TTS, src/lib/voice.js)이 맡는다.
//   (브라우저는 소리 있는 영상의 자동 재생을 막기 때문이다)
// - 파일이 없거나 재생에 실패하면 글 안내로 바뀐다. 루틴은 그대로 진행할 수 있다.
// - 동작이 바뀔 때 key를 주면 이전 동작의 상태(실패, 바퀴 수)가 남지 않는다.
import { useEffect, useRef, useState } from 'react'
import './StretchVideo.css'

const VIDEO_DIR = `${import.meta.env.BASE_URL}videos/`

// 영상이 가장 긴 것이 약 19초다. 이 시간이 지나도 첫 바퀴가 안 끝나면 한 번 끝난 것으로 알린다.
const FIRST_LOOP_MAX_WAIT_MS = 30000

export default function StretchVideo({ file, name, onLoop }) {
  const [failed, setFailed] = useState(false)
  const videoRef = useRef(null)
  const onLoopRef = useRef(onLoop)
  const loopedRef = useRef(false) // 한 번이라도 onLoop를 불렀는지
  const showFallback = !file || failed

  useEffect(() => {
    onLoopRef.current = onLoop
  }, [onLoop])

  const callLoop = () => {
    loopedRef.current = true
    onLoopRef.current?.()
  }

  // 아직 한 번도 알리지 않았을 때만 부른다. (영상 없음·자동 재생 막힘·너무 오래 걸림)
  const callLoopOnce = () => {
    if (!loopedRef.current) callLoop()
  }

  // 글 안내로 바뀌었으면 기다릴 영상이 없으니 바로 알린다.
  useEffect(() => {
    if (showFallback) callLoopOnce()
  }, [showFallback])

  // 자동 재생이 막혔는지 확인하고, 첫 바퀴가 너무 오래 걸리면 한 번 알린다.
  useEffect(() => {
    if (showFallback) return undefined
    videoRef.current?.play()?.catch?.((error) => {
      // 영상을 바꾸거나 화면을 떠나 재생이 중단된 경우(AbortError)는 막힌 것이 아니다.
      if (error?.name !== 'AbortError') callLoopOnce()
    })
    const timer = setTimeout(callLoopOnce, FIRST_LOOP_MAX_WAIT_MS)
    return () => clearTimeout(timer)
  }, [showFallback])

  // 한 바퀴가 끝나면 알리고, 처음부터 다시 재생한다.
  // (video의 loop 속성을 쓰면 끝나는 순간을 알 수 없어서 직접 다시 튼다)
  const handleEnded = () => {
    callLoop()
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
        playsInline
        preload="auto"
        onEnded={handleEnded}
        onError={() => setFailed(true)}
      />
    </div>
  )
}
