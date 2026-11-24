// 영상·음성 개발용 테스트 페이지의 시작점 (담당: 서진수). 실제 서비스 화면이 아니다.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import '../App.css'
import VideoTest from './VideoTest'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <VideoTest />
  </StrictMode>,
)
