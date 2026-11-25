// 온보딩 화면 (담당: 김민지)
// 1차: 서비스 소개 + 업무 시간·알림 주기 설정 한 장. 3페이지 완성(프롤로그·알림 설정·사용 가이드/주의사항)은 2차.
// 위쪽 소개 영역(카피+캐릭터) 아래에 설정 카드가 이어지고, 시작하기 버튼은 화면 아래에 붙어 있다.
import Asset from '../components/Asset'
import Button from '../components/Button'
import { PlayIcon } from '../components/Icons'
import Screen from '../components/Screen'
import NotificationPermission from '../components/NotificationPermission'
import WorkTimeSettings from '../components/WorkTimeSettings'
import { navigate, ROUTES } from '../lib/router'
import { updateSettings } from '../lib/settings'
import './Onboarding.css'

export default function Onboarding() {
  function start() {
    updateSettings({ onboarded: true })
    navigate(ROUTES.home)
  }

  return (
    <Screen
      className="onboarding"
      title={
        <span className="brand">
          삭신이 쑤신다<span className="brand__tag">(가제)</span>
        </span>
      }
    >
      <section className="onboarding-hero" aria-label="서비스 소개">
        <h2 className="onboarding-hero__copy">
          업무 중에도
          <br />
          잠깐, 몸과 마음을
          <br />
          <span className="highlight">리셋</span> 해요!
        </h2>
        <p className="onboarding-hero__desc">
          스트레칭과 호흡으로 뻐근함은 풀고,
          <br />
          집중력은 다시 채우세요.
        </p>
        <div className="onboarding-hero__character">
          <Asset file="sticker-accent.svg" kind="decor" className="onboarding-hero__sticker" />
          <Asset file="character-welcome.webp" size="권장 720×900 (표시 약 260×330)" alt="안내 캐릭터" />
        </div>
      </section>

      <div className="card">
        <strong className="section-title">이렇게 쓰세요</strong>
        <ol className="onboarding-steps">
          <li>정해진 시각(평일)에 알림이 오면 눌러서 스트레칭을 시작해요.</li>
          <li>동작 3개를 5초씩 따라 해요. 하루의 마지막 루틴에는 호흡 5회가 붙어요.</li>
          <li>루틴을 마치면 배지를 받고, 통계에서 기록을 볼 수 있어요.</li>
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
        <Button size="large" block onClick={start}>
          시작하기 <PlayIcon className="icon" width="16" height="16" />
        </Button>
      </div>
    </Screen>
  )
}
