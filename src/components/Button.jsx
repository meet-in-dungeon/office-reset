// 공통 버튼.
// variant: 'primary'(기본, 주 행동) | 'soft'(보조) | 'ghost'(약한 행동) | 'alert'(빡침·주의)
// size: 'large'(큰 시작 버튼) | 'round'(원형)
// block: true 이면 가로 폭을 꽉 채운다.
export default function Button({
  variant = 'primary',
  size,
  block = false,
  type = 'button',
  className = '',
  children,
  ...props
}) {
  const classes = [
    'btn',
    `btn--${variant}`,
    size ? `btn--${size}` : '',
    block ? 'btn--block' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  )
}
