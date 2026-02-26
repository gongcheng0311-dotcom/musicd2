-- ============================================
-- 迁移：添加 Apple Music 支持
-- ============================================

-- 1. 添加 apple_music_url 字段到 songs 表
ALTER TABLE songs ADD COLUMN IF NOT EXISTS apple_music_url TEXT;

-- 2. 验证迁移
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'songs';
