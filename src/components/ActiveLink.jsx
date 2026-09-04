'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function ActiveLink({ href, className, children, end = false, ...props }) {
  const pathname = usePathname()
  const isActive = end
    ? pathname === href
    : pathname === href || (href !== '/' && pathname.startsWith(`${href}/`))

  const resolvedClass =
    typeof className === 'function' ? className({ isActive }) : [className, isActive ? 'is-active' : ''].filter(Boolean).join(' ')

  return (
    <Link href={href} className={resolvedClass} {...props}>
      {children}
    </Link>
  )
}
