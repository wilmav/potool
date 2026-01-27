-- Create a new private bucket for project files
-- We use a new bucket 'project_files' instead of mixing with 'images'

-- 1. Create the bucket if it doesn't exist (insert into storage.buckets)
insert into storage.buckets (id, name, public)
values ('project_files', 'project_files', false) -- Private by default
on conflict (id) do nothing;

-- 2. Enable RLS
-- (buckets table RLS is usually handled by system, we focus on objects)

-- 3. Policies for project_files

-- ALLOW UPLOAD (INSERT) for Authenticated Users to their own folder
create policy "Users can upload their own files"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'project_files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ALLOW DELETE for Authenticated Users to their own files
create policy "Users can delete their own files"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'project_files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ALLOW SELECT (Read) for Authenticated Users (users can only see their own files?)
-- OR Public read if they have the link? 
-- Let's make it so users can only list/read their own files for now (Private).
-- If we want "Shareable links", we might need signed URLs or public bucket.
-- For "Upload and Download", signed URLs are safer for private docs.
-- However, "images" bucket was public.
-- Requirement says "Files... PDF etc". Better safe.
-- We will use signed URLs for downloading in the UI if it's private.
-- OR simple Policy: Users can Select their own files.

create policy "Users can read their own files"
on storage.objects for select
to authenticated
using (
  bucket_id = 'project_files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
