-- FIX: Infinite Recursion in RLS Policies
-- The issue is that 'dashboards' policy queries 'permissions', and 'permissions' policy queries 'dashboards'.
-- We break this cycle by creating a SECURITY DEFINER function to check dashboard ownership.
-- This function runs with the privileges of the creator (postgres/admin), bypassing the row-level security checks on the 'dashboards' table for this specific check.

-- 1. Create the helper function
create or replace function public.is_dashboard_owner(_dashboard_id uuid)
returns boolean
language plpgsql
security definer
as $$
begin
  return exists (
    select 1
    from public.dashboards
    where id = _dashboard_id
    and owner_id = auth.uid()
  );
end;
$$;

-- 2. Drop the recursive policy on permissions
drop policy if exists "Users can view permissions for dashboards they have access to" on public.dashboard_permissions;

-- 3. Create the new non-recursive policy
create policy "Users can view permissions for dashboards they have access to"
  on public.dashboard_permissions for select
  using (
    -- User can see their own permission
    user_id = auth.uid()
    OR
    -- OR User is the owner (checked via safe function)
    public.is_dashboard_owner(dashboard_id)
  );

-- 4. Ensure Owners can manage permissions (existing policy might be affected if it relied on recursive checks, but "Owners can manage permissions" checked dashboards directly)
-- Let's redefine it to be safe just in case
drop policy if exists "Owners can manage permissions" on public.dashboard_permissions;

create policy "Owners can manage permissions"
  on public.dashboard_permissions for all
  using (
    public.is_dashboard_owner(dashboard_id)
  );
