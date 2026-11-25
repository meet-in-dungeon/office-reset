// 배지 이미지. public/images/badges/<배지ID>.webp (등급형은 <배지ID>-<bronze|silver|gold>.webp) 를 찾고,
// 없으면 기존 이모지를 원 안에 보여준다. 이미지가 전달되면 파일만 넣으면 바뀐다. (담당: 김민지)
// 사용: <BadgeImage badge={badge} tier={earned?.tier} className="..." />
import { useState } from 'react'

const IMAGE_DIR = `${import.meta.env.BASE_URL}images/badges/`
const TIER_SLUGS = ['bronze', 'silver', 'gold']

export default function BadgeImage({ badge, tier, className = '' }) {
  const slug = Array.isArray(badge.tiers) && Number.isInteger(tier) ? `-${TIER_SLUGS[tier] ?? ''}` : ''
  const file = `${badge.id}${slug}.webp`
  const [failedFile, setFailedFile] = useState(null)

  if (failedFile === file) {
    return (
      <span className={`badge-image badge-image--emoji ${className}`} aria-hidden="true">
        {badge.icon}
      </span>
    )
  }
  return (
    <img
      className={`badge-image ${className}`}
      src={`${IMAGE_DIR}${file}`}
      alt=""
      aria-hidden="true"
      draggable="false"
      onError={() => setFailedFile(file)}
    />
  )
}
