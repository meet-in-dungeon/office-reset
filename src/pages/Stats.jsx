// 통계 화면 (담당: 이주연)
// [요약] 오늘 완료 여부, 오늘·전체 완료 횟수, 배지함(받은 배지 + 아직 못 받은 배지 + 히든)
// [이번 주] 상세 통계: 평일 연속 기록, 요일별 횟수, 부위별 횟수, 시간대별 횟수, 빡침 명상 횟수 (월~금)
// 기록은 브라우저(localStorage)에 있어서 새로고침해도 유지된다. (src/lib/records.js)
// 발표용 시연 모드: 주소를 #/stats?demo=1 로 열면 맨 아래에 "샘플 기록 채우기", "기록 초기화" 버튼이 보인다.
import { useState } from 'react'
import Button from '../components/Button'
import Screen from '../components/Screen'
import { BADGES, TIER_NAMES } from '../lib/badges'
import { fillDemoRecords, getStats, getWeeklyStats, PART_NAMES, resetRecords } from '../lib/records'
import { navigate, ROUTES, useRoute } from '../lib/router'
import './Stats.css'

// '2026-11-24T13:05:10' → '11월 24일'
function formatDate(iso) {
  const [, month, day] = String(iso).slice(0, 10).split('-').map(Number)
  return month && day ? `${month}월 ${day}일` : ''
}

// 배지 아래 작은 글자: 다음 등급까지 남은 값, 또는 받은 날짜, 또는 조건
function badgeSub(badge, earned, value) {
  const unit = badge.tierUnit ?? '회'
  if (earned && Array.isArray(badge.tiers)) {
    const next = badge.tiers[earned.tier + 1]
    if (next === undefined) return `${earned.count ?? value}${unit} 달성`
    return `${TIER_NAMES[earned.tier + 1]}까지 ${Math.max(next - value, 1)}${unit}`
  }
  if (earned) return formatDate(earned.unlockedAt)
  if (Array.isArray(badge.tiers)) return `${badge.condition} · ${value}/${badge.tiers[0]}`
  return badge.condition
}

function BadgeItem({ badge, earned, value }) {
  // 히든 배지는 받기 전까지 이름 대신 ???와 힌트만 보여준다
  if (badge.hidden && !earned) {
    return (
      <li className="stats-badge stats-badge--locked">
        <span className="stats-badge__icon" aria-hidden="true">
          ❔
        </span>
        <p className="stats-badge__name">???</p>
        <p className="stats-badge__sub">
          <span className="visually-hidden">숨겨진 배지. 힌트: </span>
          {badge.hint}
        </p>
      </li>
    )
  }

  return (
    <li className={`stats-badge${earned ? '' : ' stats-badge--locked'}`}>
      <span className="stats-badge__icon" aria-hidden="true">
        {badge.icon}
      </span>
      <p className="stats-badge__name">{badge.name}</p>
      {earned?.tierName ? <p className="stats-badge__tier">{earned.tierName}</p> : null}
      <p className="stats-badge__sub">
        {earned ? null : <span className="visually-hidden">아직 받지 않음. </span>}
        {badgeSub(badge, earned, value)}
      </p>
    </li>
  )
}

