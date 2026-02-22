'use client'

import { presetAvatars, getPresetAvatarId } from '@/lib/avatars'

interface AvatarProps {
  url?: string | null
  name?: string
  size?: number
  fontSize?: number
  className?: string
}

export function Avatar({ url, name = '用户', size = 40, fontSize, className }: AvatarProps) {
  const displayName = name || '用户'
  const finalFontSize = fontSize || Math.max(14, size * 0.4)

  // 检查是否是预设头像
  if (url) {
    const presetId = getPresetAvatarId(url)
    if (presetId) {
      const preset = presetAvatars.find(a => a.id === presetId)
      if (preset) {
        return (
          <div
            className={className}
            style={{
              width: size,
              height: size,
              borderRadius: '50%',
              background: preset.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: size * 0.55,
              flexShrink: 0,
            }}
            title={displayName}
          >
            {preset.emoji}
          </div>
        )
      }
    }

    // 自定义上传头像
    return (
      <img
        className={className}
        src={url}
        alt={displayName}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0,
        }}
      />
    )
  }

  // 默认头像（字母）
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: getAvatarColor(displayName),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: finalFontSize,
        fontWeight: 600,
        flexShrink: 0,
      }}
      title={displayName}
    >
      {displayName.charAt(0).toUpperCase()}
    </div>
  )
}

// 生成头像颜色
function getAvatarColor(name: string) {
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
