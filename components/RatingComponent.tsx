'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import type { Rating, Profile } from '@/types/database'
import { formatTime } from '@/lib/utils'

interface RatingWithProfile extends Rating {
  profiles?: Profile
}

interface RatingComponentProps {
  songId: string
  user: User | null
  initialRatings: RatingWithProfile[]
  averageScore: number
  ratingCount: number
}

export function RatingComponent({
  songId,
  user,
  initialRatings,
  averageScore,
  ratingCount,
}: RatingComponentProps) {
  const [ratings, setRatings] = useState<RatingWithProfile[]>(initialRatings)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<string>('')
  const supabase = createClient()

  // 获取当前用户的评分列表
  const userRatings = ratings.filter((r) => r.user_id === user?.id)

  const handleRate = async (score: number) => {
    if (!user) {
      setMessage('请先登录后再评分')
      return
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      // 插入新评分（允许多次）
      const { data: newRating, error } = await supabase
        .from('ratings')
        .insert({
          song_id: songId,
          user_id: user.id,
          score: score,
        })
        .select('*')
        .single()

      if (error) throw error

      if (newRating) {
        // 获取当前用户的 profile 信息（包含头像）
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url')
          .eq('id', user.id)
          .single()

        const ratingWithProfile = {
          ...newRating,
          profiles: profile || null
        }

        setRatings([ratingWithProfile, ...ratings])
        setMessage(`评分成功！给了 ${score} 分`)
      }
    } catch (error: any) {
      console.error('评分失败:', error)
      setMessage('评分失败: ' + (error.message || error.error_description || '请重试'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (ratingId: string) => {
    if (!user) return

    if (!confirm('确定要删除这条评分吗？')) return

    setIsSubmitting(true)
    setMessage('')

    try {
      const { error } = await supabase
        .from('ratings')
        .delete()
        .eq('id', ratingId)
        .eq('user_id', user.id)

      if (error) throw error

      setRatings(ratings.filter((r) => r.id !== ratingId))
      setMessage('评分已删除')
    } catch (error: any) {
      console.error('删除评分失败:', error)
      setMessage('删除失败: ' + (error.message || error.error_description || '请重试'))
    } finally {
      setIsSubmitting(false)
    }
  }

  // 根据分数获取颜色
  const getScoreColor = (score: number) => {
    if (score >= 9) return 'var(--primary-400)'
    if (score >= 7) return '#10b981'
    if (score >= 5) return '#f59e0b'
    return '#ef4444'
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
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
          }}
        >
          ⭐
        </div>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 600 }}>评分</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
            {ratingCount > 0 ? `${ratingCount} 人评分，平均 ${averageScore} 分` : '暂无评分'}
          </p>
        </div>
      </div>

      {!user ? (
        <div
          style={{
            textAlign: 'center',
            padding: '32px',
            background: 'var(--bg-glass)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-primary)',
          }}
        >
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔒</div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
            登录后可以评分
          </p>
          <Link href="/login" className="btn btn-primary">
            去登录
          </Link>
        </div>
      ) : (
        <div>
          {/* 评分按钮 1-10 */}
          <div className="rating-grid" style={{ marginBottom: '20px' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
              <button
                key={score}
                onClick={() => handleRate(score)}
                disabled={isSubmitting}
                className="rating-btn"
                style={{
                  background:
                    score >= 9
                      ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(139, 92, 246, 0.1))'
                      : score >= 7
                      ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.05))'
                      : score >= 5
                      ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.05))'
                      : 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.05))',
                  borderColor:
                    score >= 9
                      ? 'rgba(139, 92, 246, 0.3)'
                      : score >= 7
                      ? 'rgba(16, 185, 129, 0.3)'
                      : score >= 5
                      ? 'rgba(245, 158, 11, 0.3)'
                      : 'rgba(239, 68, 68, 0.3)',
                  color:
                    score >= 9
                      ? '#c4b5fd'
                      : score >= 7
                      ? '#6ee7b7'
                      : score >= 5
                      ? '#fcd34d'
                      : '#fca5a5',
                }}
              >
                {score}
              </button>
            ))}
          </div>

          {/* 提示信息 */}
          {message && (
            <div
              style={{
                textAlign: 'center',
                padding: '14px',
                backgroundColor: message.includes('成功')
                  ? 'rgba(16, 185, 129, 0.1)'
                  : message.includes('删除')
                  ? 'rgba(239, 68, 68, 0.1)'
                  : 'rgba(245, 158, 11, 0.1)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '20px',
                color: message.includes('成功')
                  ? '#6ee7b7'
                  : message.includes('删除')
                  ? '#fca5a5'
                  : '#fcd34d',
                fontSize: '14px',
              }}
            >
              {message}
            </div>
          )}

          {/* 当前用户的评分历史 */}
          {userRatings.length > 0 && (
            <div>
              <h4
                style={{
                  fontSize: '14px',
                  color: 'var(--text-tertiary)',
                  marginBottom: '16px',
                  fontWeight: 500,
                }}
              >
                我的评分历史
              </h4>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                {userRatings.map((rating) => (
                  <div
                    key={rating.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '14px 16px',
                      background: 'var(--bg-glass)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-secondary)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span
                        style={{
                          fontSize: '18px',
                          fontWeight: 700,
                          color: getScoreColor(rating.score),
                          minWidth: '36px',
                        }}
                      >
                        {rating.score}
                      </span>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        {formatTime(rating.created_at)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDelete(rating.id)}
                      disabled={isSubmitting}
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--text-muted)' }}
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
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