function SummaryTab({ stats }) {
  const earnedById = Object.fromEntries(stats.badges.map((badge) => [badge.id, badge]))
  return (
    <>
      <section className={`card stats-today${stats.todayDone ? ' stats-today--done' : ''}`}>
        <span className="stats-today__icon" aria-hidden="true">
          {stats.todayDone ? '✅' : '⏳'}
        </span>
        <div>
          <p className="stats-today__title">{stats.todayDone ? '오늘 스트레칭 완료!' : '오늘은 아직이에요'}</p>
          <p className="muted">
            {stats.todayDone ? '오늘도 나를 챙겼어요.' : '알림이 오면 15초만 같이 움직여요.'}
          </p>
        </div>
      </section>

      <section className="stats-numbers" aria-label="완료 횟수">
        <div className="card stats-number">
          <p className="muted">오늘</p>
          <p className="stats-number__value">
            {stats.todayCount}
            <span className="stats-number__unit">회</span>
          </p>
        </div>
        <div className="card stats-number">
          <p className="muted">지금까지</p>
          <p className="stats-number__value">
            {stats.totalCount}
            <span className="stats-number__unit">회</span>
          </p>
        </div>
      </section>

      <section className="card" aria-label="배지">
        <div className="stats-badges__header">
          <strong>배지</strong>
          <span className="muted">
            {stats.badges.length} / {BADGES.length}
          </span>
        </div>
        <ul className="stats-badges">
          {BADGES.map((badge) => (
            <BadgeItem key={badge.id} badge={badge} earned={earnedById[badge.id]} value={stats.progress[badge.id] ?? 0} />
          ))}
        </ul>
      </section>
    </>
  )
}

// 받침이 있으면 '을', 없으면 '를' (목을, 허리를)
function objectParticle(word) {
  const code = word.charCodeAt(word.length - 1) - 0xac00
  return code >= 0 && code <= 11171 && code % 28 !== 0 ? '을' : '를'
}

// 가로 막대 한 줄 (부위별·시간대별)
function BarRow({ label, value, max, sub }) {
  const width = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <li className="stats-bar">
      <span className="stats-bar__label">{label}</span>
      <span className="stats-bar__track" aria-hidden="true">
        <span className="stats-bar__fill" style={{ width: `${width}%` }} />
      </span>
      <span className="stats-bar__value">{sub ?? `${value}`}</span>
    </li>
  )
}

