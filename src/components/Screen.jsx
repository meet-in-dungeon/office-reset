// 모든 화면의 공통 틀. 제목(title)과 본문(children)을 받는다.
// headerRight: 제목 줄 오른쪽에 둘 것 (예: 메인 화면의 빡침 버튼)
export default function Screen({ title, headerRight, children }) {
  return (
    <main className="screen">
      <header className="screen__header">
        <h1 className="screen__title">{title}</h1>
        {headerRight ? <div style={{ marginLeft: 'auto' }}>{headerRight}</div> : null}
      </header>
      <div className="screen__body">{children}</div>
    </main>
  )
}
