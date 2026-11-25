// 소리 ON/OFF 버튼. 음성·BGM이 나오는 화면(스트레칭, 호흡, 빡침 명상) 오른쪽 위에 둔다. (담당: 김민지)
// 하나의 공통 소리 설정(settings.soundOn)을 켜고 끈다. 브라우저 알림 권한이나 "알림 받기"와는 별개다.
// 설정은 저장되어서 화면을 옮기거나 새로고침해도 유지된다. 실제 소리 제어는 voice.js·bgm.js가 이 설정을 보고 한다.
import { useSettings } from '../lib/settings'
import { VolumeIcon, VolumeOffIcon } from './Icons'

export default function SoundToggle() {
  const [settings, updateSettings] = useSettings()
  const on = settings.soundOn
  return (
    <button
      type="button"
      className={`sound-toggle${on ? ' sound-toggle--on' : ''}`}
      aria-label={on ? '소리 끄기' : '소리 켜기'}
      aria-pressed={on}
      onClick={() => updateSettings({ soundOn: !on })}
    >
      {on ? <VolumeIcon width="24" height="24" /> : <VolumeOffIcon width="24" height="24" />}
    </button>
  )
}
