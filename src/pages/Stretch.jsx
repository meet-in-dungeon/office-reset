// 스트레칭 루틴 화면 (담당: 김원규. 영상 재생·음성은 서진수)
// 흐름: (알림으로 들어오면 큰 시작 버튼) → 동작 ROUTINE_MOVE_COUNT개(5초 카운트, "다음" 버튼)
//       → (하루 마지막 루틴이면) 호흡 BREATH_COUNT회 → 완료 화면
// 알림으로 들어오면 주소가 #/stretch?from=notification 이 된다. (useRoute().query.from)
import { useCallback, useEffect, useRef, useState } from 'react'
import Asset from '../components/Asset'
import Button from '../components/Button'
import BreathCircle from '../components/BreathCircle'
import CountRing, { CountAccent } from '../components/CountRing'
import { AlertIcon, ChevronIcon, PlayIcon } from '../components/Icons'
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
import StretchVideo from '../components/StretchVideo'
import { useStretchVoice } from '../lib/voice'
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

// 카운트다운 상태별 안내 문구와 화면 낭독용 설명 (준비 → 진행 → 완료)
const COUNT_CAPTIONS = {
  prepare: '동작을 먼저 봐주세요',
  run: '지금 따라 해 보세요!',
  done: '잘했어요!',
}
const COUNT_LABELS = {
  prepare: () => '준비 중',
  run: (remaining) => `${remaining}초 남았어요`,
  done: () => '완료',
}

