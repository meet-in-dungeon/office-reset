// 스트레칭 루틴 화면 (담당: 김원규. 영상 재생·음성은 서진수)
// 흐름: (알림으로 들어오면 큰 시작 버튼) → 동작 ROUTINE_MOVE_COUNT개(영상이 한 바퀴 돌고 음성이 끝나면 5초 카운트, "다음" 버튼)
//       → (하루 마지막 루틴이면) 호흡 BREATH_COUNT회 → 완료 화면
// 알림으로 들어오면 주소가 #/stretch?from=notification 이 된다. (useRoute().query.from)
import { useCallback, useEffect, useRef, useState } from 'react'
import Button from '../components/Button'
import Screen from '../components/Screen'
import data from '../data/stretches.json'
import { getLastNotifiedAt } from '../lib/alerts'
import {
  BREATH_COUNT,
  BREATH_EXHALE_SECONDS,
  BREATH_INHALE_SECONDS,
  MOVE_SECONDS,
  ROUTINE_MOVE_COUNT,
  START_GATE_ENABLED,
} from '../lib/config'
import { planRoutine, saveShownIds } from '../lib/pickMoves'
import { recordRoutine } from '../lib/records'
import { navigate, ROUTES, useRoute } from '../lib/router'
import { isLastRoutine } from '../lib/schedule'
import { useSettings } from '../lib/settings'
import StretchVideo from '../components/StretchVideo'
import { isSpeechSupported, useStretchVoice } from '../lib/voice'
import { useStretchBgm } from '../lib/bgm'
import { nowLocalISO } from '../lib/time'
import './Stretch.css'

// 하루 마지막 루틴에서만 나오는 호흡. 횟수와 1회 길이는 공통 설정(config.js)을 따른다.
// 빡침 명상 화면도 같은 값을 쓰므로 두 화면의 호흡 속도가 맞는다. (1회 길이는 들이쉬기 4초 + 내쉬기 4초로 확정)
const BREATH_IN_SECONDS = BREATH_INHALE_SECONDS
const BREATH_OUT_SECONDS = BREATH_EXHALE_SECONDS
const BREATH_CYCLE_SECONDS = BREATH_IN_SECONDS + BREATH_OUT_SECONDS
const BREATH_TOTAL_SECONDS = BREATH_COUNT * BREATH_CYCLE_SECONDS
const BREATH_IN_TEXT = `${BREATH_IN_SECONDS}초간 들이쉬세요`
const BREATH_OUT_TEXT = '편안하게 내쉬세요'

// 카운트가 끝나기 전에도 "다음"을 눌러 동작을 넘길 수 있다. (확정)
// 카운트 중에 누른 동작은 skippedMoves에 센다.
const ALLOW_EARLY_NEXT = true

// 동작마다 영상이 한 바퀴 돌고(onLoop) 안내 음성이 끝나면(onEnd) 그때 5초 카운트를 시작한다. (진수 님과 합의)
// 영상은 무한 반복이라 먼저 한 바퀴를 보여 주고 나서 카운트해야 따라 하기 쉽다.
// 신호가 오지 않아도 멈춰 있지 않도록, 이 시간(초)이 지나면 카운트를 시작한다. (영상 최대 길이 23.5초보다 길게)
const MAX_WAIT_SECONDS = 30

// "하루의 마지막 루틴"인지 알아낸다. 판정은 민지 님의 isLastRoutine()이 한다.
// (마지막 알림 시각 이후에 시작한 루틴이고, 오늘 아직 호흡을 하지 않았으면 true)
// 시험·시연용으로 주소에 ?last=1 을 붙이면 항상 마지막 루틴으로 본다.
function checkLastRoutineOfDay(lastQuery) {
  return lastQuery === '1' || isLastRoutine()
}

