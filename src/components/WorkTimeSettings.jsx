// 업무 시간 설정 (출근·퇴근·점심시간·알림 주기). 온보딩과 메인 설정에서 함께 쓴다.
// 값을 바꾸면 바로 저장되고, 바뀐 값으로 계산한 하루 알림 시각을 아래에 보여준다.
import { useState } from 'react'
import { getAlertTimes, validateWorkTime } from '../lib/alertTimes'
import { useSettings } from '../lib/settings'

const INTERVAL_OPTIONS = [30, 45, 60, 90, 120]

export default function WorkTimeSettings() {
  const [settings, updateSettings] = useSettings()
  const times = getAlertTimes(settings)

  // 올바르지 않은 값(예: 퇴근이 출근보다 빠름)은 저장하지 않고 안내만 보여준다.
  const [error, setError] = useState('')
  function change(patch) {
    const message = validateWorkTime({ ...settings, ...patch })
    setError(message)
    if (!message) updateSettings(patch)
  }

  return (
    <div className="stack">
      <div className="field-row">
        <label className="field">
          <span className="muted">출근</span>
          <input
            className="input"
            type="time"
            value={settings.workStart}
            onChange={(event) => change({ workStart: event.target.value })}
          />
        </label>
        <label className="field">
          <span className="muted">퇴근</span>
          <input
            className="input"
            type="time"
            value={settings.workEnd}
            onChange={(event) => change({ workEnd: event.target.value })}
          />
        </label>
      </div>

      <label className="check">
        <input
          type="checkbox"
          checked={settings.lunchEnabled}
          onChange={(event) => change({ lunchEnabled: event.target.checked })}
        />
        점심시간에는 알림 쉬기
      </label>
      {settings.lunchEnabled ? (
        <div className="field-row">
          <label className="field">
            <span className="muted">점심 시작</span>
            <input
              className="input"
              type="time"
              value={settings.lunchStart}
              onChange={(event) => change({ lunchStart: event.target.value })}
            />
          </label>
          <label className="field">
            <span className="muted">점심 끝</span>
            <input
              className="input"
              type="time"
              value={settings.lunchEnd}
              onChange={(event) => change({ lunchEnd: event.target.value })}
            />
          </label>
        </div>
      ) : null}

      <label className="field">
        <span className="muted">알림 주기 (보통 1시간마다 해요)</span>
        <select
          className="input"
          value={settings.intervalMin}
          onChange={(event) => change({ intervalMin: Number(event.target.value) })}
        >
          {INTERVAL_OPTIONS.map((min) => (
            <option key={min} value={min}>
              {min}분마다
            </option>
          ))}
        </select>
      </label>

      {error ? (
        <p role="alert" className="error">
          {error}
        </p>
      ) : (
        <p className="muted">
          하루 알림 {times.length}번 · {times.join(', ') || '없음'}
          <br />
          마지막 알림({times[times.length - 1] ?? '-'})의 루틴에는 호흡이 함께 나와요.
        </p>
      )}
    </div>
  )
}
