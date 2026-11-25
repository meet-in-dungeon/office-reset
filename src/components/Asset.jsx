// 디자이너가 전달하는 이미지(캐릭터·스티커·배경) 자리. (담당: 김민지)
// public/images/ 에 같은 이름의 파일을 넣으면 코드 수정 없이 바로 화면에 나온다.
// 파일이 아직 없으면 fallback을 보여준다.
//   - 캐릭터: 파일 이름과 권장 크기가 적힌 임시 자리 표시 (kind="character", 기본값)
//   - 스티커 같은 장식: 아무것도 보이지 않는다 (kind="decor")
// 파일 목록과 크기는 docs/DESIGN_ASSETS.md
import { useState } from 'react'
import './CharacterMotion.css'

const IMAGE_DIR = `${import.meta.env.BASE_URL}images/`

// 캐릭터 그림별 반복 움직임 (CharacterMotion.css). 여기 없는 그림은 움직이지 않는다.
const MOTION_BY_FILE = {
  'character-main.webp': 'asset--float',
  'character-calm.webp': 'asset--breathe',
  'character-angry.webp': 'asset--fume',
}

export default function Asset({ file, size, kind = 'character', className = '', fallback, alt = '' }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    if (fallback !== undefined) return fallback
    if (kind === 'decor') return null
    return (
      <div className={`asset-placeholder ${className}`} role="img" aria-label={alt || '이미지 준비 중'}>
        <span className="asset-placeholder__file">{file}</span>
        {size ? <span className="asset-placeholder__size">{size}</span> : null}
      </div>
    )
  }

  return (
    <img
      className={`asset ${MOTION_BY_FILE[file] ?? ''} ${className}`}
      src={`${IMAGE_DIR}${file}`}
      alt={alt}
      aria-hidden={alt ? undefined : 'true'}
      draggable="false"
      onError={() => setFailed(true)}
    />
  )
}
