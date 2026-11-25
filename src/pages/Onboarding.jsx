// 온보딩 화면 (담당: 김민지)
// 구성: 텍스트 로고 · 메인 카피 · 히어로(캐릭터·장식) · '이렇게 쓰세요' 안내 카드 · 설정 카드 · 하단 시작하기 버튼.
// 시안 기준으로 배치하고, 시작하기 버튼은 메인 화면의 노란 버튼 스타일(Main.css)을 그대로 재사용한다.
// 설정 카드(업무 시간, 알림 권한)와 주의 카드는 기존 기능이므로 그대로 둔다.
import Asset from '../components/Asset'
import Button from '../components/Button'
import Screen from '../components/Screen'
import NotificationPermission from '../components/NotificationPermission'
import WorkTimeSettings from '../components/WorkTimeSettings'
import { navigate, ROUTES } from '../lib/router'
import { updateSettings } from '../lib/settings'
import '../pages/Main.css' // 시작하기 버튼 스타일 재사용 (.home-actions .home-cta--stretch)
import './Onboarding.css'

const STEPS = [
  '정해진 시각(평일)에 알림이 오면 눌러서 스트레칭을 시작해요.',
  '동작 3개를 5초씩 따라 해요. 하루의 마지막 루틴에는 호흡 5회가 붙어요.',
  '루틴을 마치면 배지를 받고, 통계에서 기록을 볼 수 있어요.',
]

export default function Onboarding() {
  function start() {
    updateSettings({ onboarded: true })
    navigate(ROUTES.home)
  }

  return (
    <Screen
      className="onboarding"
      title={<Asset file="logo-text-only.png" kind="decor" alt="잠깐만 휴식" className="onboarding-logo" />}
      titleClassName="onboarding-logo-title"
    >
      <section className="onboarding-intro" aria-label="서비스 소개">
        <h2 className="onboarding-copy">
          업무 중에도 잠깐,
          <br />
          몸과 마음을 <span className="onboarding-copy__hl">휴식</span> 시켜요!
        </h2>
        <p className="onboarding-desc">
          스트레칭과 호흡으로 뻐근함은 풀고,
          <br />
          집중력은 다시 채우세요.
        </p>

        <div className="onboarding-hero">
          <Asset file="lavender-cloud-bg.png" kind="decor" className="onboarding-wave" />
          <Asset file="rays-yellow.png" kind="decor" className="onboarding-deco onboarding-deco--rays-yellow" />
          <Asset file="rays-pink.png" kind="decor" className="onboarding-deco onboarding-deco--rays-pink" />
          <Asset file="star-blue.png" kind="decor" className="onboarding-deco onboarding-deco--star-blue" />
          <Asset file="star-orange.png" kind="decor" className="onboarding-deco onboarding-deco--star-orange" />
          <Asset file="sparkle-yellow-pair.png" kind="decor" className="onboarding-deco onboarding-deco--sparkle-pair" />
          <Asset file="motion-puff.svg" kind="decor" className="onboarding-deco onboarding-deco--puff" />
          <div className="onboarding-hero__character">
            <Asset file="character-welcome.webp" size="권장 720×900" alt="안내 캐릭터" />
          </div>
        </div>
      </section>

      <div className="onboarding-guide">
        <div className="onboarding-guide__badge">
          <Asset file="onboarding-howto-sticker.png" kind="decor" alt="이렇게 쓰세요" className="onboarding-guide__sticker" />
          <Asset file="rays-pink.png" kind="decor" className="onboarding-guide__rays" />
        </div>
        <ol className="onboarding-steps">
          {STEPS.map((text, index) => (
            <li key={text}>
              <span className="onboarding-steps__num" aria-hidden="true">{index + 1}</span>
              <span className="onboarding-steps__text">{text}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="card">
        <strong className="section-title">언제 알려 드릴까요?</strong>
        <p className="muted" style={{ marginBottom: 'var(--space-3)' }}>
          출근 시각부터 정해진 주기마다 알려 드려요. 나중에 바꿀 수 있어요.
        </p>
        <WorkTimeSettings />
      </div>

      <div className="card">
        <strong className="section-title">알림을 받아 볼까요?</strong>
        <p className="muted" style={{ marginBottom: 'var(--space-3)' }}>
          허용하지 않아도 쓸 수 있어요. 이 화면 안에서 알려 드려요.
        </p>
        <NotificationPermission />
      </div>

      <div className="card onboarding-caution">
        <strong className="section-title">주의해 주세요</strong>
        <p className="muted">
          통증이 느껴지면 바로 멈추고 무리하지 마세요. 몸에 이상이 있다면 전문가와 상담해 주세요.
        </p>
      </div>

      <div className="onboarding-start">
        <div className="home-actions">
          <Button size="large" block className="home-cta home-cta--stretch" onClick={start}>
            <span>시작하기</span>
            <Asset file="icon-play.png" kind="decor" className="home-cta__icon" />
            <Asset file="sparkle.svg" kind="decor" className="home-cta__spark" />
          </Button>
        </div>
      </div>
    </Screen>
  )
}
