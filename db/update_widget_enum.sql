-- Add new values to widget_type enum
ALTER TYPE public.widget_type ADD VALUE IF NOT EXISTS 'stats';
ALTER TYPE public.widget_type ADD VALUE IF NOT EXISTS 'notes';
