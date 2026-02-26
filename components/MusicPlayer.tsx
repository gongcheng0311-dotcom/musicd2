'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface MusicPlayerProps {
  qqMusicUrl: string | null
  qqMusicId: string | null
  bilibiliBvid: string | null
  appleMusicUrl: string | null
}

export function MusicPlayer({ qqMusicUrl, qqMusicId, bilibiliBvid, appleMusicUrl }: MusicPlayerProps) {
  const [qqEmbedError, setQqEmbedError] = useState(false)
  const [activeTab, setActiveTab] = useState<'qq' | 'bilibili' | 'apple'>('qq')

  // 自动选择默认 Tab：优先 B 站（embed 稳定），然后是 QQ 音乐，最后是 Apple Music
  useEffect(() => {
    if (bilibiliBvid) {
      setActiveTab('bilibili')
    } else if (qqMusicId || qqMusicUrl) {
      setActiveTab('qq')
    } else if (appleMusicUrl) {
      setActiveTab('apple')
    }
  }, [bilibiliBvid, qqMusicId, qqMusicUrl, appleMusicUrl])

  // 构建 Bilibili 嵌入链接
  const getBilibiliEmbedUrl = (bvid: string): string => {
    return `https://player.bilibili.com/player.html?bvid=${bvid}&page=1&high_quality=1&danmaku=0&autoplay=0`
  }

  const hasQQMusic = qqMusicUrl || qqMusicId
  const hasBilibili = !!bilibiliBvid
  const hasAppleMusic = !!appleMusicUrl

  if (!hasQQMusic && !hasBilibili && !hasAppleMusic) {
    return null
  }

  return (
    <section className="card" style={{ marginBottom: '24px' }}>
      {/* 标题区域 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
          }}
        >
          🎵
        </div>
        <h3 style={{ fontSize: '18px', fontWeight: 600 }}>试听</h3>
      </div>

      {/* Tab 切换 */}
      {(hasQQMusic || hasBilibili || hasAppleMusic) && (
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '20px',
            padding: '4px',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-md)',
            width: 'fit-content',
            flexWrap: 'wrap',
          }}
        >
          {hasQQMusic && (
            <button
              onClick={() => setActiveTab('qq')}
              style={{
                padding: '10px 20px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: activeTab === 'qq' ? 'var(--primary-600)' : 'transparent',
                color: activeTab === 'qq' ? 'white' : 'var(--text-tertiary)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'all 0.2s',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                QQ 音乐
              </span>
            </button>
          )}
          {hasAppleMusic && (
            <button
              onClick={() => setActiveTab('apple')}
              style={{
                padding: '10px 20px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: activeTab === 'apple' ? '#fc3c44' : 'transparent',
                color: activeTab === 'apple' ? 'white' : 'var(--text-tertiary)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'all 0.2s',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5c0 .28-.22.5-.5.5s-.5-.22-.5-.5v-7c0-.28.22-.5.5-.5s.5.22.5.5v7zm3 0c0 .28-.22.5-.5.5s-.5-.22-.5-.5v-7c0-.28.22-.5.5-.5s.5.22.5.5v7z"/>
                </svg>
                Apple Music
              </span>
            </button>
          )}
          {hasBilibili && (
            <button
              onClick={() => setActiveTab('bilibili')}
              style={{
                padding: '10px 20px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: activeTab === 'bilibili' ? '#fb7299' : 'transparent',
                color: activeTab === 'bilibili' ? 'white' : 'var(--text-tertiary)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'all 0.2s',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 0 1 .16-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.657-.373.906zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893v-7.52c-.017-.765-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c0-.373.129-.689.386-.947.258-.257.574-.386.947-.386zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.249.56-.373.933-.373z"/>
                </svg>
                哔哩哔哩
              </span>
            </button>
          )}
        </div>
      )}

      {/* QQ 音乐播放器 */}
      {activeTab === 'qq' && hasQQMusic && (
        <div>
          {qqMusicId && !qqEmbedError ? (
            <div>
              {/* 由于 QQ 音乐通常不允许嵌入，直接显示外部链接按钮 */}
              <div
                style={{
                  padding: '48px 32px',
                  textAlign: 'center',
                  background: 'var(--bg-glass)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px dashed var(--border-primary)',
                }}
              >
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎧</div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '15px' }}>
                  QQ 音乐网页版受嵌入限制<br />点击下方按钮在新窗口播放
                </p>
                <a
                  href={qqMusicUrl || `https://y.qq.com/n/ryqq/songDetail/${qqMusicId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  在 QQ 音乐播放
                </a>
              </div>
            </div>
          ) : qqMusicUrl ? (
            <div
              style={{
                padding: '48px 32px',
                textAlign: 'center',
                background: 'var(--bg-glass)',
                borderRadius: 'var(--radius-md)',
                border: '1px dashed var(--border-primary)',
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎧</div>
              <a
                href={qqMusicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                在 QQ 音乐播放
              </a>
            </div>
          ) : null}
        </div>
      )}

      {/* Apple Music 播放器 */}
      {activeTab === 'apple' && hasAppleMusic && (
        <div>
          <div
            style={{
              padding: '48px 32px',
              textAlign: 'center',
              background: 'var(--bg-glass)',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--border-primary)',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎵</div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '15px' }}>
              Apple Music 需要跳转应用或网页播放<br />点击下方按钮在新窗口打开
            </p>
            <a
              href={appleMusicUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                background: '#fc3c44',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5c0 .28-.22.5-.5.5s-.5-.22-.5-.5v-7c0-.28.22-.5.5-.5s.5.22.5.5v7zm3 0c0 .28-.22.5-.5.5s-.5-.22-.5-.5v-7c0-.28.22-.5.5-.5s.5.22.5.5v7z"/>
              </svg>
              在 Apple Music 播放
            </a>
          </div>
        </div>
      )}

      {/* Bilibili 播放器 */}
      {activeTab === 'bilibili' && hasBilibili && bilibiliBvid && (
        <div>
          <div
            style={{
              position: 'relative',
              paddingBottom: '56.25%', // 16:9 比例
              height: 0,
              overflow: 'hidden',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-tertiary)',
            }}
          >
            <iframe
              src={getBilibiliEmbedUrl(bilibiliBvid)}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none',
              }}
              allowFullScreen
              allow="fullscreen; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            <a
              href={`https://www.bilibili.com/video/${bilibiliBvid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-sm"
              style={{ color: '#fb7299' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 0 1 .16-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.657-.373.906zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893v-7.52c-.017-.765-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c0-.373.129-.689.386-.947.258-.257.574-.386.947-.386zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.249.56-.373.933-.373z"/>
              </svg>
              在 Bilibili 打开
            </a>
          </div>
        </div>
      )}
    </section>
  )
}
