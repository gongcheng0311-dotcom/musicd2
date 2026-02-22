'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { presetAvatars, isPresetAvatar, getPresetAvatarId } from '@/lib/avatars'

interface UserMenuProps {
  initialUser: {
    id: string
    email?: string
    user_metadata?: { display_name?: string }
  } | null
}

export function UserMenu({ initialUser }: UserMenuProps) {
  const [user, setUser] = useState(initialUser)
  const [profile, setProfile] = useState<{ display_name?: string; avatar_url?: string } | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  // 获取用户资料
  useEffect(() => {
    if (!user) return

    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile(data)
      }
    }

    fetchProfile()
  }, [user, supabase])

  // 监听认证状态变化
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user as any)
      } else {
        setUser(null)
        setProfile(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIsOpen(false)
    router.refresh()
  }

  // 获取显示名称
  const displayName = profile?.display_name || user?.user_metadata?.display_name || user?.email?.split('@')[0] || '用户'

  // 渲染头像
  const renderAvatar = (size: number = 28, fontSize: number = 12) => {
    const avatarUrl = profile?.avatar_url

    // 检查是否是预设头像
    if (avatarUrl) {
      const presetId = getPresetAvatarId(avatarUrl)
      if (presetId) {
        const preset = presetAvatars.find(a => a.id === presetId)
        if (preset) {
          return (
            <div style={{
              width: size,
              height: size,
              borderRadius: '50%',
              background: preset.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: size * 0.5,
            }}>
              {preset.emoji}
            </div>
          )
        }
      }

      // 自定义上传头像
      return (
        <img
          src={avatarUrl}
          alt={displayName}
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            objectFit: 'cover',
          }}
        />
      )
    }

    // 默认头像（字母）
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: getAvatarColor(displayName),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: fontSize,
          fontWeight: 600,
        }}
      >
        {displayName.charAt(0).toUpperCase()}
      </div>
    )
  }

  // 生成头像颜色（用于默认头像）
  const getAvatarColor = (name: string) => {
    const colors = [
      'linear-gradient(135deg, #8b5cf6, #a78bfa)',
      'linear-gradient(135deg, #ec4899, #f472b6)',
      'linear-gradient(135deg, #06b6d4, #67e8f9)',
      'linear-gradient(135deg, #10b981, #34d399)',
      'linear-gradient(135deg, #f59e0b, #fbbf24)',
      'linear-gradient(135deg, #ef4444, #f87171)',
    ]
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="btn btn-primary btn-sm"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M13.8 12H3" />
        </svg>
        登录
      </Link>
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          padding: '6px 6px 6px 14px',
          background: 'var(--bg-glass)',
          borderRadius: 'var(--radius-full)',
          fontSize: '14px',
          cursor: 'pointer',
          border: '1px solid var(--border-primary)',
          color: 'var(--text-primary)',
          transition: 'all 0.2s',
        }}
      >
        <span
          style={{
            maxWidth: '100px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontWeight: 500,
          }}
        >
          {displayName}
        </span>
        {renderAvatar(28, 12)}
      </button>

      {isOpen && (
        <>
          {/* 遮罩层 */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 40,
            }}
            onClick={() => setIsOpen(false)}
          />
          {/* 下拉菜单 */}
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-primary)',
              boxShadow: 'var(--shadow-xl)',
              minWidth: '220px',
              zIndex: 50,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '20px',
                borderBottom: '1px solid var(--border-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
              }}
            >
              {renderAvatar(48, 20)}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: '14px',
                    marginBottom: '2px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {displayName}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: 'var(--text-tertiary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user.email}
                </div>
              </div>
            </div>

            {/* 编辑资料按钮 */}
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '12px 16px',
                textAlign: 'left',
                border: 'none',
                backgroundColor: 'transparent',
                fontSize: '14px',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                textDecoration: 'none',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-secondary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              编辑资料
            </Link>

            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '12px 16px',
                textAlign: 'left',
                border: 'none',
                borderTop: '1px solid var(--border-secondary)',
                backgroundColor: 'transparent',
                fontSize: '14px',
                cursor: 'pointer',
                color: '#fca5a5',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
              退出登录
            </button>
          </div>
        </>
      )}
    </div>
  )
}
