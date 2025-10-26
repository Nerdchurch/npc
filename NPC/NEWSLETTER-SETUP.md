# Buttondown Newsletter Integration Setup Guide

## Overview
This integration automatically syncs newsletter subscriptions between your NPC website and Buttondown, keeping users in your Supabase database regardless of their newsletter preference.

## Setup Steps

### 1. Buttondown Account Setup
1. **Create a Buttondown account** at https://buttondown.email/
2. **Get your API key**:
   - Go to Buttondown Dashboard → Settings → Programming
   - Copy your API key
3. **Add API key to your environment**:
   ```bash
   # Add to your .env file
   VITE_BUTTONDOWN_API_KEY="your_buttondown_api_key_here"
   ```

### 2. Database Setup
1. **Run the SQL migration** in your Supabase SQL editor:
   ```sql
   -- Copy and paste contents from database/add_newsletter_fields.sql
   ```
2. **Verify the changes**:
   - Check that `newsletter_subscribed` and `newsletter_updated_at` columns were added to `profiles` table
   - Verify the `newsletter_stats` view was created

### 3. Update Row Level Security (RLS) Policies
Add these policies in Supabase Dashboard → Authentication → Policies:

```sql
-- Allow users to read their own newsletter preferences
CREATE POLICY "Users can view own newsletter preferences" ON profiles
FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own newsletter preferences  
CREATE POLICY "Users can update own newsletter preferences" ON profiles
FOR UPDATE USING (auth.uid() = id);

-- Allow reading newsletter stats (optional, for admin dashboard)
CREATE POLICY "Authenticated users can view newsletter stats" ON newsletter_stats
FOR SELECT TO authenticated USING (true);
```

## Integration Features

### ✅ Automatic Newsletter Signup
- **When**: User checks "newsletter" checkbox during signup
- **Action**: Automatically subscribes email to Buttondown
- **Fallback**: If Buttondown fails, user still gets created (graceful degradation)

### ✅ Newsletter Preference Management
- **Component**: `NewsletterPreferences.jsx` 
- **Usage**: Add to user dashboard/profile pages
- **Features**: 
  - Subscribe/unsubscribe toggle
  - Real-time sync with Buttondown
  - Keeps database record even when unsubscribed

### ✅ Standalone Newsletter Widget
- **Component**: `NewsletterSignup.jsx`
- **Usage**: Add anywhere on site for general newsletter signup
- **Features**: Email validation, success/error states, duplicate handling

### ✅ Database Sync
- **Behavior**: All newsletter preferences stored in Supabase
- **Benefit**: Users remain in your database regardless of newsletter status
- **Tracking**: `newsletter_updated_at` timestamp for analytics

## Usage Examples

### In User Dashboard
```jsx
import NewsletterPreferences from '@/components/NewsletterPreferences';

function UserDashboard() {
  return (
    <div className="space-y-6">
      <h2>Account Settings</h2>
      <NewsletterPreferences />
      {/* other dashboard content */}
    </div>
  );
}
```

### In Footer or Sidebar
```jsx
import NewsletterSignup from '@/components/NewsletterSignup';

function Footer() {
  return (
    <footer>
      <NewsletterSignup 
        title="Stay Connected"
        description="Get NPC updates and volunteer opportunities"
        className="max-w-md"
      />
    </footer>
  );
}
```

### Custom Newsletter Signup
```jsx
import { buttondownService } from '@/lib/buttondownService';

async function handleCustomSignup(email, name) {
  const result = await buttondownService.handleSubscription({
    email,
    name,
    subscribe: true,
    metadata: {
      source: 'custom_form',
      location: 'homepage'
    }
  });
  
  if (result.success) {
    console.log('Subscribed successfully!');
  }
}
```

## API Reference

### ButtondownService Methods

#### `subscribe({ email, name, metadata })`
- Adds email to Buttondown newsletter
- Returns: `{ success: boolean, data?: object, error?: string }`

#### `unsubscribe(email)`  
- Removes email from Buttondown newsletter
- Returns: `{ success: boolean, error?: string }`

#### `handleSubscription({ email, name, subscribe, metadata })`
- Unified method that subscribes OR unsubscribes
- Also updates Supabase database
- Returns: `{ success: boolean, data?: object, error?: string }`

#### `getSubscriber(email)`
- Gets subscriber info from Buttondown
- Returns: `{ success: boolean, data?: object, error?: string }`

### Metadata Options
```javascript
{
  source: 'signup_form' | 'newsletter_widget' | 'profile_update' | 'custom',
  signup_date: '2024-10-26T10:30:00Z',
  interests: 'Community Building, Events',
  pronouns: 'they/them',
  user_id: 'uuid',
  location: 'homepage' | 'footer' | 'dashboard'
}
```

## Testing

### 1. Test Signup Flow
1. Go to `/signup` 
2. Fill form and check newsletter checkbox
3. Submit form
4. Verify:
   - User created in Supabase
   - Email appears in Buttondown subscribers
   - `newsletter_subscribed = true` in profiles table

### 2. Test Preference Changes
1. Add `NewsletterPreferences` component to dashboard
2. Toggle subscription on/off
3. Verify changes sync to both Buttondown and Supabase

### 3. Test Error Handling
1. Use invalid Buttondown API key
2. Verify signup still works (graceful degradation)
3. Check error messages are user-friendly

## Analytics & Monitoring

### Newsletter Stats Query
```sql
SELECT * FROM newsletter_stats;
```

### Recent Newsletter Activity
```sql
SELECT 
  email,
  newsletter_subscribed,
  newsletter_updated_at
FROM profiles 
WHERE newsletter_updated_at >= NOW() - INTERVAL '7 days'
ORDER BY newsletter_updated_at DESC;
```

### Subscription Rate by Month
```sql
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as total_signups,
  COUNT(CASE WHEN newsletter_subscribed THEN 1 END) as newsletter_signups,
  ROUND(
    COUNT(CASE WHEN newsletter_subscribed THEN 1 END)::float / COUNT(*) * 100, 
    2
  ) as subscription_rate
FROM profiles 
WHERE created_at >= NOW() - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;
```

## Troubleshooting

### Common Issues

**Newsletter signup fails silently**
- Check API key is correct in `.env` 
- Verify Buttondown account is active
- Check browser console for errors

**Database sync issues**
- Verify RLS policies allow updates
- Check `newsletter_updated_at` trigger is working
- Ensure user has proper permissions

**Double subscriptions**
- Buttondown handles duplicates automatically
- Service returns success for existing subscribers
- Check `metadata` to identify source

### Debug Mode
Set debug logging in `buttondownService.js`:
```javascript
const DEBUG = true; // Add this at top of file

// Add throughout service methods:
if (DEBUG) console.log('Debug info:', data);
```

## Security Notes

- ✅ API key is client-side safe (Buttondown design)
- ✅ Email addresses are validated before submission
- ✅ RLS policies protect user data in Supabase
- ✅ No sensitive data sent to Buttondown
- ✅ Graceful degradation if service unavailable

## Next Steps

1. **Set up automated campaigns** in Buttondown
2. **Create newsletter templates** for different user segments
3. **Add newsletter metrics** to admin dashboard
4. **Set up webhook** for Buttondown events (optional)
5. **Create welcome email** flow for new subscribers