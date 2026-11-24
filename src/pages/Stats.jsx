// 통계 화면 (담당: 이주연)
// 오늘 완료 여부, 오늘·전체 완료 횟수, 배지(받은 배지 + 아직 못 받은 배지)를 보여준다.
// 기록은 브라우저(localStorage)에 있어서 새로고침해도 유지된다. (src/lib/records.js)
import { useState } from 'react'
import Button from '../components/Button'
import Screen from '../components/Screen'
import { BADGES } from '../lib/badges'
import { getStats } from '../lib/records'
import { navigate, ROUTES } from '../lib/router'
import './Stats.css'

// '2026-11-24T13:05:10' → '11월 24일'
function formatDate(iso) {
  const [, month, day] = String(iso).slice(0, 10).split('-').map(Number)
  return month && day ? `${month}월 ${day}일` : ''
}

function BadgeItem({ badge, earned }) {
  return (
    <li className={`stats-badge${earned ? '' : ' stats-badge--locked'}`}>
      <span className="stats-badge__icon" aria-hidden="true">
        {badge.icon}
      </span>
      <p className="stats-badge__name">{badge.name}</p>
      {earned ? (
        <p className="stats-badge__sub">
          {badge.repeat === 'daily' && earned.count ? `${earned.count}일 달성` : formatDate(earned.unlockedAt)}
        </p>
      ) : (
        <p className="stats-badge__sub">
          <span className="visually-hidden">아직 받지 않음. </span>
          {badge.condition}
        </p>
      )}
    </li>
  )
}

export default function Stats() {
  // 화면에 들어올 때 저장된 기록을 한 번 읽는다.
  const [stats] = useState(() => getStats())
  const earnedById = Object.fromEntries(stats.badges.map((badge) => [badge.id, badge]))
  const earnedCount = stats.badges.length

  return (
    <Screen title="기록·통계">
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
            {earnedCount} / {BADGES.length}
          </span>
        </div>
        <ul className="stats-badges">
          {BADGES.map((badge) => (
            <BadgeItem key={badge.id} badge={badge} earned={earnedById[badge.id]} />
          ))}
        </ul>
      </section>

      <p className="muted stats-note">기록은 이 브라우저에 저장돼요. 브라우저 기록을 지우면 함께 지워져요.</p>

      <Button variant="soft" block onClick={() => navigate(ROUTES.home)}>
        메인으로
      </Button>
    </Screen>
  )
}
