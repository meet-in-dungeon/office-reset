import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// PoC(poc.html)만 따로 빌드하기 위한 설정. 공용 vite.config.js는 건드리지 않는다.
// 사용: npx vite build --config vite.poc.config.js  → 결과물: dist/poc/ (dist는 .gitignore 대상)
export default defineConfig({
  plugins: [react()],
  base: './', // 어떤 주소/하위 경로에 올려도 동작하도록 상대 경로 사용
  build: {
    outDir: 'dist/poc',
    emptyOutDir: true,
    rollupOptions: { input: 'poc.html' },
  },
})
