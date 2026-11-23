import { useCallback, useEffect, useRef, useState } from 'react'

// 기술 검증(PoC) 전용 페이지입니다. 실제 서비스 UI가 아닙니다.
// 접속 주소: /poc.html (npm run dev 실행 후)

const OPTIONS = [
  { label: '10초 테스트', seconds: 10 },
  { label: '1분 테스트', seconds: 60 },
]

const isSupported = typeof window !== 'undefined' && 'Notification' in window

function formatTime(ms) {
  const total = Math.ceil(Math.max(ms, 0) / 1000)
  const m = String(Math.floor(total / 60)).padStart(2, '0')
  const s = String(total % 60).padStart(2, '0')
  return `${m}:${s}`
}

function nowLabel() {
  return new Date().toLocaleTimeString('ko-KR', { hour12: false })
}

export default function TimerNotificationPoc() {
  const [permission, setPermission] = useState(
    isSupported ? Notification.permission : 'unsupported',
  )
  const [duration, setDuration] = useState(10)
  const [remainingMs, setRemainingMs] = useState(10 * 1000)
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const [logs, setLogs] = useState([])
  const [lastError, setLastError] = useState('')

  const endAtRef = useRef(0)
  const timeoutRef = useRef(null)
  const intervalRef = useRef(null)

  const addLog = useCallback((text) => {
    setLogs((prev) => [`[${nowLabel()}] ${text}`, ...prev].slice(0, 30))
  }, [])

  const clearTimers = useCallback(() => {
    clearTimeout(timeoutRef.current)
    clearInterval(intervalRef.current)
  }, [])

  // Chrome 사이트 설정에서 권한을 바꾸고 돌아왔을 때 화면 값을 최신으로 맞춘다.
  useEffect(() => {
    if (!isSupported) return undefined
    const sync = () => setPermission(Notification.permission)
    window.addEventListener('focus', sync)
    document.addEventListener('visibilitychange', sync)
    return () => {
      window.removeEventListener('focus', sync)
      document.removeEventListener('visibilitychange', sync)
    }
  }, [])

  // 언마운트 시 타이머 정리
  useEffect(() => clearTimers, [clearTimers])

  const showNotification = useCallback(() => {
    if (!isSupported || Notification.permission !== 'granted') {
      addLog('알림 권한이 없어 브라우저 알림은 보내지 않았습니다. (화면 내 안내만 표시)')
      return
    }
    try {
      const n = new Notification('타이머 종료', {
        body: `${duration}초 타이머가 끝났어요. 클릭하면 서비스 탭으로 돌아갑니다.`,
        tag: `office-reset-poc-timer-${Date.now()}`, // 같은 tag면 이전 알림을 조용히 교체할 수 있어 매번 다르게
      })
      n.onshow = () => addLog('Chrome이 타이머 알림을 표시했다고 보고함 (show 이벤트)')
      n.onerror = () => addLog('타이머 알림 표시 중 error 이벤트 발생')
      n.onclick = () => {
        window.focus() // 알림 클릭 시 이 탭으로 이동
        n.close()
        addLog('알림을 클릭해서 탭으로 돌아왔습니다.')
      }
      addLog(`브라우저 알림 발생 (탭 상태: ${document.visibilityState})`)
    } catch (e) {
      addLog(`알림 생성 실패: ${e.message}`)
    }
  }, [addLog, duration])

  const finish = useCallback(() => {
    clearTimers()
    setRunning(false)
    setFinished(true)
    setRemainingMs(0)
    addLog(`타이머 종료 (탭 상태: ${document.visibilityState})`)
    showNotification()
  }, [addLog, clearTimers, showNotification])

  const start = () => {
    clearTimers()
    const ms = duration * 1000
    endAtRef.current = Date.now() + ms
    setRemainingMs(ms)
    setFinished(false)
    setRunning(true)
    addLog(`${duration}초 타이머 시작`)

    // 남은 시간은 "종료 시각 - 현재 시각"으로 계산해서,
    // 백그라운드 탭에서 interval이 느려져도 시간이 틀어지지 않게 한다.
    intervalRef.current = setInterval(() => {
      setRemainingMs(Math.max(endAtRef.current - Date.now(), 0))
    }, 250)
    timeoutRef.current = setTimeout(finish, ms)
  }

  const reset = () => {
    clearTimers()
    setRunning(false)
    setFinished(false)
    setRemainingMs(duration * 1000)
    addLog('타이머 초기화')
  }

  const selectDuration = (seconds) => {
    setDuration(seconds)
    setRemainingMs(seconds * 1000)
    setFinished(false)
  }

  const requestPermission = async () => {
    if (!isSupported) return
    const result = await Notification.requestPermission()
    setPermission(result)
    addLog(`알림 권한 결과: ${result}`)
  }

  const sendTestNotification = () => {
    setLastError('')
    if (!isSupported) {
      const msg = '이 브라우저는 Notification API를 지원하지 않습니다.'
      setLastError(msg)
      addLog(msg)
      return
    }
    // 화면에 저장된 값이 아니라 브라우저의 현재 권한 값을 다시 읽는다.
    setPermission(Notification.permission)
    addLog(`테스트 알림 버튼 클릭 (현재 권한: ${Notification.permission})`)
    if (Notification.permission !== 'granted') {
      const msg = `권한이 '${Notification.permission}' 상태라 알림을 보낼 수 없습니다. (Chrome 사이트 권한 문제)`
      setLastError(msg)
      addLog(msg)
      return
    }
    try {
      const n = new Notification('테스트 알림', {
        body: '이 알림을 클릭하면 서비스 탭으로 돌아옵니다.',
        tag: `office-reset-poc-test-${Date.now()}`, // 같은 tag면 조용히 교체될 수 있어 매번 다르게
      })
      n.onshow = () => addLog('Chrome이 알림을 표시했다고 보고함 (show 이벤트)')
      n.onerror = () => {
        const msg = '알림 표시 중 error 이벤트 발생'
        setLastError(msg)
        addLog(msg)
      }
      n.onclose = () => addLog('알림이 닫힘 (close 이벤트)')
      n.onclick = () => {
        window.focus()
        n.close()
        addLog('테스트 알림을 클릭해서 탭으로 돌아왔습니다.')
      }
      addLog('new Notification() 호출 성공 (오류 없음)')
    } catch (e) {
      const msg = `알림 생성 오류: ${e.name}: ${e.message}`
      setLastError(msg)
      addLog(msg)
    }
  }

  return (
    <main style={{ maxWidth: 520, margin: '32px auto', padding: 16, fontFamily: 'sans-serif', lineHeight: 1.5 }}>
      <h1>타이머·알림 PoC</h1>
      <p style={{ color: '#666' }}>기술 검증용 임시 페이지입니다. (실제 서비스 화면 아님)</p>

      <section>
        <h2>1. 알림 권한</h2>
        <p>
          현재 권한: <strong>{permission}</strong>
        </p>
        {permission === 'unsupported' && (
          <p role="alert" style={{ color: '#b00020' }}>
            이 브라우저는 알림 기능을 지원하지 않습니다.
          </p>
        )}
        {permission === 'denied' && (
          <p role="alert" style={{ color: '#b00020' }}>
            알림이 차단되어 있습니다. 브라우저 주소창 왼쪽의 자물쇠(사이트 설정)에서 알림을
            &quot;허용&quot;으로 바꾼 뒤 새로고침해 주세요. 그동안은 이 화면 안에서만 종료를 알려드립니다.
          </p>
        )}
        {permission === 'granted' && <p style={{ color: '#0a7a2f' }}>알림이 허용되었습니다.</p>}
        <button type="button" onClick={requestPermission} disabled={permission === 'unsupported' || permission === 'granted'}>
          알림 권한 요청
        </button>{' '}
        <button type="button" onClick={sendTestNotification}>
          즉시 테스트 알림
        </button>
        {lastError && (
          <p role="alert" style={{ color: '#b00020' }}>
            오류: {lastError}
          </p>
        )}
        <h3>진단 정보</h3>
        <ul style={{ fontSize: 13, paddingLeft: 18 }}>
          <li>Notification API 지원: {isSupported ? '예' : '아니오'}</li>
          <li>Notification.permission (현재값): {isSupported ? Notification.permission : 'unsupported'}</li>
          <li>화면 상태값: {permission}</li>
          <li>보안 컨텍스트(HTTPS/localhost): {window.isSecureContext ? '예' : '아니오'}</li>
          <li>주소: {window.location.origin}</li>
          <li>iframe 안에서 실행 중: {window.top !== window.self ? '예 (알림 불가 가능)' : '아니오'}</li>
          <li>브라우저: {navigator.userAgent}</li>
        </ul>
      </section>

      <section>
        <h2>2. 업무 타이머</h2>
        <div>
          {OPTIONS.map((o) => (
            <button
              key={o.seconds}
              type="button"
              onClick={() => selectDuration(o.seconds)}
              disabled={running}
              aria-pressed={duration === o.seconds}
              style={{ fontWeight: duration === o.seconds ? 'bold' : 'normal', marginRight: 8 }}
            >
              {o.label}
            </button>
          ))}
        </div>
        <p style={{ fontSize: 48, margin: '16px 0' }} aria-live="off">
          {formatTime(remainingMs)}
        </p>
        <button type="button" onClick={start} disabled={running}>
          시작
        </button>{' '}
        <button type="button" onClick={reset}>
          초기화
        </button>
        {finished && (
          <p role="status" style={{ color: '#0a7a2f', fontWeight: 'bold' }}>
            ⏰ 타이머가 끝났습니다! (화면 내 알림)
          </p>
        )}
      </section>

      <section>
        <h2>3. 로그</h2>
        <ul style={{ fontSize: 13, paddingLeft: 18 }}>
          {logs.length === 0 && <li>아직 기록이 없습니다.</li>}
          {logs.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ul>
      </section>
    </main>
  )
}
