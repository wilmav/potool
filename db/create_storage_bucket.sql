-- Simply create the bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('project_files', 'project_files', true)
ON CONFLICT (id) DO NOTHING;

-- Create a specific policy for this bucket
-- We use a DO block to avoid errors if the policy already exists
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
