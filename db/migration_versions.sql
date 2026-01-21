-- Create note_versions table
create table note_versions (
  id uuid default uuid_generate_v4() primary key,
  note_id uuid references notes(id) not null,
  title text not null,
  content text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS for Note Versions
alter table note_versions enable row level security;

-- Users can view versions of their own notes
create policy "Users can view own note versions" 
  on note_versions for select 
  using (
    exists (
      select 1 from notes 
      where notes.id = note_versions.note_id 
      and notes.user_id = auth.uid()
    )
  );

-- Users can insert versions for their own notes
create policy "Users can insert own note versions" 
  on note_versions for insert 
  with check (
    exists (
      select 1 from notes 
      where notes.id = note_versions.note_id 
      and notes.user_id = auth.uid()
    )
  );
