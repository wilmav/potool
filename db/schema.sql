-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES / USERS (Extends Auth)
create table profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  preferred_language text default 'fi', -- 'fi' or 'en'
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS for Profiles
alter table profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Trigger to create profile on signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. BULLET TEMPLATES (The Library)
create table bullet_templates (
  id uuid default uuid_generate_v4() primary key,
  theme text not null, -- e.g., 'Discovery', 'Riskit'
  tags text[], -- Array of strings
  fi_text text not null,
  en_text text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS for Bullets (Publicly readable, admin writable - for now just readable by auth)
alter table bullet_templates enable row level security;
create policy "Authenticated users can read bullets" on bullet_templates for select using (auth.role() = 'authenticated');

-- 3. NOTES
create table notes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  title text default 'Untitled Plan',
  content text, -- Markdown or JSON
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS for Notes
alter table notes enable row level security;
create policy "Users can CRUD own notes" on notes for all using (auth.uid() = user_id);

-- 4. USER SELECTED BULLETS (State of bullets per project/note)
create table user_selected_bullets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  bullet_id uuid references bullet_templates(id) not null,
  note_id uuid references notes(id), -- Optional link to specific note
  is_active boolean default false,
  is_hidden boolean default false,
  is_promoted boolean default false,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS for User Selections
alter table user_selected_bullets enable row level security;
create policy "Users can CRUD own selections" on user_selected_bullets for all using (auth.uid() = user_id);

-- SEED DATA (Initial Bullets)
insert into bullet_templates (theme, fi_text, en_text, tags) values
('Discovery', 'Käyttäjäsegmentit', 'User Segments', '{discovery, ux}'),
('Discovery', 'Ongelman validointi', 'Problem Validation', '{discovery, product}'),
('Discovery', 'Hypoteesit', 'Hypotheses', '{discovery, product}'),
('Riskit', 'Tekniset riskit', 'Technical Risks', '{risk, tech}'),
('Riskit', 'Tietosuoja (GDPR)', 'Data Privacy (GDPR)', '{risk, legal}'),
('Määrittely', 'Käyttäjätarinat', 'User Stories', '{specs, agile}'),
('Määrittely', 'Hyväksymiskriteerit', 'Acceptance Criteria', '{specs, agile}'),
('Kommunikaatio', 'Stakeholder-päivitys', 'Stakeholder Update', '{comms, management}'),
('Go-to-market', 'Julkaisusuunnitelma', 'Release Plan', '{gtm, ops}');
