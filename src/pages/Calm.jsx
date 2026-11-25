// 빡침 명상 화면 (담당: 이주연)
// 자연 배경 + 호흡 안내(들이쉬기·내쉬기 3회) + 돌아가기.
// 호흡 3회를 끝까지 마치면 명상 기록(calmLogs)을 남기고, 처음이면 "인간 공기청정기" 배지를 준다.
// 명상을 10회·30회 채우면 실버·골드로 올랐다는 카드를 보여준다.
// 화면에 들어오면 바로 호흡 안내가 시작되고, "돌아가기"는 언제든 누를 수 있다. (중간에 나가면 기록하지 않는다)
import { useEffect, useState } from 'react'
import Button from '../components/Button'
import Screen from '../components/Screen'
import { BREATH_EXHALE_SECONDS, BREATH_INHALE_SECONDS } from '../lib/config'
import { recordCalm } from '../lib/records'
import { navigate, ROUTES } from '../lib/router'
import { nowLocalISO } from '../lib/time'
import { useCalmBgm } from '../lib/bgm'
import './Calm.css'

// 호흡 횟수와 한 번의 길이(초). 호흡 속도는 팀 공통 설정(config.js)을 그대로 쓴다. (이주연 결정, 11/24)
const CALM_BREATH_COUNT = 3
const INHALE_SECONDS = BREATH_INHALE_SECONDS
const EXHALE_SECONDS = BREATH_EXHALE_SECONDS

const DONE_MESSAGE = '마음 공기 정화 완료!'

function BreathingStage({ step }) {
  // step: 0부터 시작. 짝수는 들이쉬기, 홀수는 내쉬기
  const inhale = step % 2 === 0
  const seconds = inhale ? INHALE_SECONDS : EXHALE_SECONDS
  const round = Math.floor(step / 2) + 1

  // 화면이 처음 그려진 직후에 원을 키우기 시작해야 첫 들이쉬기에서도 커지는 모습이 보인다.
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(frame)
  }, [])
  const grow = mounted && inhale

  return (
    <div className="calm-stage">
      <div
        className={`calm-circle ${grow ? 'calm-circle--in' : 'calm-circle--out'}`}
        style={{ transitionDuration: `${seconds}s` }}
        aria-hidden="true"
      >
        <span className="calm-circle__text">{inhale ? '들이쉬기' : '내쉬기'}</span>
      </div>
      <p className="calm-guide" aria-live="polite">
        {inhale ? `코로 천천히 들이쉬어요 (${seconds}초)` : `입으로 길게 내쉬어요 (${seconds}초)`}
      </p>
      <div className="calm-progress" aria-label={`호흡 ${CALM_BREATH_COUNT}번 중 ${round}번째`}>
        {Array.from({ length: CALM_BREATH_COUNT }, (_, index) => (
          <span
            key={index}
            className={`calm-progress__dot${index < round ? ' calm-progress__dot--done' : ''}`}
          />
        ))}
      </div>
    </div>
  )
}

function BadgeCard({ badge, label }) {
  return (
    <div className="card calm-badge">
      <span className="calm-badge__icon" aria-hidden="true">
        {badge.icon}
      </span>
      <div>
        <p className="calm-badge__label">{label}</p>
        <p className="calm-badge__name">
          {badge.name}
          {badge.tierName ? <span className="calm-badge__tier">{badge.tierName}</span> : null}
        </p>
        <p className="muted">
          {badge.count ? `빡침 명상 ${badge.count}회 · ` : ''}
          {badge.message}
        </p>
      </div>
    </div>
  )
}

function DoneStage({ newBadges, tierUps }) {
  return (
    <div className="calm-stage">
      <div className="calm-done" aria-live="polite">
        <span className="calm-done__icon" aria-hidden="true">
          🌿
        </span>
        <p className="calm-done__title">{DONE_MESSAGE}</p>
        <p className="muted">숨 {CALM_BREATH_COUNT}번에 마음이 조금 가벼워졌나요?</p>
        {newBadges.map((badge) => (
          <BadgeCard key={badge.id} badge={badge} label="새 배지" />
        ))}
        {tierUps.map((badge) => (
          <BadgeCard key={badge.id} badge={badge} label={`${badge.tierName}로 올랐어요!`} />
        ))}
      </div>
    </div>
  )
}

export default function Calm() {
  // 이 화면에 들어온 한 번의 명상. 같은 id로 저장해서 두 번 기록되지 않게 한다.
  const [session, setSession] = useState(() => ({ id: `c_${Date.now()}`, startedAt: nowLocalISO() }))
  const [step, setStep] = useState(0)
  const [result, setResult] = useState(null)
useCalmBgm()
  
  const totalSteps = CALM_BREATH_COUNT * 2
  const done = step >= totalSteps

  // 들이쉬기·내쉬기 시간이 지나면 다음 단계로 넘어간다. 마지막 내쉬기가 끝나면 기록을 남긴다.
  useEffect(() => {
    if (done) return undefined
    const seconds = step % 2 === 0 ? INHALE_SECONDS : EXHALE_SECONDS
    const timer = setTimeout(() => {
      const next = step + 1
      if (next >= totalSteps) {
        setResult(recordCalm({ ...session, completedAt: nowLocalISO(), breathCount: CALM_BREATH_COUNT }))
      }
      setStep(next)
    }, seconds * 1000)
    return () => clearTimeout(timer)
  }, [step, done, totalSteps, session])

  function restart() {
    setSession({ id: `c_${Date.now()}`, startedAt: nowLocalISO() })
    setResult(null)
    setStep(0)
  }

  return (
    <Screen title="잠깐 숨 돌리기">
      <div className="calm">
        {done ? <DoneStage newBadges={result?.newBadges ?? []} tierUps={result?.tierUps ?? []} /> : <BreathingStage step={step} />}
      </div>

      <div className="calm-actions">
        {done ? (
          <Button variant="soft" block onClick={restart}>
            한 번 더 하기
          </Button>
        ) : null}
        <Button variant={done ? 'primary' : 'ghost'} block onClick={() => navigate(ROUTES.home)}>
          돌아가기
        </Button>
      </div>
    </Screen>
  )
}
