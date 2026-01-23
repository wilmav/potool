-- Allow anyone to READ (Public access) - Required for the "Public" bucket setting to work effectively for images
-- (Note: "Public" bucket setting in dashboard usually handles the read policy, but being explicit is good)
-- BUT, critically, we restricted UPLOADS (INSERT) and DELETES to authenticated users only.

-- 1. Enable RLS on storage.objects if not already enabled
alter table storage.objects enable row level security;

-- 2. Policy: Allow Authenticated Users to UPLOAD files to their own folder 'images/{user_id}/...'
create policy "Users can upload their own images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Policy: Allow Users to DELETE their own images
create policy "Users can delete their own images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Policy: Public Read Access (Matches the "Public Bucket" setting)
create policy "Public Access"
on storage.objects for select
to public
using ( bucket_id = 'images' );
