-- FIX WIDGET POLICIES TO BE SIMPLE AND ROBUST
-- Ensure owners can always delete widgets without complex recursive joins.

-- 1. Helper Function (Same as before, ensuring it exists)
CREATE OR REPLACE FUNCTION public.check_is_owner_of_widget(p_widget_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.widgets w
    JOIN public.dashboard_tabs t ON t.id = w.tab_id
    JOIN public.dashboards d ON d.id = t.dashboard_id
    WHERE w.id = p_widget_id
    AND d.owner_id = auth.uid()
  );
END;
$$;

-- 2. Drop Old Widget Policies
DROP POLICY IF EXISTS "Users can view widgets if they can view dashboard" ON public.widgets;
DROP POLICY IF EXISTS "Users can manage widgets if owner or editor" ON public.widgets;
DROP POLICY IF EXISTS "Owner Select Widgets" ON public.widgets; -- Cleanup just in case
DROP POLICY IF EXISTS "Owner Manage Widgets" ON public.widgets;

-- 3. Create SIMPLE Policies

-- VIEW: Anyone with permission to the dashboard (via checks or simple owner check)
-- Staying simple for now: Owner Only first to verify functionality
CREATE POLICY "Owner Manage Widgets"
ON public.widgets
FOR ALL
USING (public.check_is_owner_of_widget(id));

-- Note: Editors logic can be added later once Basic Owner Deletion is confirmed working.
