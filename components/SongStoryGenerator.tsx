'use client'

import { useState } from 'react'

interface SongInfo {
  title: string
  artist: string
  album: string | null
  description: string | null
  lyrics: string | null
  style: string | null
}

interface SongStoryGeneratorProps {
  song: SongInfo
}

export function SongStoryGenerator({ song }: SongStoryGeneratorProps) {
  const [story, setStory] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [hasGenerated, setHasGenerated] = useState(false)

  const handleGenerate = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: song.title,
          artist: song.artist,
          album: song.album,
          description: song.description,
          lyrics: song.lyrics,
          style: song.style,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '生成故事失败')
      }

      setStory(data.story)
      setHasGenerated(true)
    } catch (err: any) {
      setError(err.message || '生成故事时出错，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ marginTop: '20px' }}>
      {/* 生成按钮 */}
      {!hasGenerated && (
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="btn btn-primary"
          style={{
            opacity: isLoading ? 0.7 : 1,
            cursor: isLoading ? 'not-allowed' : 'pointer',
          }}
        >
          {isLoading ? (
            <>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{
                  animation: 'spin 1s linear infinite',
                }}
              >
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              正在创作故事...
            </>
          ) : (
            <>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 3l1.912 5.813a2 2 0 001.272 1.272L21 12l-5.813 1.912a2 2 0 00-1.272 1.272L12 21l-1.912-5.813a2 2 0 00-1.272-1.272L3 12l5.813-1.912a2 2 0 001.272-1.272L12 3z" />
              </svg>
              生成歌曲故事
            </>
          )}
        </button>
      )}

      {/* 错误提示 */}
      {error && (
        <div
          style={{
            marginTop: '16px',
            padding: '14px 16px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderRadius: 'var(--radius-md)',
            color: '#fca5a5',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      {/* 生成的故事 */}
      {story && (
        <div
          style={{
            marginTop: '20px',
            padding: '24px',
            background: 'var(--bg-glass)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-primary)',
            borderLeft: '4px solid var(--primary-500)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
              color: 'var(--primary-400)',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 3l1.912 5.813a2 2 0 001.272 1.272L21 12l-5.813 1.912a2 2 0 00-1.272 1.272L12 21l-1.912-5.813a2 2 0 00-1.272-1.272L3 12l5.813-1.912a2 2 0 001.272-1.272L12 3z" />
            </svg>
            AI 创作的故事
          </div>
          <p
            style={{
              lineHeight: 1.9,
              color: 'var(--text-secondary)',
              fontSize: '15px',
              whiteSpace: 'pre-wrap',
            }}
          >
            {story}
          </p>
          <div
            style={{
              marginTop: '16px',
              display: 'flex',
              gap: '12px',
            }}
          >
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="btn btn-secondary btn-sm"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M23 4v6h-6M1 20v-6h6M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
              </svg>
              重新生成
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}
