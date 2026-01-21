-- Add description columns if they don't exist
ALTER TABLE bullet_templates 
ADD COLUMN IF NOT EXISTS fi_description text,
ADD COLUMN IF NOT EXISTS en_description text;
