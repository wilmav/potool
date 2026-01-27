-- FORCE RESET DASHBOARD POLICIES
-- Run this to clear all weird RLS issues and set simple "Owner" access.

-- 1. Disable RLS momentarily to ensure we can fix things if needed (optional, good for debugging)
-- ALTER TABLE public.dashboards DISABLE ROW LEVEL SECURITY; 
-- (Uncomment above line if nothing else works, but let's try fixing policies first)

-- 2. Drop ALL existing policies on dashboards and permissions
DROP POLICY IF EXISTS "Users can view their own dashboards" ON public.dashboards;
DROP POLICY IF EXISTS "Users can view shared dashboards" ON public.dashboards;
DROP POLICY IF EXISTS "Users can insert their own dashboards" ON public.dashboards;
DROP POLICY IF EXISTS "Users can update their own dashboards" ON public.dashboards;
DROP POLICY IF EXISTS "Editors can update shared dashboards" ON public.dashboards;
DROP POLICY IF EXISTS "Users can delete their own dashboards" ON public.dashboards;

DROP POLICY IF EXISTS "Users can view permissions for dashboards they have access to" ON public.dashboard_permissions;
DROP POLICY IF EXISTS "Users can view own permissions" ON public.dashboard_permissions;
DROP POLICY IF EXISTS "Owners can view permissions" ON public.dashboard_permissions;
DROP POLICY IF EXISTS "Owners can manage permissions" ON public.dashboard_permissions;

-- 3. Re-Create SIMPLEST Owner Policies (Ignore Sharing for a moment to verify data exists)

CREATE POLICY "Owner Select" ON public.dashboards
FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Owner Insert" ON public.dashboards
FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owner Update" ON public.dashboards
FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Owner Delete" ON public.dashboards
FOR DELETE USING (auth.uid() = owner_id);

-- 4. Simple Permission Policy (if needed for joins, but Owner Select on dashboards should work without this for pure owner view)
CREATE POLICY "Access Permissions" ON public.dashboard_permissions
FOR ALL USING (user_id = auth.uid());

-- 5. Helper verification: Count dashboards for current user (bypassing RLS)
-- You can run this function call: select debug_count_dashboards();
CREATE OR REPLACE FUNCTION public.debug_count_dashboards()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    count_ integer;
BEGIN
    SELECT count(*) INTO count_ FROM public.dashboards WHERE owner_id = auth.uid();
    RETURN count_;
END;
$$;
