import { useCallback, useEffect, useRef, useState } from 'react'
import data from '../data/stretches.json'
import './StretchRoutine.css'

// 시작 화면 방식. 팀에서 다르게 정하면 이 값만 바꾼다.
//   'startButton': 큰 "시작" 버튼 화면을 먼저 보여 준다.
//   'direct'     : 부품이 뜨면 바로 첫 동작을 보여 준다.
const ENTRY_MODE = 'startButton'

const COUNT_SECONDS = data.countSeconds // 동작마다 카운트 (5초)
const BREATH_SECONDS = 5 // 하루 마지막 루틴의 호흡 길이 (5초)
const BREATH_IN_SECONDS = 2 // 5초 중 앞 2초는 들이쉬기, 나머지는 내쉬기 (시작값)

function toLocalIsoString(date) {
  const pad = (n) => String(n).padStart(2, '0')
  const offsetMin = -date.getTimezoneOffset()
  const sign = offsetMin >= 0 ? '+' : '-'
  const abs = Math.abs(offsetMin)
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}` +
    `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`
  )
}

/**
 * 스트레칭 루틴 화면.
 *
 * props
 * - moves: 이번 루틴에 보여 줄 동작 목록 (stretches.json의 항목, 보통 3개)
 * - isLastRoutineOfDay: 하루의 마지막 루틴이면 true. true일 때만 5초 호흡을 보여 준다.
 * - onComplete(result): 루틴을 끝까지 마치면 한 번만 호출한다.
 *     result = { completedAt, parts, moveIds, breathSeconds }
 *
 * 이 부품은 화면 이동, 기록 저장, 배지 지급을 하지 않는다.
 */
export default function StretchRoutine({ moves, isLastRoutineOfDay = false, onComplete }) {
  const [stage, setStage] = useState(ENTRY_MODE === 'startButton' ? 'start' : 'move')
  const [index, setIndex] = useState(0)
  const [remaining, setRemaining] = useState(COUNT_SECONDS)
  const completedRef = useRef(false)

  const finish = useCallback(
    (breathSeconds) => {
      if (completedRef.current) return
      completedRef.current = true
      const parts = [...new Set(moves.map((m) => m.part))]
      onComplete?.({
        completedAt: toLocalIsoString(new Date()),
        parts,
        moveIds: moves.map((m) => m.id),
        breathSeconds,
      })
    },
    [moves, onComplete],
  )

  // 동작 화면 또는 호흡 화면에 들어올 때마다 1초씩 줄어드는 카운트를 시작한다.
  useEffect(() => {
    if (stage !== 'move' && stage !== 'breath') return undefined
    const timer = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [stage, index])

  // 호흡은 5초가 끝나면 저절로 마친다. (동작은 버튼을 눌러야 넘어간다.)
  useEffect(() => {
    if (stage === 'breath' && remaining === 0) finish(BREATH_SECONDS)
  }, [stage, remaining, finish])

  if (!moves || moves.length === 0) {
    return <p className="routine-message">보여 줄 동작이 없어요.</p>
  }

  if (stage === 'start') {
    return (
      <section className="routine routine-start">
        <button type="button" className="routine-start-button" onClick={() => setStage('move')}>
          시작
        </button>
        <p className="routine-caution">{data.commonCaution}</p>
      </section>
    )
  }

  if (stage === 'breath') {
    const elapsed = BREATH_SECONDS - remaining
    const breathingIn = elapsed < BREATH_IN_SECONDS
    return (
      <section className="routine routine-breath">
        <p className="routine-progress">호흡</p>
        <h2 className="routine-title">{breathingIn ? '들이쉬세요' : '내쉬세요'}</h2>
        <p className="routine-count" aria-live="polite">
          {remaining}
        </p>
      </section>
    )
  }

  const move = moves[index]
  const isLastMove = index === moves.length - 1
  const countDone = remaining === 0

  const handleNext = () => {
    if (!isLastMove) {
      setIndex(index + 1)
      setRemaining(COUNT_SECONDS)
    } else if (isLastRoutineOfDay) {
      setStage('breath')
      setRemaining(BREATH_SECONDS)
    } else {
      finish(0)
    }
  }

  return (
    <section className="routine routine-move">
      <p className="routine-progress">
        {index + 1} / {moves.length} · {data.parts[move.part]}
      </p>
      <h2 className="routine-title">{move.name}</h2>

      <div className="routine-video-slot">영상 준비 중이에요. 아래 설명을 따라 해 주세요.</div>

      <ol className="routine-steps">
        {move.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>

      <div className="routine-count-box">
        <p className="routine-count" aria-live="polite">
          {countDone ? '완료' : remaining}
        </p>
      </div>

      <ul className="routine-cautions">
        {move.cautions.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
      <p className="routine-caution">{data.commonCaution}</p>

      <button
        type="button"
        className="routine-next-button"
        onClick={handleNext}
        disabled={!countDone}
      >
        {isLastMove && !isLastRoutineOfDay ? '마치기' : '다음'}
      </button>
    </section>
  )
}
