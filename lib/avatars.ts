// 预设头像列表 - 使用渐变背景和 Emoji
export const presetAvatars = [
  { id: 'cat', emoji: '🐱', bg: 'linear-gradient(135deg, #f472b6, #db2777)', name: '猫咪' },
  { id: 'dog', emoji: '🐶', bg: 'linear-gradient(135deg, #fbbf24, #f59e0b)', name: '狗狗' },
  { id: 'fox', emoji: '🦊', bg: 'linear-gradient(135deg, #fb923c, #ea580c)', name: '狐狸' },
  { id: 'panda', emoji: '🐼', bg: 'linear-gradient(135deg, #e5e7eb, #9ca3af)', name: '熊猫' },
  { id: 'rabbit', emoji: '🐰', bg: 'linear-gradient(135deg, #fca5a5, #f472b6)', name: '兔子' },
  { id: 'bear', emoji: '🐻', bg: 'linear-gradient(135deg, #d4a574, #8b4513)', name: '棕熊' },
  { id: 'lion', emoji: '🦁', bg: 'linear-gradient(135deg, #fde047, #eab308)', name: '狮子' },
  { id: 'tiger', emoji: '🐯', bg: 'linear-gradient(135deg, #fdba74, #f97316)', name: '老虎' },
  { id: 'penguin', emoji: '🐧', bg: 'linear-gradient(135deg, #93c5fd, #3b82f6)', name: '企鹅' },
  { id: 'koala', emoji: '🐨', bg: 'linear-gradient(135deg, #c4b5fd, #8b5cf6)', name: '考拉' },
  { id: 'monkey', emoji: '🐵', bg: 'linear-gradient(135deg, #d6d3d1, #a8a29e)', name: '猴子' },
  { id: 'frog', emoji: '🐸', bg: 'linear-gradient(135deg, #86efac, #22c55e)', name: '青蛙' },
]

// 获取预设头像
export function getPresetAvatar(id: string) {
  return presetAvatars.find(avatar => avatar.id === id)
}

// 判断是否是预设头像
export function isPresetAvatar(url: string): boolean {
  return url.startsWith('preset:')
}

// 解析预设头像 ID
export function getPresetAvatarId(url: string): string | null {
  if (isPresetAvatar(url)) {
    return url.replace('preset:', '')
  }
  return null
}