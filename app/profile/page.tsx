'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { presetAvatars, getPresetAvatarId } from '@/lib/avatars'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [displayName, setDisplayName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [activeTab, setActiveTab] = useState<'preset' | 'upload'>('preset')
  const [selectedPreset, setSelectedPreset] = useState('')
  const [uploadPreview, setUploadPreview] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  const router = useRouter()

  // 获取用户和资料
  useEffect(() => {
    const fetchUserAndProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }
        setUser(user)

        // 获取或创建用户资料
        let { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (!profileData) {
          // 创建新资料
          const { data: newProfile } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              display_name: user.user_metadata?.display_name || user.email?.split('@')[0],
              avatar_url: '',
              is_admin: false,
            })
            .select()
            .single()
          profileData = newProfile
        }

        setProfile(profileData)
        setDisplayName(profileData?.display_name || '')
        setAvatarUrl(profileData?.avatar_url || '')

        // 检查当前头像是否是预设头像
        const presetId = getPresetAvatarId(profileData?.avatar_url || '')
        if (presetId) {
          setSelectedPreset(presetId)
          setActiveTab('preset')
        } else if (profileData?.avatar_url) {
          setUploadPreview(profileData.avatar_url)
          setActiveTab('upload')
        }
      } catch (error) {
        console.error('获取资料失败:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserAndProfile()
  }, [supabase, router])

  // 处理文件上传
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: '请选择图片文件' })
      return
    }

    // 验证文件大小 (最大 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: '图片大小不能超过 2MB' })
      return
    }

    // 创建预览
    const reader = new FileReader()
    reader.onload = (e) => {
      setUploadPreview(e.target?.result as string)
      setAvatarUrl(e.target?.result as string)
      setSelectedPreset('')
    }
    reader.readAsDataURL(file)
  }

  // 选择预设头像
  const handleSelectPreset = (id: string) => {
    setSelectedPreset(id)
    setAvatarUrl(`preset:${id}`)
    setUploadPreview('')
  }

  // 保存资料
  const handleSave = async () => {
    if (!user) return

    setIsSaving(true)
    setMessage(null)

    try {
      let finalAvatarUrl = avatarUrl

      // 如果是上传的图片（base64），需要上传到 Supabase Storage
      if (uploadPreview && avatarUrl.startsWith('data:')) {
        // 将 base64 转换为文件
        const base64Data = avatarUrl.split(',')[1]
        const blob = await fetch(`data:image/jpeg;base64,${base64Data}`).then(r => r.blob())
        const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })

        // 上传文件
        const fileName = `${user.id}-${Date.now()}.jpg`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, file)

        if (uploadError) {
          // 如果 buckets 不存在，使用 base64 直接存储（降级方案）
          console.warn('上传失败，使用 base64 存储:', uploadError)
          finalAvatarUrl = avatarUrl
        } else {
          // 获取公开 URL
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName)
          finalAvatarUrl = publicUrl
        }
      }

      // 更新用户元数据（display_name）
      const { error: authError } = await supabase.auth.updateUser({
        data: { display_name: displayName.trim() }
      })

      if (authError) throw authError

      // 更新 profiles 表
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          display_name: displayName.trim(),
          avatar_url: finalAvatarUrl,
          updated_at: new Date().toISOString(),
        })

      if (profileError) throw profileError

      setMessage({ type: 'success', text: '资料更新成功！' })
      setTimeout(() => router.refresh(), 500)
    } catch (error: any) {
      console.error('保存失败:', error)
      setMessage({ type: 'error', text: error.message || '保存失败' })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <main className="container" style={{ minHeight: '100vh', paddingTop: '48px', paddingBottom: '80px' }}>
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <p style={{ color: 'var(--text-tertiary)' }}>加载中...</p>
        </div>
      </main>
    )
  }

  // 获取当前显示的头像
  const getCurrentAvatar = () => {
    if (selectedPreset) {
      const preset = presetAvatars.find(a => a.id === selectedPreset)
      if (preset) {
        return (
          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: preset.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '64px',
          }}>
            {preset.emoji}
          </div>
        )
      }
    }
    if (uploadPreview) {
      return (
        <img
          src={uploadPreview}
          alt="头像预览"
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            objectFit: 'cover',
          }}
        />
      )
    }
    // 默认头像
    const defaultName = displayName || user?.email?.split('@')[0] || '用户'
    return (
      <div style={{
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        background: 'var(--gradient-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '48px',
        fontWeight: 600,
        color: 'white',
      }}>
        {defaultName.charAt(0).toUpperCase()}
      </div>
    )
  }

  return (
    <main className="container" style={{ minHeight: '100vh', paddingTop: '48px', paddingBottom: '80px' }}>
      {/* 导航栏 */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '20px', fontWeight: 700 }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'var(--gradient-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
          }}>
            🎵
          </div>
          <span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            每日好歌
          </span>
        </Link>
        <Link href="/" className="btn btn-ghost btn-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          返回首页
        </Link>
      </nav>

      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
          {/* 背景装饰 */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle at 30% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)',
            pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <h1 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '8px', textAlign: 'center' }}>
              个人资料
            </h1>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '15px', textAlign: 'center', marginBottom: '32px' }}>
              自定义你的用户名和头像
            </p>

            {/* 当前头像预览 */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                boxShadow: 'var(--shadow-xl)',
                overflow: 'hidden',
              }}>
                {getCurrentAvatar()}
              </div>
            </div>

            {/* 用户名输入 */}
            <div style={{ marginBottom: '28px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 500,
                color: 'var(--text-secondary)',
              }}>
                用户名
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="输入你的用户名"
                className="input"
                maxLength={20}
              />
              <div style={{
                fontSize: '12px',
                color: 'var(--text-tertiary)',
                marginTop: '6px',
                textAlign: 'right',
              }}>
                {displayName.length}/20
              </div>
            </div>

            {/* 头像选择标签 */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '12px',
                fontSize: '14px',
                fontWeight: 500,
                color: 'var(--text-secondary)',
              }}>
                选择头像
              </label>
              <div style={{
                display: 'flex',
                gap: '8px',
                padding: '4px',
                background: 'var(--surface-secondary)',
                borderRadius: '10px',
              }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('preset')}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    background: activeTab === 'preset' ? 'var(--surface-primary)' : 'transparent',
                    color: activeTab === 'preset' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                    boxShadow: activeTab === 'preset' ? 'var(--shadow-sm)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  预设头像
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    background: activeTab === 'upload' ? 'var(--surface-primary)' : 'transparent',
                    color: activeTab === 'upload' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                    boxShadow: activeTab === 'upload' ? 'var(--shadow-sm)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  上传图片
                </button>
              </div>
            </div>

            {/* 预设头像网格 */}
            {activeTab === 'preset' && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '12px',
                marginBottom: '28px',
              }}>
                {presetAvatars.map((avatar) => (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => handleSelectPreset(avatar.id)}
                    style={{
                      aspectRatio: '1',
                      borderRadius: '16px',
                      border: selectedPreset === avatar.id ? '3px solid var(--primary-500)' : '2px solid transparent',
                      background: avatar.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '32px',
                      cursor: 'pointer',
                      transform: selectedPreset === avatar.id ? 'scale(1.05)' : 'scale(1)',
                      transition: 'all 0.2s',
                      boxShadow: selectedPreset === avatar.id ? 'var(--shadow-md)' : 'none',
                    }}
                    title={avatar.name}
                  >
                    {avatar.emoji}
                  </button>
                ))}
              </div>
            )}

            {/* 上传区域 */}
            {activeTab === 'upload' && (
              <div style={{ marginBottom: '28px' }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    width: '100%',
                    padding: '40px 24px',
                    borderRadius: '16px',
                    border: '2px dashed var(--border-primary)',
                    background: 'var(--surface-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary-500)'
                    e.currentTarget.style.background = 'var(--surface-primary)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-primary)'
                    e.currentTarget.style.background = 'var(--surface-secondary)'
                  }}
                >
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '14px',
                    background: 'var(--gradient-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 500, marginBottom: '4px' }}>
                      点击上传图片
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
                      支持 JPG、PNG 格式，最大 2MB
                    </div>
                  </div>
                </button>
              </div>
            )}

            {/* 消息提示 */}
            {message && (
              <div style={{
                padding: '14px 16px',
                borderRadius: '12px',
                marginBottom: '20px',
                fontSize: '14px',
                backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                color: message.type === 'success' ? '#6ee7b7' : '#fca5a5',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {message.type === 'success' ? (
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3" />
                  ) : (
                    <circle cx="12" cy="12" r="10" />
                  )}
                  {message.type === 'error' && (
                    <>
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </>
                  )}
                </svg>
                {message.text}
              </div>
            )}

            {/* 保存按钮 */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              {isSaving ? (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                    <path d="M21 12a9 9 0 11-6.219-8.56" />
                  </svg>
                  保存中...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2zM17 21v-8H7v8M7 3v5h8" />
                  </svg>
                  保存更改
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  )
}
