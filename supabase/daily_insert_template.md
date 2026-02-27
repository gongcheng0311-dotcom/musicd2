# 每日歌曲录入模板

## Supabase 数据库插入语句

### 基础模板

```sql
INSERT INTO songs (
    date,
    title,
    artist,
    album,
    style,           -- 歌曲风格（10-20字）
    cover_url,
    intro,           -- 歌曲简介（首页显示，50-100字）
    description,     -- 歌曲介绍（详情页显示，可较长）
    lyrics,
    qq_music_url,
    qq_music_id,
    bilibili_bvid,
    apple_music_url
) VALUES (
    '2024-01-15',                           -- 日期（格式：YYYY-MM-DD）
    '歌曲名称',
    '歌手名称',
    '专辑名称',                             -- 可选，没有则填 NULL
    '华语流行 · 抒情',                       -- 风格标签（建议10-20字）
    'https://example.com/cover.jpg',        -- 专辑封面URL
    '首页显示的简短介绍，50-100字左右...',   -- 歌曲简介（可选，首页显示）
    '详情页的完整歌曲介绍，可以写得更详细...', -- 歌曲介绍（可选，详情页显示）
    '歌词内容...',                          -- 歌词（可选）
    'https://y.qq.com/n/ryqq/songDetail/xxx', -- QQ音乐链接（可选）
    '001xxx',                               -- QQ音乐ID（可选）
    'BV1xx411c7xx',                         -- B站BV号（可选）
    'https://music.apple.com/cn/song/xxx'   -- Apple Music链接（可选）
);
```

---

### 实际示例

```sql
INSERT INTO songs (
    date,
    title,
    artist,
    album,
    style,
    cover_url,
    intro,
    description,
    qq_music_url,
    bilibili_bvid
) VALUES (
    '2024-01-15',
    '晴天',
    '周杰伦',
    '叶惠美',
    '华语流行 · 校园怀旧',
    'https://y.qq.com/music/photo/xxx.jpg',
    '一首关于青春与回忆的经典之作，旋律优美动人，让人想起那些美好的校园时光。',  -- 首页简介（简短）
    '《晴天》是周杰伦演唱的歌曲，由周杰伦作词、作曲，收录于2003年发行的专辑《叶惠美》中。这首歌以吉他为主旋律，讲述了一段青涩的校园爱情故事，旋律优美，歌词真挚，是许多人青春回忆的代表作。',  -- 详情页介绍（详细）
    'https://y.qq.com/n/ryqq/songDetail/000xxx',
    'BV1xxx'
);
```

---

### 风格标签参考（10-20字）

| 风格类型 | 示例 |
|---------|------|
| 流行 | 华语流行 · 抒情治愈 |
| 摇滚 | 独立摇滚 · 热血激昂 |
| 电子 | 电子合成器 · 迷幻氛围 |
| 民谣 | 独立民谣 · 温暖治愈 |
| R&B | 节奏蓝调 · 慵懒性感 |
| 说唱 | 嘻哈说唱 · 态度表达 |
| 古典 | 古典跨界 · 优雅大气 |
| 爵士 | 爵士标准曲 · 复古优雅 |
| 日系 | J-POP · 清新治愈 |
| 欧美 | 欧美流行 · 节奏动感 |
| 古风 | 古风国风 · 诗意盎然 |
| 纯音乐 | 钢琴纯音 · 安静治愈 |

---

### 快捷录入（最简版本）

如果只需要必填项：

```sql
INSERT INTO songs (date, title, artist, style, cover_url)
VALUES (
    '2024-01-15',
    '歌曲名',
    '歌手名',
    '风格标签',
    '封面URL'
);
```

---

## 在 Supabase Dashboard 中操作步骤

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 点击左侧菜单 **Table Editor**
4. 选择 **songs** 表
5. 点击 **Insert** → **Insert row**
6. 填写各字段（或切换到 SQL 模式执行上面的语句）
7. 点击 **Save**

---

## 字段说明

| 字段 | 必填 | 说明 | 示例 |
|-----|------|------|------|
| `date` | ✅ | 推荐日期，每天唯一 | '2024-01-15' |
| `title` | ✅ | 歌曲名称 | '晴天' |
| `artist` | ✅ | 歌手/艺人 | '周杰伦' |
| `album` | ❌ | 专辑名称 | '叶惠美' |
| `style` | ❌ | 风格标签（10-20字） | '华语流行 · 校园怀旧' |
| `cover_url` | ❌ | 专辑封面图片URL | 'https://...' |
| **intro** | ❌ | **歌曲简介（首页显示）** | 简短描述，50-100字 |
| **description** | ❌ | **歌曲介绍（详情页显示）** | 详细介绍，可较长 |
| `lyrics` | ❌ | 完整歌词 | 纯文本 |
| `qq_music_url` | ❌ | QQ音乐链接 | 网页链接 |
| `qq_music_id` | ❌ | QQ音乐ID | '000xxx' |
| `bilibili_bvid` | ❌ | B站BV号 | 'BV1xx...' |
| `apple_music_url` | ❌ | Apple Music链接 | 网页链接 |

---

## 提示

- `style` 字段建议 **10-20字**，太短信息不足，太长显示不下
- `intro`（歌曲简介）用于首页显示，建议 **50-100字**，简洁吸引人
- `description`（歌曲介绍）用于详情页，可以写得详细一些，无字数限制
- 可以用 `·` 或 `/` 分隔多个标签
- 日期必须唯一，每天只能有一首推荐歌曲
- 封面图建议使用正方形图片（400x400px以上）
- 如果只有 `description` 没有 `intro`，首页将不显示简介部分
