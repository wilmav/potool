-- DEFINITIVE FIX FOR WIDGET INSERT POLICY
-- Using SECURITY DEFINER functions to bypass RLS on joined tables completely.

-- 1. Helper Function: Check if user owns the TAB (Parent of the new widget)
-- Run as admin (SECURITY DEFINER) to avoid RLS issues on dashboard_tabs/dashboards during the check
CREATE OR REPLACE FUNCTION public.check_is_owner_of_tab(p_tab_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.dashboard_tabs t
    JOIN public.dashboards d ON d.id = t.dashboard_id
    WHERE t.id = p_tab_id
    AND d.owner_id = auth.uid()
  );
END;
$$;

-- 2. Helper Function: Check if user owns the WIDGET (for update/delete)
-- (Ensuring this exists and is up to date)
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

-- 3. DROP ALL Widget Policies to be clean
DROP POLICY IF EXISTS "Owner Manage Widgets" ON public.widgets;
DROP POLICY IF EXISTS "Owner Insert Widgets" ON public.widgets;
DROP POLICY IF EXISTS "Owner Update Delete Widgets" ON public.widgets;
DROP POLICY IF EXISTS "Owner Delete Widgets" ON public.widgets;
DROP POLICY IF EXISTS "Owner Select Widgets" ON public.widgets;
-- Also drop any others that might have crept in
DROP POLICY IF EXISTS "Users can view widgets if they can view dashboard" ON public.widgets;
DROP POLICY IF EXISTS "Users can manage widgets if owner or editor" ON public.widgets;


-- 4. APPLY NEW ROBUST POLICIES

-- INSERT: Check if we own the parent tab
CREATE POLICY "Owner Insert Widgets"
ON public.widgets
FOR INSERT
WITH CHECK (public.check_is_owner_of_tab(tab_id));

-- UPDATE: Check if we own the widget
CREATE POLICY "Owner Update Widgets"
ON public.widgets
FOR UPDATE
USING (public.check_is_owner_of_widget(id));

-- DELETE: Check if we own the widget
CREATE POLICY "Owner Delete Widgets"
ON public.widgets
FOR DELETE
USING (public.check_is_owner_of_widget(id));

-- SELECT: Check if we own the widget (or tab? keeping it simple for now)
-- Actually, for SELECT, we might usually want "If I can see the dashboard, I can see the widget".
-- But sticking to OWNER ONLY for now to ensure stability.
CREATE POLICY "Owner Select Widgets"
ON public.widgets
FOR SELECT
USING (public.check_is_owner_of_widget(id));
