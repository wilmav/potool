-- Add deleted_at column to notes
alter table notes add column if not exists deleted_at timestamp with time zone default null;

-- Add deleted_at column to note_versions
alter table note_versions add column if not exists deleted_at timestamp with time zone default null;

-- Update RLS policies (optional, but good practice if we want to enforce it at DB level)
-- For now, we will filter in the application layer as per common soft-delete patterns,
-- but we could add a policy like:
-- create policy "Users can view non-deleted notes" on notes for select using (auth.uid() = user_id and deleted_at is null);
-- However, we want to be able to fetch trash too, so we'll handle filtering in the query.
