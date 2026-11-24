// 브라우저 알림 권한 요청과 상태 안내, 테스트 알림. 온보딩과 메인 설정에서 함께 쓴다.
// 권한이 없어도 서비스는 쓸 수 있다. (앱 안 안내가 대신 뜬다)
import { useEffect, useState } from 'react'
import {
  getNotificationPermission,
  requestNotificationPermission,
  sendTestAlert,
} from '../lib/alerts'
import Button from './Button'

export default function NotificationPermission() {
  const [permission, setPermission] = useState(getNotificationPermission)
  const [testing, setTesting] = useState(false)

  // 브라우저 사이트 설정에서 권한을 바꾸고 돌아왔을 때 화면 값을 최신으로 맞춘다.
  useEffect(() => {
    const sync = () => setPermission(getNotificationPermission())
    window.addEventListener('focus', sync)
    document.addEventListener('visibilitychange', sync)
    return () => {
      window.removeEventListener('focus', sync)
      document.removeEventListener('visibilitychange', sync)
    }
  }, [])

  async function allow() {
    setPermission(await requestNotificationPermission())
  }

  function test() {
    setTesting(true)
    sendTestAlert(5)
    window.setTimeout(() => setTesting(false), 6000)
  }

  if (permission === 'unsupported') {
    return <p className="muted">이 브라우저는 알림을 지원하지 않아요. 알림 시각에는 화면 안에서 알려 드려요.</p>
  }

  if (permission === 'granted') {
    return (
      <div className="stack">
        <p className="muted">브라우저 알림이 켜져 있어요. 다른 탭이나 프로그램을 쓰는 중에도 알려 드려요.</p>
        <Button variant="soft" onClick={test} disabled={testing}>
          {testing ? '5초 뒤에 알림이 와요. 다른 탭으로 이동해 보세요' : '알림 테스트'}
        </Button>
      </div>
    )
  }

  if (permission === 'denied') {
    return (
      <p className="muted">
        브라우저에서 알림이 차단되어 있어요. 주소창 왼쪽 아이콘 → 사이트 설정 → 알림을 "허용"으로 바꾼 뒤 새로고침해 주세요.
        차단된 동안에는 화면 안에서 알려 드려요.
      </p>
    )
  }

  return (
    <div className="stack">
      <p className="muted">다른 탭이나 프로그램을 쓰는 중에도 알림을 받으려면 허용해 주세요.</p>
      <Button variant="soft" onClick={allow}>
        브라우저 알림 허용하기
      </Button>
    </div>
  )
}
