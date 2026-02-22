'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import type { Comment, Profile } from '@/types/database'
import { formatTime } from '@/lib/utils'
import { Avatar } from './Avatar'

interface CommentWithProfile extends Comment {
  profiles?: Profile
}

interface CommentComponentProps {
  songId: string
  user: User | null
  initialComments: CommentWithProfile[]
}

export function CommentComponent({
  songId,
  user,
  initialComments,
}: CommentComponentProps) {
  const [comments, setComments] = useState<CommentWithProfile[]>(initialComments)
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<string>('')
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      setMessage('请先登录后再评论')
      return
    }

    if (!newComment.trim()) {
      setMessage('请输入评论内容')
      return
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      const { data: newCommentData, error } = await supabase
        .from('comments')
        .insert({
          song_id: songId,
          user_id: user.id,
          content: newComment.trim(),
        })
        .select('*')
        .single()

      if (error) throw error

      if (newCommentData) {
        // 获取当前用户的 profile 信息（包含头像）
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url')
          .eq('id', user.id)
          .single()

        const commentWithProfile = {
          ...newCommentData,
          profiles: profile || null
        }

        setComments([commentWithProfile, ...comments])
        setNewComment('')
        setMessage('评论发布成功！')
      }
    } catch (error: any) {
      console.error('评论失败:', error)
      setMessage('评论失败: ' + (error.message || '请重试'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!user) return

    if (!confirm('确定要删除这条评论吗？')) return

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id)

      if (error) throw error

      setComments(comments.filter((c) => c.id !== commentId))
    } catch (error) {
      console.error('删除评论失败:', error)
      alert('删除失败，请重试')
    }
  }

  return (
    <section className="card">
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
            background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
          }}
        >
          💬
        </div>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 600 }}>评论</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
            {comments.length} 条评论
          </p>
        </div>
      </div>

      {/* 评论输入框 */}
      {!user ? (
        <div
          style={{
            textAlign: 'center',
            padding: '40px',
            background: 'var(--bg-glass)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-primary)',
            marginBottom: '24px',
          }}
        >
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔒</div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
            登录后可以发表评论
          </p>
          <Link href="/login" className="btn btn-primary">
            去登录
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ marginBottom: '28px' }}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="分享你对这首歌的想法..."
            className="textarea"
            rows={3}
            maxLength={500}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '12px',
            }}
          >
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {newComment.length}/500
            </span>
            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="btn btn-primary"
            >
              {isSubmitting ? (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ animation: 'spin 1s linear infinite' }}
                  >
                    <path d="M21 12a9 9 0 11-6.219-8.56" />
                  </svg>
                  发布中...
                </>
              ) : (
                <>
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
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                  发布评论
                </>
              )}
            </button>
          </div>
          {message && (
            <div
              style={{
                marginTop: '12px',
                padding: '12px 16px',
                backgroundColor: message.includes('成功')
                  ? 'rgba(16, 185, 129, 0.1)'
                  : 'rgba(239, 68, 68, 0.1)',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                color: message.includes('成功') ? '#6ee7b7' : '#fca5a5',
              }}
            >
              {message}
            </div>
          )}
        </form>
      )}

      {/* 评论列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {comments.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '48px 24px',
              color: 'var(--text-muted)',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>💭</div>
            <p>暂无评论，来抢沙发吧！</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              style={{
                padding: '20px',
                background: 'var(--bg-glass)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-secondary)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* 头像 */}
                  <Avatar
                    url={comment.profiles?.avatar_url}
                    name={comment.profiles?.display_name || '用户'}
                    size={40}
                    fontSize={16}
                  />
                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: '14px',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {comment.profiles?.display_name || '匿名用户'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {formatTime(comment.created_at)}
                    </div>
                  </div>
                </div>
                {user?.id === comment.user_id && (
                  <button
                    onClick={() => handleDelete(comment.id)}
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
                )}
              </div>
              <p
                style={{
                  lineHeight: 1.7,
                  color: 'var(--text-secondary)',
                  whiteSpace: 'pre-wrap',
                  fontSize: '15px',
                  paddingLeft: '52px',
                }}
              >
                {comment.content}
              </p>
            </div>
          ))
        )}
      </div>

      {/* 添加旋转动画 */}
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
    </section>
  )
}