// 카운트가 끝나기 전에도 "다음"을 눌러 동작을 넘길 수 있다. (확정)
// 카운트 중에 누른 동작은 skippedMoves에 센다.
const ALLOW_EARLY_NEXT = true

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
  // 동작 하나의 진행 순서 (2026-11-26 팀 결정): 음성 안내와 영상이 동시에 시작 → 음성 종료 + 영상 최소 1회 재생이 모두 끝나면 5초 카운트다운.
  // 영상은 카운트 중에도 계속 반복한다. 소리가 꺼져 있으면 음성 단계는 바로 끝나므로 영상 1회가 끝난 뒤 카운트가 시작된다.
  // 둘 다 끝나야(moveReady) 카운트가 시작되고, 그 전에는 "준비" 상태다. 동작이 바뀔 때마다 처음부터 다시 한다.
  const [voiceDone, setVoiceDone] = useState(false)
  const [videoDone, setVideoDone] = useState(false)
  const moveReady = voiceDone && videoDone
  const startedAtRef = useRef(null)
  const skippedRef = useRef(0)
  const doneRef = useRef(false)
  // 영상·음성 (서진수): 동작이 바뀌면 안내 문장, 카운트마다 숫자를 읽는다    
  const currentMove = moves[index]
  useStretchVoice({
    id: currentMove?.id,
    narration: currentMove?.narration,
    remaining,
    active: stage === 'move',
    onDone: () => setVoiceDone(true), // 소리 꺼짐·읽기 실패도 "끝"으로 알려 준다
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

  // 동작 화면(준비가 끝난 뒤) 또는 호흡 화면에서 1초씩 줄어드는 카운트
  useEffect(() => {
    if (stage === 'move' ? !moveReady : stage !== 'breath') return undefined
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
  }, [stage, index, moveReady])

  // 호흡은 정해진 횟수가 끝나면 저절로 마친다. (동작은 버튼을 눌러야 넘어간다.)
  useEffect(() => {
    if (stage === 'breath' && remaining === 0) finish(true)
  }, [stage, remaining, finish])

  if (stage === 'start') {
    return (
      <Screen title="스트레칭" align="center" className="stretch-screen">
        <div className="stretch-start">
          <div className="stretch-start__character">
            <Asset file="character-main.webp" size="권장 560×660" alt="안내 캐릭터" />
          </div>
          <p className="stretch-start__copy">잠깐, 몸 풀기 좋은 타이밍이에요!</p>
          <Button size="large" block onClick={() => setStage('move')}>
            <PlayIcon className="icon" width="18" height="18" /> 시작
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
      <Screen title="호흡" align="center" className="stretch-screen stretch-screen--breath">
        <div className="stretch-breath">
          <BreathCircle
            breathingIn={breathingIn}
            seconds={breathingIn ? BREATH_IN_SECONDS : BREATH_OUT_SECONDS}
            left={phaseLeft}
          />
          <p className="stretch-breath__text" aria-live="polite">
            {breathingIn ? BREATH_IN_TEXT : BREATH_OUT_TEXT}
          </p>
          <p className="stretch-progress">
            <span className="stretch-progress__now">{cycle + 1}</span> / {BREATH_COUNT}회
          </p>
          <div className="stretch-breath__dots" aria-hidden="true">
            {Array.from({ length: BREATH_COUNT }, (_, i) => (
              <span key={i} className={`stretch-breath__dot${i <= cycle ? ' stretch-breath__dot--on' : ''}`} />
            ))}
          </div>
          {/* 호흡은 넘기기가 아니라 중단이다. 호흡을 마치지 못했으니 breathCount는 0으로 기록하고 완료 화면으로 간다.
              (동작 3개는 마쳤으므로 루틴 기록은 저장되고, 하루 완성 배지는 호흡을 마친 루틴에서만 나간다.) */}
          <Button variant="soft" className="stretch-breath__stop" onClick={() => finish(false)}>
            중단
          </Button>
        </div>
      </Screen>
    )
  }

  const move = moves[index]
  const isLastMove = index === moves.length - 1
  const countDone = remaining === 0
  // 카운트다운 세 상태: 준비(음성·영상 1회 진행 중) → 진행(5초) → 완료
  const countState = countDone ? 'done' : moveReady ? 'run' : 'prepare'

  const handleNext = () => {
    if (!countDone) skippedRef.current += 1
    if (!isLastMove) {
      setIndex(index + 1)
      setRemaining(MOVE_SECONDS)
      setVoiceDone(false)
      setVideoDone(false)
    } else if (isLastRoutine) {
      setStage('breath')
      setRemaining(BREATH_TOTAL_SECONDS)
    } else {
      finish(false)
    }
  }

  return (
    <Screen title="스트레칭" align="center" className="stretch-screen">
      <div className="stretch-move">
        <div className="stretch-head">
          <p className="stretch-progress">
            <span className="stretch-progress__now">{index + 1}</span> / {moves.length}
          </p>
          <h2 className="stretch-name">
            <span className="stretch-name__label">
              {data.parts[move.part]} · {move.name}
            </span>
          </h2>
        </div>

        <StretchVideo
          key={move.id}
          file={move.videoFile}
          name={move.name}
          playing
          onFirstPlayEnd={() => setVideoDone(true)}
        />

        <div className={`stretch-count stretch-count--${countState}`}>
          <div className="stretch-count__ring" role="status" aria-label={COUNT_LABELS[countState](remaining)}>
            {countState === 'run' ? (
              <Asset
                file="sticker-accent.svg"
                kind="decor"
                className="stretch-count__sticker stretch-count__sticker--left"
                fallback={<CountAccent side="left" />}
              />
            ) : null}
            <CountRing ratio={countState === 'run' ? remaining / MOVE_SECONDS : 1} state={countState}>
              {countState === 'prepare' ? '준비' : String(remaining).padStart(2, '0')}
            </CountRing>
            {countState === 'run' ? (
              <Asset
                file="sticker-accent.svg"
                kind="decor"
                className="stretch-count__sticker stretch-count__sticker--right"
                fallback={<CountAccent side="right" />}
              />
            ) : null}
          </div>
          <p className="stretch-count__caption" aria-live="polite">
            {COUNT_CAPTIONS[countState]}
          </p>
        </div>

        <ol className="stretch-steps">
          {move.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>

        <div className="stretch-notice">
          <AlertIcon className="icon" width="22" height="22" />
          <div>
            <ul className="stretch-cautions">
              {move.cautions.map((caution) => (
                <li key={caution}>{caution}</li>
              ))}
            </ul>
            <p className="stretch-caution">{data.commonCaution}</p>
          </div>
        </div>

        <Button size="large" block onClick={handleNext} disabled={!countDone && !ALLOW_EARLY_NEXT}>
          {isLastMove && !isLastRoutine ? '마치기' : '다음'} <ChevronIcon className="icon" width="18" height="18" />
        </Button>
      </div>
    </Screen>
  )
}