function WeekTab({ week, todayDone }) {
  const dayMax = Math.max(...week.days.map((d) => d.count), 1)
  const partEntries = Object.entries(PART_NAMES).map(([part, name]) => [name, week.parts[part] ?? 0])
  const partMax = Math.max(...partEntries.map(([, v]) => v), 1)
  const leastPart = week.moveCount > 0 ? partEntries.reduce((a, b) => (b[1] < a[1] ? b : a))[0] : null
  const timeRows = [
    ['오전', '12시 전', week.times.morning],
    ['점심 후', '12~15시', week.times.afternoon],
    ['오후', '15시부터', week.times.evening],
  ]
  const timeMax = Math.max(...timeRows.map(([, , t]) => t.routine + t.calm), 1)
  const todayIsWeekday = week.days.some((d) => d.isToday)

  return (
    <>
      <section className="card stats-streak" aria-label="평일 연속 기록">
        <span className="stats-today__icon" aria-hidden="true">
          🔥
        </span>
        <div>
          <p className="stats-today__title">평일 {week.streak.current}일 연속</p>
          <p className="muted">
            {todayIsWeekday && !todayDone
              ? `오늘 하면 ${week.streak.current + 1}일째! · 최고 ${week.streak.best}일`
              : `최고 기록 ${week.streak.best}일 · 주말은 쉬어도 끊기지 않아요`}
          </p>
        </div>
      </section>

      <section className="card" aria-label="요일별 횟수">
        <div className="stats-badges__header">
          <strong>이번 주 스트레칭</strong>
          <span className="muted">{week.weekCount}회</span>
        </div>
        <ul className="stats-week">
          {week.days.map((d) => (
            <li key={d.day} className={`stats-week__day${d.isToday ? ' stats-week__day--today' : ''}`}>
              <span className="stats-week__count">{d.count}</span>
              <span className="stats-week__track" aria-hidden="true">
                <span className="stats-week__fill" style={{ height: `${Math.round((d.count / dayMax) * 100)}%` }} />
              </span>
              <span className="stats-week__label">
                {d.label}
                <span className="visually-hidden">요일 {d.count}회</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card" aria-label="부위별 횟수">
        <div className="stats-badges__header">
          <strong>부위별 동작</strong>
          <span className="muted">{week.moveCount}개</span>
        </div>
        <ul className="stats-bars">
          {partEntries.map(([name, value]) => (
            <BarRow key={name} label={name} value={value} max={partMax} />
          ))}
        </ul>
        {leastPart ? (
          <p className="muted stats-tip">
            이번 주에는 {leastPart}
            {objectParticle(leastPart)} 조금 더 챙겨 볼까요?
          </p>
        ) : null}
      </section>

      <section className="card" aria-label="시간대별 횟수">
        <div className="stats-badges__header">
          <strong>시간대별</strong>
          <span className="muted">스트레칭 · 빡침</span>
        </div>
        <ul className="stats-bars">
          {timeRows.map(([label, range, t]) => (
            <BarRow
              key={label}
              label={
                <>
                  {label}
                  <span className="stats-bar__range">{range}</span>
                </>
              }
              value={t.routine + t.calm}
              max={timeMax}
              sub={`${t.routine} · ${t.calm}`}
            />
          ))}
        </ul>
      </section>

      <section className="card stats-today" aria-label="빡침 명상">
        <span className="stats-today__icon" aria-hidden="true">
          😤
        </span>
        <div>
          <p className="stats-today__title">이번 주 빡침 명상 {week.calmCount}번</p>
          <p className="muted">{week.calmCount > 0 ? '화를 숨으로 바꿨어요.' : '화날 땐 메인의 빡침 버튼을 눌러 보세요.'}</p>
        </div>
      </section>
    </>
  )
}

// 시연 모드 패널. 버튼을 누르면 기록을 바꾸고 화면을 새로 읽는다.
function DemoPanel() {
  function fill() {
    fillDemoRecords()
    window.location.reload()
  }
  function reset() {
    if (!window.confirm('기록, 배지, 빡침 명상 기록을 모두 지울까요? (설정은 남아요)')) return
    resetRecords()
    window.location.reload()
  }
  return (
    <section className="card stats-demo" aria-label="시연 모드">
      <strong>🎬 시연 모드</strong>
      <p className="muted stats-tip">
        샘플 기록은 지난 3주 평일 기록과 빡침 명상 9번이에요. 오늘과 해커톤 기간은 비워 둬서, 지금 루틴을 하면 숨겨진 배지가
        나와요.
      </p>
      <div className="stats-demo__actions">
        <Button variant="soft" block onClick={fill}>
          샘플 기록 채우기
        </Button>
        <Button variant="ghost" block onClick={reset}>
          기록 초기화
        </Button>
      </div>
    </section>
  )
}

const TABS = [
  { id: 'summary', label: '요약' },
  { id: 'week', label: '이번 주' },
]

export default function Stats() {
  // 화면에 들어올 때 저장된 기록을 한 번 읽는다.
  const [stats] = useState(() => getStats())
  const [week] = useState(() => getWeeklyStats())
  const [tab, setTab] = useState('summary')
  const { query } = useRoute()
  const demo = query.demo === '1'

  return (
    <Screen title="기록·통계">
      <div className="stats-tabs" role="tablist" aria-label="통계 보기">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`stats-tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`stats-panel-${t.id}`}
            className={`stats-tab${tab === t.id ? ' stats-tab--active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="stats-panel" role="tabpanel" id={`stats-panel-${tab}`} aria-labelledby={`stats-tab-${tab}`}>
        {tab === 'summary' ? <SummaryTab stats={stats} /> : <WeekTab week={week} todayDone={stats.todayDone} />}
      </div>

      <p className="muted stats-note">기록은 이 브라우저에 저장돼요. 브라우저 기록을 지우면 함께 지워져요.</p>

      <Button variant="soft" block onClick={() => navigate(ROUTES.home)}>
        메인으로
      </Button>

      {demo ? <DemoPanel /> : null}
    </Screen>
  )
}
