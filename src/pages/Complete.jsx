// 루틴 완료 화면 (담당: 이주연)
// 루틴 종료 후 새로 받은 배지와 완료 안내를 보여주고, "업무 복귀"로 메인에 돌아간다.
// 결과는 원규 님 화면이 recordRoutine()을 부를 때 sessionStorage에 남긴 값을 읽는다. (src/lib/records.js)
import { useState } from 'react'
import Button from '../components/Button'
import Screen from '../components/Screen'
import { clearLastResult, getStats, readLastResult } from '../lib/records'
import { navigate, ROUTES } from '../lib/router'
import './Complete.css'

function BadgeCard({ badge, index }) {
  return (
    <li className="complete-badge" style={{ animationDelay: `${index * 0.15}s` }}>
      <span className="complete-badge__icon" aria-hidden="true">
        {badge.icon}
      </span>
      <div className="complete-badge__text">
        <p className="complete-badge__label">
          새 배지{badge.repeat === 'daily' && badge.count > 1 ? ` · ${badge.count}일째` : ''}
        </p>
        <p className="complete-badge__name">{badge.name}</p>
        <p className="complete-badge__message">{badge.message}</p>
      </div>
    </li>
  )
}

export default function Complete() {
  // 화면에 처음 들어올 때 한 번만 읽는다. 결과가 없으면(주소로 바로 들어옴 등) 저장된 기록으로 안내만 한다.
  const [result] = useState(() => readLastResult())
  const [stats] = useState(() => getStats())

  const todayCount = result?.todayCount ?? stats.todayCount
  const totalCount = result?.totalCount ?? stats.totalCount
  const newBadges = result?.newBadges ?? []

  function leave(route) {
    clearLastResult() // 같은 배지 카드가 다시 뜨지 않게 지운다
    navigate(route)
  }

  return (
    <Screen title="루틴 완료">
      <section className="complete-hero" aria-live="polite">
        <span className="complete-hero__icon" aria-hidden="true">
          🎉
        </span>
        <p className="complete-hero__title">수고했어요!</p>
        <p className="muted">
          {todayCount > 0 ? `오늘 ${todayCount}번째 스트레칭을 마쳤어요.` : '스트레칭을 마쳤어요.'}
          {totalCount > 0 ? ` 지금까지 모두 ${totalCount}번 했어요.` : ''}
        </p>
      </section>

      {newBadges.length > 0 ? (
        <section aria-label="새로 받은 배지">
          <ul className="complete-badges">
            {newBadges.map((badge, index) => (
              <BadgeCard key={badge.id} badge={badge} index={index} />
            ))}
          </ul>
        </section>
      ) : (
        <p className="card complete-empty">오늘도 몸을 챙겼어요. 이 작은 습관이 쌓이고 있어요 🌱</p>
      )}

      <div className="complete-actions">
        <Button block size="large" onClick={() => leave(ROUTES.home)}>
          업무 복귀
        </Button>
        <Button variant="soft" block onClick={() => leave(ROUTES.stats)}>
          기록·배지 보기
        </Button>
      </div>
    </Screen>
  )
}
