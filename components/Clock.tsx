'use client'

import { useState, useEffect } from 'react'

export function Clock() {
  const [dateTime, setDateTime] = useState(new Date())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => {
      setDateTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  if (!mounted) {
    return null
  }

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      weekday: 'short',
    }
    return date.toLocaleDateString('zh-CN', options)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        borderRadius: '20px',
        background: 'var(--surface-secondary)',
        fontSize: '14px',
        fontWeight: 500,
        color: 'var(--text-secondary)',
      }}
    >
      <span>{formatDate(dateTime)}</span>
      <span style={{ color: 'var(--primary-400)' }}>|</span>
      <span
        style={{
          fontFamily: 'monospace',
          color: 'var(--primary-400)',
        }}
      >
        {formatTime(dateTime)}
      </span>
    </div>
  )
}
