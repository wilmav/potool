-- EMERGENCY DEBUG: OPEN WIDGET ACCESS
-- The complex ownership checks are failing. Let's simplify to "Any Logged In User" for now.
-- This confirms if the issue is just the Logic vs. System permissions.

-- 1. Drop ALL existing policies on widgets
DROP POLICY IF EXISTS "Owner Manage Widgets" ON public.widgets;
DROP POLICY IF EXISTS "Owner Insert Widgets" ON public.widgets;
DROP POLICY IF EXISTS "Owner Update Delete Widgets" ON public.widgets;
DROP POLICY IF EXISTS "Owner Delete Widgets" ON public.widgets;
DROP POLICY IF EXISTS "Owner Select Widgets" ON public.widgets;
DROP POLICY IF EXISTS "Owner Update Widgets" ON public.widgets;

-- 2. Create a "Development Access" Policy
-- "If you are logged in, you can Insert/Update/Delete/Select ANY widget."
CREATE POLICY "Dev Allow All Authenticated Widgets"
ON public.widgets
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- This effectively disables RLS restrictions for logged-in users on this table.
-- If this works, we know the previous logic (Start/End dates/Ownership) was the blocker.
