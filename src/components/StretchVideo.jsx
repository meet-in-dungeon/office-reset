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
import { useState } from 'react'
import './StretchVideo.css'

const VIDEO_DIR = `${import.meta.env.BASE_URL}videos/`

// 영상별 화면 맞춤. 16:9 원본을 4:3 상자에 채울 때 어디를 보여줄지(x, y: %)와 확대 비율(scale)을 정한다.
// 비워 두면 가운데·확대 없음. 동작(팔·손·머리)이 잘리면 scale을 줄이거나 x를 옮긴다. 예: 'neck-01.mp4': { x: 55, y: 40, scale: 1.1 }
const VIDEO_FRAMING = {}

export default function StretchVideo({ file, name }) {
  const [failed, setFailed] = useState(false)

  if (!file || failed) {
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
        style={framingStyle}
        src={`${VIDEO_DIR}${file}`}
        aria-label={name ? `${name} 동작 영상` : '스트레칭 동작 영상'}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onError={() => setFailed(true)}
      />
    </div>
  )
}
