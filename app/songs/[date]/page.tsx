import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Song, Rating, Comment } from '@/types/database'
import { RatingComponent } from '@/components/RatingComponent'
import { CommentComponent } from '@/components/CommentComponent'
import { MusicPlayer } from '@/components/MusicPlayer'
import { UserMenu } from '@/components/UserMenu'

interface SongPageProps {
  params: { date: string }
}

export const dynamic = 'force-dynamic'

export default async function SongPage({ params }: SongPageProps) {
  const supabase = createClient()
  const { date } = params

  // 获取歌曲详情
  const { data: song } = await supabase
    .from('songs')
    .select('*')
    .eq('date', date)
    .single()

  if (!song) {
    notFound()
  }

  // 获取当前用户
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 获取所有评分列表
  const { data: ratings } = await supabase
    .from('ratings')
    .select('*')
    .eq('song_id', song.id)
    .order('created_at', { ascending: false })

  // 获取评分用户信息（包含头像）
  const userIds = Array.from(new Set((ratings || []).map(r => r.user_id)))
  const { data: ratingProfiles } = userIds.length > 0 ? await supabase
    .from('profiles')
    .select('id, display_name, avatar_url')
    .in('id', userIds) : { data: [] }

  // 合并评分和用户信息
  const ratingsWithProfiles = (ratings || []).map(r => ({
    ...r,
    profiles: ratingProfiles?.find(p => p.id === r.user_id) || null
  }))

  // 计算平均分和评分人数
  const allRatings = ratingsWithProfiles
  const averageScore = allRatings.length
    ? Number(
        (
          allRatings.reduce((sum, r) => sum + r.score, 0) /
          allRatings.length
        ).toFixed(2)
      )
    : 0
  const ratingCount = allRatings.length

  // 获取评论列表
  const { data: commentsData } = await supabase
    .from('comments')
    .select('*')
    .eq('song_id', song.id)
    .order('created_at', { ascending: false })

  // 获取评论用户信息（包含头像）
  const commentUserIds = Array.from(new Set((commentsData || []).map(c => c.user_id)))
  const { data: commentProfiles } = commentUserIds.length > 0 ? await supabase
    .from('profiles')
    .select('id, display_name, avatar_url')
    .in('id', commentUserIds) : { data: [] }

  // 合并评论和用户信息
  const comments = (commentsData || []).map(c => ({
    ...c,
    profiles: commentProfiles?.find(p => p.id === c.user_id) || null
  }))

  return (
    <main className="container" style={{ paddingTop: '48px', paddingBottom: '80px' }}>
      {/* 导航 */}
      <nav
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px',
        }}
      >
        <Link
          href="/"
          className="btn btn-secondary btn-sm"
          style={{ gap: '8px' }}
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
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          返回首页
        </Link>
        <UserMenu initialUser={user as any} />
      </nav>

      {/* 歌曲信息卡片 */}
      <section
        className="card"
        style={{
          marginBottom: '32px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 背景装饰 */}
        <div
          style={{
            position: 'absolute',
            top: '-30%',
            right: '-10%',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div className="song-info-grid" style={{ position: 'relative', zIndex: 1 }}>
          {/* 封面 */}
          <div style={{ flexShrink: 0 }}>
            <div
              style={{
                width: '100%',
                maxWidth: '320px',
                aspectRatio: '1',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-xl), var(--shadow-glow)',
                margin: '0 auto',
              }}
            >
              {song.cover_url ? (
                <img
                  src={song.cover_url}
                  alt={song.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    background: 'var(--gradient-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '80px',
                  }}
                >
                  🎵
                </div>
              )}
            </div>
          </div>

          {/* 歌曲详情 */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {/* 日期标签 */}
            <div style={{ marginBottom: '20px' }}>
              <span className="badge badge-secondary">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {song.date}
              </span>
            </div>

            {/* 标题 */}
            <h1
              style={{
                fontSize: 'clamp(28px, 4vw, 40px)',
                fontWeight: 700,
                marginBottom: '12px',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}
            >
              {song.title}
            </h1>

            {/* 艺术家 */}
            <p
              style={{
                fontSize: '22px',
                color: 'var(--text-secondary)',
                marginBottom: '8px',
                fontWeight: 500,
              }}
            >
              {song.artist}
            </p>

            {/* 专辑 */}
            {song.album && (
              <p
                style={{
                  fontSize: '16px',
                  color: 'var(--text-tertiary)',
                  marginBottom: '28px',
                }}
              >
                《{song.album}》
              </p>
            )}

            {/* 评分统计 */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px 24px',
                background: 'var(--bg-glass)',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-xl)',
                width: 'fit-content',
              }}
            >
              {/* 评分圆环 */}
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: averageScore > 0
                    ? `conic-gradient(var(--primary-500) ${averageScore * 36}deg, var(--bg-tertiary) 0deg)`
                    : 'var(--bg-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'var(--bg-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: 700,
                    color: averageScore > 0 ? 'var(--primary-400)' : 'var(--text-muted)',
                  }}
                >
                  {averageScore > 0 ? averageScore : '-'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginBottom: '2px' }}>
                  平均评分
                </div>
                <div style={{ fontSize: '18px', fontWeight: 600 }}>
                  {ratingCount > 0 ? (
                    <>
                      <span style={{ color: 'var(--primary-400)' }}>{ratingCount}</span>
                      <span style={{ color: 'var(--text-tertiary)', fontSize: '14px', marginLeft: '4px' }}>
                        人评分
                      </span>
                    </>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                      暂无评分
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 音乐播放器 */}
      <MusicPlayer
        qqMusicUrl={song.qq_music_url}
        qqMusicId={song.qq_music_id}
        bilibiliBvid={song.bilibili_bvid}
        appleMusicUrl={song.apple_music_url}
      />

      {/* 简介 */}
      {song.description && (
        <section className="card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'var(--gradient-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
              }}
            >
              📝
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>歌曲简介</h3>
          </div>
          <p
            style={{
              lineHeight: 1.8,
              color: 'var(--text-secondary)',
              whiteSpace: 'pre-wrap',
              fontSize: '15px',
            }}
          >
            {song.description}
          </p>
        </section>
      )}

      {/* 歌词 */}
      {song.lyrics && (
        <section className="card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'var(--gradient-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
              }}
            >
              🎤
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>歌词</h3>
          </div>
          <pre
            style={{
              lineHeight: 2.2,
              color: 'var(--text-secondary)',
              whiteSpace: 'pre-wrap',
              fontFamily: 'inherit',
              fontSize: '15px',
              textAlign: 'center',
              padding: '20px',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            {song.lyrics}
          </pre>
        </section>
      )}

      {/* 评分组件 */}
      <RatingComponent
        songId={song.id}
        user={user}
        initialRatings={allRatings}
        averageScore={averageScore}
        ratingCount={ratingCount}
      />

      {/* 评论组件 */}
      <CommentComponent
        songId={song.id}
        user={user}
        initialComments={comments || []}
      />
    </main>
  )
}
