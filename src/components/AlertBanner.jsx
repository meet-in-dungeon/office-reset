// 알림 시각이 되면 화면 위쪽에 뜨는 안내. 브라우저 알림 권한이 없어도 알림을 놓치지 않게 한다.
// 스트레칭 화면에서는 보이지 않는다.
import { dismissPendingAlert, startRoutineFromAlert, usePendingAlert } from '../lib/alerts'
import { ROUTES, useRoute } from '../lib/router'
import Asset from './Asset'
import Button from './Button'
import { BellIcon, PlayIcon } from './Icons'

export default function AlertBanner() {
  const pending = usePendingAlert()
  const { path } = useRoute()
  if (!pending || path === ROUTES.stretch) return null

  return (
    <div className="alert-banner" role="alert">
      <Asset file="sticker-accent.svg" kind="decor" className="alert-banner__sticker" />
      <span className="alert-banner__icon">
        <BellIcon />
      </span>
      <p className="alert-banner__text">
        <strong>스트레칭 할 시간이에요</strong>
        <span className="muted">잠깐 몸을 풀고 올까요?</span>
      </p>
      <div className="alert-banner__actions">
        <Button variant="ghost" onClick={dismissPendingAlert}>
          나중에
        </Button>
        <Button onClick={startRoutineFromAlert}>
          시작 <PlayIcon className="icon" width="14" height="14" />
        </Button>
      </div>
    </div>
  )
}
