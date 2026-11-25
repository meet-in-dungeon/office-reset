// 배지 이미지. public/images/badges/<배지ID>.webp (등급형은 <배지ID>-<bronze|silver|gold>.webp) 를 찾고,
// 없으면 기존 이모지를 원 안에 보여준다. 이미지 자체에 메달 틀과 리본이 들어 있어서 따로 원형 배경·테두리를 두지 않는다. (담당: 김민지)
// 사용: <BadgeImage badge={badge} tier={earned?.tier} className="..." />
import { useState } from 'react'

const IMAGE_DIR = `${import.meta.env.BASE_URL}images/badges/`
const TIER_SLUGS = ['bronze', 'silver', 'gold']

export default function BadgeImage({ badge, tier, className = '' }) {
  // 등급형 배지는 등급별 이미지(-bronze/-silver/-gold). 아직 못 받은 배지(tier 없음)는 첫 등급(브론즈) 이미지를 흐리게 보여준다.
  const slug = Array.isArray(badge.tiers) ? `-${TIER_SLUGS[Number.isInteger(tier) ? tier : 0] ?? 'bronze'}` : ''
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
