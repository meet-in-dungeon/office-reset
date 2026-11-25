// 루틴 완료 화면 (담당: 이주연)
// 루틴 종료 후 새로 받은 배지와 완료 안내를 보여주고, "업무 복귀"로 메인에 돌아간다.
// 결과는 원규 님 화면이 recordRoutine()을 부를 때 sessionStorage에 남긴 값을 읽는다. (src/lib/records.js)
// 배지가 여러 개면 카드는 2장까지만 보여주고 나머지는 "+N개 더"로 묶는다.
import { useState } from 'react'
import Asset from '../components/Asset'
import BadgeImage from '../components/BadgeImage'
import Button from '../components/Button'
import { ChevronIcon, MedalIcon } from '../components/Icons'
import Screen from '../components/Screen'
import { clearLastResult, getStats, readLastResult } from '../lib/records'
import { navigate, ROUTES } from '../lib/router'
import { isLastRoutine } from '../lib/schedule'
import './Complete.css'

// 한 번에 보여주는 배지 카드 수. 나머지는 "+N개 더"로 묶는다. (설계안 6장)
const MAX_CARDS = 2

// 카드 순서: 히든 → 등급업(골드 > 실버) → 새 배지 (설계안 6장)
function orderCards(newBadges, tierUps) {
  const cards = [
    ...tierUps.map((badge) => ({ ...badge, kind: 'tierUp' })),
    ...newBadges.map((badge) => ({ ...badge, kind: 'new' })),
  ]
  const rank = (card) => (card.hidden ? 0 : card.kind === 'tierUp' ? 3 - (card.tier ?? 0) : 10)
  return cards.sort((a, b) => rank(a) - rank(b))
}

function cardLabel(card) {
  if (card.hidden) return '히든 배지 발견!'
  if (card.kind === 'tierUp') return `${card.tierName}로 올랐어요!`
  return `새 배지${card.repeat === 'daily' && card.count > 1 ? ` · ${card.count}일째` : ''}`
}

function BadgeCard({ badge, index }) {
  return (
    <li className="complete-badge" style={{ animationDelay: `${index * 0.15}s` }}>
      <p className="complete-badge__label">{cardLabel(badge)}</p>
      <BadgeImage badge={badge} tier={badge.tier} className="complete-badge__icon" />
      <p className="complete-badge__name">
        {badge.name}
        {badge.tierName ? <span className="complete-badge__tier">{badge.tierName}</span> : null}
      </p>
      <p className="complete-badge__message">{badge.message}</p>
    </li>
  )
}

export default function Complete() {
  // 화면에 처음 들어올 때 한 번만 읽는다. 결과가 없으면(주소로 바로 들어옴 등) 저장된 기록으로 안내만 한다.
  const [result] = useState(() => readLastResult())
  const [stats] = useState(() => getStats())
  // 하루 마지막 루틴에서 호흡을 중단한 경우: 호흡 없이 저장됐고(0), 아직 오늘 마지막 루틴이 남아 있다.
  // (원규 님 화면에서 "중단"을 누르면 이 화면으로 온다. 이주연 결정 11/24)
  const [breathStopped] = useState(() => result?.saved === true && result.breathCount === 0 && isLastRoutine())

  const todayCount = result?.todayCount ?? stats.todayCount
  const totalCount = result?.totalCount ?? stats.totalCount
  const cards = orderCards(result?.newBadges ?? [], result?.tierUps ?? [])
  const shown = cards.slice(0, MAX_CARDS)
  const more = cards.length - shown.length

  function leave(route) {
    clearLastResult() // 같은 배지 카드가 다시 뜨지 않게 지운다
    navigate(route)
  }

  return (
    <Screen
      title="루틴 완료!"
      className="complete"
      titleClassName="complete-title"
    >
      <Asset file="sticker-confetti.svg" kind="decor" className="complete-confetti" />
      <section className="complete-hero" aria-live="polite">
        <div className="complete-hero__character">
          <Asset file="character-cheer.webp" size="권장 560×680" alt="축하 캐릭터" />
        </div>
        <p className="bubble complete-hero__bubble">
          <strong className="complete-hero__title">수고했어요!</strong>
          오늘도 한 번 더 리셋 완료!
        </p>
      </section>
      <p className="muted complete-count">
        {todayCount > 0 ? `오늘 ${todayCount}번째 스트레칭을 마쳤어요.` : '스트레칭을 마쳤어요.'}
        {totalCount > 0 ? ` 지금까지 모두 ${totalCount}번 했어요.` : ''}
      </p>
      {breathStopped ? <p className="complete-hero__note">호흡은 다음 루틴에서 다시 할 수 있어요 🌿</p> : null}

      {cards.length > 0 ? (
        <section aria-label="새로 받은 배지">
          <ul className="complete-badges">
            {shown.map((badge, index) => (
              <BadgeCard key={`${badge.id}-${badge.kind}`} badge={badge} index={index} />
            ))}
          </ul>
          {more > 0 ? (
            <button type="button" className="complete-more" onClick={() => leave(ROUTES.stats)}>
              +{more}개 더 받았어요 — 배지함에서 확인
            </button>
          ) : null}
        </section>
      ) : (
        <p className="card complete-empty">오늘도 몸을 챙겼어요. 이 작은 습관이 쌓이고 있어요 🌱</p>
      )}

      <div className="complete-actions">
        <Button block size="large" onClick={() => leave(ROUTES.home)}>
          업무 복귀 <ChevronIcon className="icon" width="18" height="18" />
        </Button>
        <Button variant="soft" block onClick={() => leave(ROUTES.stats)}>
          <MedalIcon className="icon" width="20" height="20" /> 기록·배지 보기
        </Button>
      </div>
    </Screen>
  )
}
