-- Create comments table
create table public.comments (
  id uuid default gen_random_uuid() primary key,
  note_id uuid references public.notes(id) on delete cascade not null,
  user_id uuid references auth.users(id) not null,
  content text not null,
  is_resolved boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for comments
alter table public.comments enable row level security;

-- Policies for comments
create policy "Users can view comments on their notes"
  on public.comments for select
  using (
    exists (
      select 1 from public.notes
      where id = public.comments.note_id
      and user_id = auth.uid()
    )
  );

create policy "Users can create comments on their notes"
  on public.comments for insert
  with check (
    exists (
      select 1 from public.notes
      where id = public.comments.note_id
      and user_id = auth.uid()
    )
  );

create policy "Users can update their own comments"
  on public.comments for update
  using (user_id = auth.uid());

create policy "Users can delete their own comments"
  on public.comments for delete
  using (user_id = auth.uid());

-- Add plan_viewer to widget_type enum if it doesn't exist
ALTER TYPE public.widget_type ADD VALUE IF NOT EXISTS 'plan_viewer';
