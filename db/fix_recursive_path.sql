-- FIX: Infinite Recursion in RLS Policies (Comprehensive)

-- 1. Create a SECURITY DEFINER function to check dashboard ownership safely.
-- This runs with admin privileges, bypassing RLS on the 'dashboards' table to check ownership.
CREATE OR REPLACE FUNCTION public.check_is_owner(p_dashboard_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.dashboards
    WHERE id = p_dashboard_id
    AND owner_id = auth.uid()
  );
END;
$$;

-- 2. Drop existing problematic policies on dashboard_permissions
DROP POLICY IF EXISTS "Users can view permissions for dashboards they have access to" ON public.dashboard_permissions;
DROP POLICY IF EXISTS "Owners can manage permissions" ON public.dashboard_permissions;

-- 3. Create new, granular, non-recursive policies for dashboard_permissions

-- Allow users to see their own permission records (needed for "Users can view shared dashboards" check)
CREATE POLICY "Users can view own permissions"
ON public.dashboard_permissions FOR SELECT
USING (user_id = auth.uid());

-- Allow owners to see all permissions for their dashboards (using safe function)
CREATE POLICY "Owners can view permissions"
ON public.dashboard_permissions FOR SELECT
USING (public.check_is_owner(dashboard_id));

-- Allow owners to manage (insert/update/delete) permissions
CREATE POLICY "Owners can manage permissions"
ON public.dashboard_permissions FOR ALL
USING (public.check_is_owner(dashboard_id));

-- 4. Fix Dashboards Shared Policy
-- Re-defining this to ensure it works with the new permissions policies
DROP POLICY IF EXISTS "Users can view shared dashboards" ON public.dashboards;

CREATE POLICY "Users can view shared dashboards"
ON public.dashboards FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.dashboard_permissions
    WHERE dashboard_id = public.dashboards.id
    AND user_id = auth.uid()
  )
);
