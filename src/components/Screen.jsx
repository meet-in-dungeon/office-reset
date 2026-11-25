// 모든 화면의 공통 틀. 제목(title)과 본문(children)을 받는다.
// headerRight: 제목 줄 오른쪽에 둘 것 (예: 메인 화면의 빡침 버튼)
// align="center": 제목을 가운데에 둔다 (스트레칭·통계·명상)
// className, titleClassName, style: 화면별 모양을 더할 때
export default function Screen({ title, headerRight, align, className = '', titleClassName = '', style, children }) {
  return (
    <main className={`screen ${className}`} style={style}>
      <header className={`screen__header${align === 'center' ? ' screen__header--center' : ''}`}>
        <h1 className={`screen__title ${titleClassName}`}>{title}</h1>
        {headerRight ? <div className="screen__header-right">{headerRight}</div> : null}
      </header>
      <div className="screen__body">{children}</div>
    </main>
  )
}
