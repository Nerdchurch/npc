-- Add newsletter subscription fields to profiles table
-- Run this SQL in your Supabase SQL editor

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS newsletter_subscribed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS newsletter_updated_at TIMESTAMPTZ DEFAULT now();

-- Add index for newsletter queries
CREATE INDEX IF NOT EXISTS idx_profiles_newsletter_subscribed 
ON profiles (newsletter_subscribed);

-- Add index for newsletter update tracking
CREATE INDEX IF NOT EXISTS idx_profiles_newsletter_updated 
ON profiles (newsletter_updated_at);

-- Create a function to automatically update newsletter_updated_at
CREATE OR REPLACE FUNCTION update_newsletter_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.newsletter_subscribed IS DISTINCT FROM NEW.newsletter_subscribed THEN
    NEW.newsletter_updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update newsletter_updated_at when newsletter_subscribed changes
DROP TRIGGER IF EXISTS trigger_update_newsletter_updated_at ON profiles;
CREATE TRIGGER trigger_update_newsletter_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_newsletter_updated_at();

-- Optional: Create a view for newsletter analytics
CREATE OR REPLACE VIEW newsletter_stats AS
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN newsletter_subscribed = true THEN 1 END) as subscribed_users,
  COUNT(CASE WHEN newsletter_subscribed = false THEN 1 END) as unsubscribed_users,
  ROUND(
    (COUNT(CASE WHEN newsletter_subscribed = true THEN 1 END)::float / 
     NULLIF(COUNT(*), 0) * 100)::numeric, 
    2
  ) as subscription_rate_percent
FROM profiles
WHERE id IS NOT NULL;

-- Grant necessary permissions (adjust based on your RLS policies)
-- GRANT SELECT ON newsletter_stats TO authenticated;

-- Add comment for documentation
COMMENT ON COLUMN profiles.newsletter_subscribed IS 'Whether user is subscribed to the newsletter via Buttondown';
COMMENT ON COLUMN profiles.newsletter_updated_at IS 'Timestamp when newsletter subscription status was last changed';
COMMENT ON VIEW newsletter_stats IS 'Analytics view for newsletter subscription metrics';