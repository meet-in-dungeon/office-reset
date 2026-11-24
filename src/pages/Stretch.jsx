// 스트레칭 루틴 화면 (담당: 김원규. 영상 재생·음성은 서진수)
// 흐름: (알림으로 들어오면 큰 시작 버튼) → 동작 ROUTINE_MOVE_COUNT개(5초 카운트, "다음" 버튼)
//       → (하루 마지막 루틴이면) 5초 호흡 → 완료 화면
// 알림으로 들어오면 주소가 #/stretch?from=notification 이 된다. (useRoute().query.from)
import { useCallback, useEffect, useRef, useState } from 'react'
import Button from '../components/Button'
import Screen from '../components/Screen'
import data from '../data/stretches.json'
import { MOVE_SECONDS, ROUTINE_MOVE_COUNT, START_GATE_ENABLED, STORAGE_KEYS } from '../lib/config'
import { planRoutine, saveShownIds } from '../lib/pickMoves'
import { navigate, ROUTES, useRoute } from '../lib/router'
import { getSettings } from '../lib/settings'
import { readJSON } from '../lib/storage'
import { nowLocalISO, todayLocal } from '../lib/time'
import './Stretch.css'

// 하루 마지막 루틴에서만 나오는 호흡. 실제 호흡 시간보다 "5초 호흡"이라는 간단한 인식이 목적이다.
const BREATH_SECONDS = 5
const BREATH_IN_SECONDS = 4 // 앞 4초는 들이쉬세요, 마지막 1초는 내쉬세요 문구
const BREATH_IN_TEXT = '4초간 들이쉬세요'
const BREATH_OUT_TEXT = '편안하게 내쉬세요'

// 카운트가 끝나기 전에도 "다음"을 누를 수 있게 할지. (팀 미확정, 지금은 끝나야 누를 수 있다)
// true로 바꾸면 카운트 중에 누른 동작이 skippedMoves에 센다.
const ALLOW_EARLY_NEXT = false

// "하루의 마지막 루틴"인지 알아낸다. 기준: 하루 알림 횟수 설정의 마지막 회차.
// 하루 알림 횟수 설정(settings.dailyRoutineCount)은 아직 팀 설정에 없다. (김민지 확인 필요)
// 값이 없으면 마지막 루틴이 아닌 것으로 본다. 시험·시연용으로 주소에 ?last=1 을 붙이면 마지막 루틴으로 본다.
function checkLastRoutineOfDay(lastQuery) {
  if (lastQuery === '1') return true
  const dailyCount = getSettings().dailyRoutineCount
  if (!Number.isInteger(dailyCount) || dailyCount < 1) return false
  const logs = readJSON(STORAGE_KEYS.routineLogs, [])
  const today = todayLocal()
  const doneToday = Array.isArray(logs)
    ? logs.filter((log) => log?.completed !== false && String(log?.completedAt ?? '').startsWith(today))
        .length
    : 0
  return doneToday + 1 >= dailyCount
}

// 루틴 기록을 이주연 님의 기록 저장·배지 지급 함수에 넘기는 자리. (함수 이름과 전달 방식은 두 분이 정한다)
// TODO: 주연 님 함수가 정해지면 아래에서 그 함수를 부른다.
function submitRoutineRecord(record) {
  console.info('루틴 기록 (주연 님 함수 연결 전)', record)
}

export default function Stretch() {
  const { query } = useRoute()
  const fromNotification = query.from === 'notification'

  // 이번 루틴의 동작 고르기와 마지막 루틴 여부는 화면이 열릴 때 한 번만 정한다.
  const [plan] = useState(() => planRoutine(data.stretches, ROUTINE_MOVE_COUNT))
  const [isLastRoutine] = useState(() => checkLastRoutineOfDay(query.last))
  const moves = plan.moves

  const [stage, setStage] = useState(START_GATE_ENABLED && fromNotification ? 'start' : 'move')
  const [index, setIndex] = useState(0)
  const [remaining, setRemaining] = useState(MOVE_SECONDS)
  const startedAtRef = useRef(null)
  const skippedRef = useRef(0)
  const doneRef = useRef(false)

  const finish = useCallback(
    (breathSeconds) => {
      if (doneRef.current) return
      doneRef.current = true
      submitRoutineRecord({
        id: `r_${Date.now()}`,
        parts: [...new Set(moves.map((m) => m.part))],
        moves: moves.map((m) => m.id),
        breathSeconds,
        startedAt: startedAtRef.current ?? nowLocalISO(),
        completedAt: nowLocalISO(),
        completed: true,
        skippedMoves: skippedRef.current,
        fromNotification,
      })
      navigate(ROUTES.complete)
    },
    [moves, fromNotification],
  )

  // 첫 동작이 보이기 시작하면 시작 시각을 적고, 이번에 나온 동작을 기억한다.
  useEffect(() => {
    if (stage === 'move' && index === 0) {
      startedAtRef.current ??= nowLocalISO()
      saveShownIds(plan.shownIds)
    }
  }, [stage, index, plan])

  // 동작 화면 또는 호흡 화면에서 1초씩 줄어드는 카운트
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

  if (stage === 'start') {
    return (
      <Screen title="스트레칭">
        <div className="stretch-start">
          <Button size="large" block onClick={() => setStage('move')}>
            시작
          </Button>
          <p className="stretch-caution">{data.commonCaution}</p>
        </div>
      </Screen>
    )
  }

  if (stage === 'breath') {
    const breathingIn = BREATH_SECONDS - remaining < BREATH_IN_SECONDS
    return (
      <Screen title="호흡">
        <div className="stretch-breath">
          <p className="stretch-breath__text">{breathingIn ? BREATH_IN_TEXT : BREATH_OUT_TEXT}</p>
          <p className="stretch-count" aria-live="polite">
            {remaining}
          </p>
        </div>
      </Screen>
    )
  }

  const move = moves[index]
  const isLastMove = index === moves.length - 1
  const countDone = remaining === 0

  const handleNext = () => {
    if (!countDone) skippedRef.current += 1
    if (!isLastMove) {
      setIndex(index + 1)
      setRemaining(MOVE_SECONDS)
    } else if (isLastRoutine) {
      setStage('breath')
      setRemaining(BREATH_SECONDS)
    } else {
      finish(0)
    }
  }

  return (
    <Screen title="스트레칭">
      <div className="stretch-move">
        <p className="stretch-progress">
          {index + 1} / {moves.length} · {data.parts[move.part]}
        </p>
        <h2 className="stretch-name">{move.name}</h2>

        <div className="stretch-video-slot">영상 준비 중이에요. 아래 설명을 따라 해 주세요.</div>

        <ol className="stretch-steps">
          {move.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>

        <p className="stretch-count" aria-live="polite">
          {countDone ? '완료' : remaining}
        </p>

        <ul className="stretch-cautions">
          {move.cautions.map((caution) => (
            <li key={caution}>{caution}</li>
          ))}
        </ul>
        <p className="stretch-caution">{data.commonCaution}</p>

        <Button block onClick={handleNext} disabled={!countDone && !ALLOW_EARLY_NEXT}>
          {isLastMove && !isLastRoutine ? '마치기' : '다음'}
        </Button>
      </div>
    </Screen>
  )
}
