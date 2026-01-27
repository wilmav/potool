-- FIX WIDGET INSERT POLICY
-- The previous policy failed for INSERT because the widget didn't exist yet to be checked.

-- 1. Drop the broken "catch-all" policy
DROP POLICY IF EXISTS "Owner Manage Widgets" ON public.widgets;

-- 2. Create INSERT Policy (Check Parent Tab Ownership)
CREATE POLICY "Owner Insert Widgets"
ON public.widgets
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.dashboard_tabs t
    JOIN public.dashboards d ON d.id = t.dashboard_id
    WHERE t.id = tab_id  -- 'tab_id' is the column in the new widget row
    AND d.owner_id = auth.uid()
  )
);

-- 3. Create UPDATE/DELETE Policy (Check Existing Widget Ownership)
-- We can reuse the helper function here since the widget exists
CREATE POLICY "Owner Update Delete Widgets"
ON public.widgets
FOR UPDATE
USING (public.check_is_owner_of_widget(id));

CREATE POLICY "Owner Delete Widgets"
ON public.widgets
FOR DELETE
USING (public.check_is_owner_of_widget(id));

-- 4. Create SELECT Policy (Owner view)
CREATE POLICY "Owner Select Widgets"
ON public.widgets
FOR SELECT
USING (public.check_is_owner_of_widget(id));
