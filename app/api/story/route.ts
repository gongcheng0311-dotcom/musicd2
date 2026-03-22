import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { title, artist, album, description, lyrics, style } = await request.json()

    if (!title || !artist) {
      return NextResponse.json(
        { error: '歌曲标题和歌手信息是必需的' },
        { status: 400 }
      )
    }

    const apiKey = process.env.KIMI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Kimi API Key 未配置' },
        { status: 500 }
      )
    }

    const prompt = `请为歌曲《${title}》创作一个约500字的歌曲故事。

歌曲信息：
- 歌手：${artist}
- 专辑：${album || '未知'}
- 风格：${style || '未知'}
${description ? `- 简介：${description}` : ''}
${lyrics ? `- 歌词片段：${lyrics.substring(0, 800)}${lyrics.length > 800 ? '...' : ''}` : ''}

请创作一个富有情感、与歌曲主题相关的故事，可以包含：
1. 歌曲背后的灵感或创作背景想象
2. 与歌曲情感共鸣的场景描写
3. 歌曲传达的情感或哲理

要求：
- 字数：500字左右
- 语言：中文
- 风格：文学性、情感丰富、引人入胜
- 不要包含任何标题或导语，直接输出故事内容`

    const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'moonshot-v1-8k',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.75,
        max_tokens: 1500,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      console.error('Kimi API 错误:', errorData)
      return NextResponse.json(
        { error: '调用 Kimi API 失败，请稍后重试' },
        { status: 500 }
      )
    }

    const data = await response.json()
    const story = data.choices?.[0]?.message?.content

    if (!story) {
      return NextResponse.json(
        { error: '未能生成故事内容' },
        { status: 500 }
      )
    }

    return NextResponse.json({ story: story.trim() })
  } catch (error) {
    console.error('生成故事时出错:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
