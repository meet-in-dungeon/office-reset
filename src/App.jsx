// 화면 연결. 주소(#/...)에 맞는 화면을 보여준다. (공통 파일: 고치기 전에 팀에 알린다)
// 새 화면이 필요하면 아래 PAGES에 한 줄 추가한다. 각 화면의 내용은 src/pages/ 파일에서 담당자가 만든다.
import { useEffect } from 'react'
import './App.css'
import { navigate, ROUTES, useRoute } from './lib/router'
import { useSettings } from './lib/settings'
import Calm from './pages/Calm'
import Complete from './pages/Complete'
import Main from './pages/Main'
import Onboarding from './pages/Onboarding'
import Stats from './pages/Stats'
import Stretch from './pages/Stretch'

const PAGES = {
  [ROUTES.home]: Main,
  [ROUTES.onboarding]: Onboarding,
  [ROUTES.stretch]: Stretch,
  [ROUTES.complete]: Complete,
  [ROUTES.calm]: Calm,
  [ROUTES.stats]: Stats,
}

export default function App() {
  const { path } = useRoute()
  const [settings] = useSettings()

  // 처음 접속(온보딩 전)이면 메인 대신 온보딩으로 보낸다.
  // 다른 화면 주소로 직접 들어온 경우는 그대로 보여준다. (개발 중에 각자 화면을 바로 열 수 있게)
  useEffect(() => {
    if (path === ROUTES.home && !settings.onboarded) {
      navigate(ROUTES.onboarding, undefined, { replace: true })
    }
  }, [path, settings.onboarded])

  const Page = PAGES[path] ?? Main

  return (
    <div className="app">
      <Page />
    </div>
  )
}