export default function Stretch() {
  const { query } = useRoute()
  const fromNotification = query.from === 'notification'

  // 이번 루틴의 동작 고르기와 마지막 루틴 여부는 화면이 열릴 때 한 번만 정한다.
  const [plan] = useState(() => planRoutine(data.stretches, ROUTINE_MOVE_COUNT))
  const [isLastRoutine] = useState(() => checkLastRoutineOfDay(query.last))
  // 알림이 뜬 시각: 알림으로 들어왔을 때만, 화면이 열릴 때 한 번 읽는다. (루틴 도중 새 알림이 떠도 바뀌지 않게)
  const [notifiedAt] = useState(() => (fromNotification ? getLastNotifiedAt() : null))
  const moves = plan.moves

  const [stage, setStage] = useState(START_GATE_ENABLED && fromNotification ? 'start' : 'move')
  const [index, setIndex] = useState(0)
  const [remaining, setRemaining] = useState(MOVE_SECONDS)
  const startedAtRef = useRef(null)
  const skippedRef = useRef(0)
  const doneRef = useRef(false)
  // 영상·음성 (서진수): 동작이 바뀌면 안내 문장을 한 번 읽는다
  const currentMove = moves[index]
  const moveId = currentMove?.id

  // 카운트 시작 조건: 음성이 끝났고(소리가 꺼졌거나 못 읽으면 바로 끝난 것), 영상이 한 바퀴 돌았을 때(영상이 없으면 바로)
  // "어느 동작의 신호인지"를 id로 기억해서, 동작이 바뀐 뒤 늦게 오는 이전 동작의 신호는 무시한다.
  const [settings] = useSettings()
  const voiceExpected = settings.soundOn && isSpeechSupported()
  const [voiceDoneId, setVoiceDoneId] = useState(null)
  const [loopDoneId, setLoopDoneId] = useState(null)
  const [expiredId, setExpiredId] = useState(null)
  const voiceDone = !voiceExpected || voiceDoneId === moveId
  const loopDone = !currentMove?.videoFile || loopDoneId === moveId
  const ready = (voiceDone && loopDone) || expiredId === moveId
  const waiting = stage === 'move' && !ready

  useStretchVoice({
    id: moveId,
    narration: currentMove?.narration,
    active: stage === 'move',
    onEnd: () => setVoiceDoneId(moveId),
  })
useStretchBgm(stage === 'move' || stage === 'breath')
  const finish = useCallback(
    (breathed) => {
      if (doneRef.current) return
      doneRef.current = true
      // 루틴 기록 저장과 배지 지급은 이주연 님의 recordRoutine이 한다. 루틴당 한 번만 부른다.
      recordRoutine({
        id: `r_${Date.now()}`,
        moves: moves.map((m) => m.id), // 부위는 ID 앞부분(neck-01의 neck)으로 알 수 있어 parts는 넣지 않는다.
        // 호흡 칸: 일반 루틴 0, 마지막 루틴(호흡 5회를 마친 경우) 5 (주연 님 기록 형식)
        breathCount: breathed ? BREATH_COUNT : 0,
        startedAt: startedAtRef.current ?? nowLocalISO(),
        completedAt: nowLocalISO(),
        completed: true,
        skippedMoves: skippedRef.current,
        fromNotification,
        notifiedAt, // 알림 없이 시작했으면 null
      })
      navigate(ROUTES.complete)
    },
    [moves, fromNotification, notifiedAt],
  )

  // 첫 동작이 보이기 시작하면 시작 시각을 적고, 이번에 나온 동작을 기억한다.
  useEffect(() => {
    if (stage === 'move' && index === 0) {
      startedAtRef.current ??= nowLocalISO()
      saveShownIds(plan.shownIds)
    }
  }, [stage, index, plan])

  // 동작 화면 또는 호흡 화면에서 1초씩 줄어드는 카운트. 동작은 영상 한 바퀴와 음성이 끝난 뒤(ready)에 시작한다.
  useEffect(() => {
    if (stage !== 'move' && stage !== 'breath') return undefined
    if (stage === 'move' && !ready) return undefined
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
  }, [stage, index, ready])

  // 신호가 끝내 오지 않는 경우를 위한 안전장치
  useEffect(() => {
    if (stage !== 'move' || ready) return undefined
    const timer = setTimeout(() => setExpiredId(moveId), MAX_WAIT_SECONDS * 1000)
    return () => clearTimeout(timer)
  }, [stage, ready, moveId])

  // 호흡은 정해진 횟수가 끝나면 저절로 마친다. (동작은 버튼을 눌러야 넘어간다.)
  useEffect(() => {
    if (stage === 'breath' && remaining === 0) finish(true)
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
    const elapsed = BREATH_TOTAL_SECONDS - remaining
    const cycle = Math.min(Math.floor(elapsed / BREATH_CYCLE_SECONDS), BREATH_COUNT - 1)
    const withinCycle = elapsed - cycle * BREATH_CYCLE_SECONDS
    const breathingIn = withinCycle < BREATH_IN_SECONDS
    const phaseLeft = breathingIn
      ? BREATH_IN_SECONDS - withinCycle
      : BREATH_CYCLE_SECONDS - withinCycle
    return (
      <Screen title="호흡">
        <div className="stretch-breath">
          <p className="stretch-progress">
            {cycle + 1} / {BREATH_COUNT}회
          </p>
          <p className="stretch-breath__text">{breathingIn ? BREATH_IN_TEXT : BREATH_OUT_TEXT}</p>
          <p className="stretch-count" aria-live="polite">
            {phaseLeft}
          </p>
          {/* 호흡은 넘기기가 아니라 중단이다. 호흡을 마치지 못했으니 breathCount는 0으로 기록하고 완료 화면으로 간다.
              (동작 3개는 마쳤으므로 루틴 기록은 저장되고, 하루 완성 배지는 호흡을 마친 루틴에서만 나간다.) */}
          <Button variant="ghost" onClick={() => finish(false)}>
            중단
          </Button>
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
      setRemaining(BREATH_TOTAL_SECONDS)
    } else {
      finish(false)
    }
  }

  return (
    <Screen title="스트레칭">
      <div className="stretch-move">
        <p className="stretch-progress">
          {index + 1} / {moves.length} · {data.parts[move.part]}
        </p>
        <h2 className="stretch-name">{move.name}</h2>

        <StretchVideo
          key={move.id}
          file={move.videoFile}
          name={move.name}
          onLoop={() => setLoopDoneId(move.id)}
        />

        <ol className="stretch-steps">
          {move.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>

        <p className={`stretch-count${waiting ? ' stretch-count--wait' : ''}`} aria-live="polite">
          {waiting ? '영상을 보고 따라 해 보세요' : countDone ? '완료' : remaining}
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
