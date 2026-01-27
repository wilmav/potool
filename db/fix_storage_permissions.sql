-- FIX STORAGE POLICIES
-- This script ensures users can Upload, View, and Delete their own files.

-- 1. Try to make the bucket public (This might fail if you don't have admin rights, but it's worth a try)
-- If this fails, you MUST do it in the Dashboard: Storage -> project_files -> Edit -> Public -> ON
UPDATE storage.buckets SET public = true WHERE id = 'project_files';

-- 2. POLICIES (Use DO blocks to avoid errors if they exist)

-- Policy: ALLOW PUBLIC READ (for viewing files)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Public Access project_files_select'
    ) THEN
        CREATE POLICY "Public Access project_files_select"
        ON storage.objects FOR SELECT
        USING ( bucket_id = 'project_files' );
    END IF;
END
$$;

-- Policy: ALLOW AUTHENTICATED UPLOAD (insert own files)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Authenticated Upload project_files_insert'
    ) THEN
        CREATE POLICY "Authenticated Upload project_files_insert"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (
          bucket_id = 'project_files' AND
          (storage.foldername(name))[1] = auth.uid()::text
        );
    END IF;
END
$$;

-- Policy: ALLOW OWNER DELETE/UPDATE (delete own files)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'User Manage Own Files project_files_all'
    ) THEN
        CREATE POLICY "User Manage Own Files project_files_all"
        ON storage.objects FOR ALL
        TO authenticated
        USING (
          bucket_id = 'project_files' AND
          (storage.foldername(name))[1] = auth.uid()::text
        );
    END IF;
END
$$;
