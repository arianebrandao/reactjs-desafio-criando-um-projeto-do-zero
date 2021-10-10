import Image from 'next/image'
import React from 'react'
import Link from 'next/link'

import styles from './header.module.scss'

export default function Header() {
  return (
    <header className={styles.header}>
      <Link href='/'>
        <a>
          <Image src="/Logo.svg" alt="logo" width={238} height={26} />
        </a>
      </Link>
    </header>
  )
}
