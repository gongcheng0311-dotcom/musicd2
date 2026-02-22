-- ============================================
-- 迁移：添加头像支持
-- ============================================

-- 1. 添加 avatar_url 字段到 profiles 表
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. 添加 INSERT 策略（如果不存在）
-- 检查策略是否存在，不存在则创建
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'profiles'
        AND policyname = '用户可以插入自己的 profile'
    ) THEN
        CREATE POLICY "用户可以插入自己的 profile"
            ON profiles FOR INSERT
            TO authenticated
            WITH CHECK (id = auth.uid());
    END IF;
END $$;

-- 3. 创建 avatars storage bucket
-- 注意：需要在 Supabase Dashboard 的 Storage 中手动创建名为 "avatars" 的 bucket
-- 并设置其为公开访问

-- 4. 可选：设置存储桶的 RLS 策略（如果使用 Supabase Storage）
-- 这些需要在 Supabase Dashboard 中配置

-- 验证迁移
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles';
