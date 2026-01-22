-- User Settings Table for storing preferences per user
create table if not exists user_settings (
  user_id uuid references profiles(id) primary key,
  category_colors jsonb default '{}'::jsonb,
  language text default 'fi',
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Safely add recent_colors column if it doesn't exist
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'user_settings' and column_name = 'recent_colors') then
    alter table user_settings add column recent_colors text[] default array['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#8b5cf6', '#ffffff']::text[];
  end if;
end $$;

-- RLS
alter table user_settings enable row level security;

-- Drop existing policies to ensure clean state (avoids "policy already exists" error)
drop policy if exists "Users can view own settings" on user_settings;
drop policy if exists "Users can insert own settings" on user_settings;
drop policy if exists "Users can update own settings" on user_settings;

-- Recreate policies
create policy "Users can view own settings" 
  on user_settings for select 
  using (auth.uid() = user_id);

create policy "Users can insert own settings" 
  on user_settings for insert 
  with check (auth.uid() = user_id);

create policy "Users can update own settings" 
  on user_settings for update 
  using (auth.uid() = user_id);

-- Function to handle timestamp update
create or replace function public.handle_updated_at() 
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Drop trigger if exists to avoid error
drop trigger if exists on_user_settings_updated on user_settings;

create trigger on_user_settings_updated
  before update on user_settings
  for each row execute procedure public.handle_updated_at();
