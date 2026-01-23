-- Dashboards Table
create table public.dashboards (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references auth.users(id) not null,
  title text not null default 'My Dashboard',
  is_shared boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Dashboard Tabs Table
create table public.dashboard_tabs (
  id uuid default gen_random_uuid() primary key,
  dashboard_id uuid references public.dashboards(id) on delete cascade not null,
  title text not null,
  order_index integer default 0,
  is_present_friendly boolean default false,
  color text, -- For the UI styling (e.g., hex code or tailwind class reference)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Widgets Table
create type public.widget_type as enum ('sticky', 'plan_list', 'news', 'calendar', 'meeting_notes');

create table public.widgets (
  id uuid default gen_random_uuid() primary key,
  tab_id uuid references public.dashboard_tabs(id) on delete cascade not null,
  type public.widget_type not null,
  layout jsonb not null default '{}'::jsonb, -- {x, y, w, h}
  config jsonb not null default '{}'::jsonb, -- configuration specific to widget type
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Permissions Table (for shared dashboards)
create type public.dashboard_role as enum ('viewer', 'editor');

create table public.dashboard_permissions (
  id uuid default gen_random_uuid() primary key,
  dashboard_id uuid references public.dashboards(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.dashboard_role default 'viewer',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(dashboard_id, user_id)
);

-- RLS Policies

-- Enable RLS
alter table public.dashboards enable row level security;
alter table public.dashboard_tabs enable row level security;
alter table public.widgets enable row level security;
alter table public.dashboard_permissions enable row level security;

-- Dashboards Policies
create policy "Users can view their own dashboards"
  on public.dashboards for select
  using (auth.uid() = owner_id);

create policy "Users can view shared dashboards"
  on public.dashboards for select
  using (
    exists (
      select 1 from public.dashboard_permissions
      where dashboard_id = public.dashboards.id
      and user_id = auth.uid()
    )
  );

create policy "Users can insert their own dashboards"
  on public.dashboards for insert
  with check (auth.uid() = owner_id);

create policy "Users can update their own dashboards"
  on public.dashboards for update
  using (auth.uid() = owner_id);

create policy "Editors can update shared dashboards"
  on public.dashboards for update
  using (
    exists (
      select 1 from public.dashboard_permissions
      where dashboard_id = public.dashboards.id
      and user_id = auth.uid()
      and role = 'editor'
    )
  );

create policy "Users can delete their own dashboards"
  on public.dashboards for delete
  using (auth.uid() = owner_id);

-- Tabs Policies (Inherit from Dashboard)
create policy "Users can view tabs if they can view dashboard"
  on public.dashboard_tabs for select
  using (
    exists (
      select 1 from public.dashboards d
      left join public.dashboard_permissions p on p.dashboard_id = d.id
      where d.id = public.dashboard_tabs.dashboard_id
      and (d.owner_id = auth.uid() or p.user_id = auth.uid())
    )
  );

create policy "Users can manage tabs if owner or editor"
  on public.dashboard_tabs for all
  using (
    exists (
      select 1 from public.dashboards d
      left join public.dashboard_permissions p on p.dashboard_id = d.id
      where d.id = public.dashboard_tabs.dashboard_id
      and (d.owner_id = auth.uid() or (p.user_id = auth.uid() and p.role = 'editor'))
    )
  );

-- Widgets Policies (Inherit from Tab -> Dashboard)
create policy "Users can view widgets if they can view dashboard"
  on public.widgets for select
  using (
    exists (
      select 1 from public.dashboard_tabs t
      join public.dashboards d on d.id = t.dashboard_id
      left join public.dashboard_permissions p on p.dashboard_id = d.id
      where t.id = public.widgets.tab_id
      and (d.owner_id = auth.uid() or p.user_id = auth.uid())
    )
  );

create policy "Users can manage widgets if owner or editor"
  on public.widgets for all
  using (
    exists (
      select 1 from public.dashboard_tabs t
      join public.dashboards d on d.id = t.dashboard_id
      left join public.dashboard_permissions p on p.dashboard_id = d.id
      where t.id = public.widgets.tab_id
      and (d.owner_id = auth.uid() or (p.user_id = auth.uid() and p.role = 'editor'))
    )
  );

-- Permissions Policies
create policy "Users can view permissions for dashboards they have access to"
  on public.dashboard_permissions for select
  using (
    exists (
      select 1 from public.dashboards d
      where d.id = public.dashboard_permissions.dashboard_id
      and d.owner_id = auth.uid()
    )
    or user_id = auth.uid()
  );

create policy "Owners can manage permissions"
  on public.dashboard_permissions for all
  using (
    exists (
      select 1 from public.dashboards d
      where d.id = public.dashboard_permissions.dashboard_id
      and d.owner_id = auth.uid()
    )
  );
