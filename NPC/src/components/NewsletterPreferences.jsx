import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { buttondownService } from '@/lib/buttondownService';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Mail, MailX } from 'lucide-react';

const NewsletterPreferences = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (profile) {
      setIsSubscribed(profile.newsletter_subscribed || false);
      setIsLoading(false);
    }
  }, [profile]);

  const handleSubscriptionChange = async (newSubscriptionStatus) => {
    if (!user || !profile) return;

    setIsUpdating(true);
    
    try {
      // Update Buttondown subscription
      const result = await buttondownService.handleSubscription({
        email: user.email,
        name: profile.full_name,
        subscribe: newSubscriptionStatus,
        metadata: {
          source: 'profile_update',
          user_id: user.id
        }
      });

      // Update local state regardless of Buttondown result
      // (keeps user preference even if external service fails)
      setIsSubscribed(newSubscriptionStatus);

      // Update database
      const { error: dbError } = await supabase
        .from('profiles')
        .update({
          newsletter_subscribed: newSubscriptionStatus,
          newsletter_updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (dbError) {
        console.error('Database update error:', dbError);
        toast({
          title: "Warning",
          description: "Preference saved locally, but database sync failed. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Success message
      if (result.success || result.message === 'Already subscribed') {
        toast({
          title: newSubscriptionStatus ? "Subscribed!" : "Unsubscribed!",
          description: newSubscriptionStatus 
            ? "You'll receive our newsletter updates." 
            : "You won't receive newsletter updates, but your account remains active.",
          variant: "default"
        });
      } else {
        toast({
          title: "Partial Success",
          description: `Preference updated locally, but newsletter service had an issue: ${result.error}`,
          variant: "default"
        });
      }

    } catch (error) {
      console.error('Subscription update error:', error);
      toast({
        title: "Error",
        description: "Failed to update newsletter preference. Please try again.",
        variant: "destructive"
      });
      
      // Revert local state on error
      setIsSubscribed(!newSubscriptionStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 p-4 border rounded-lg">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading newsletter preferences...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white">
      <div className="flex items-center space-x-2">
        <Mail className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-medium">Newsletter Preferences</h3>
      </div>
      
      <div className="space-y-3">
        <p className="text-sm text-gray-600">
          Stay updated with NPC news, events, and opportunities.
        </p>
        
        <div className="flex items-center space-x-3">
          <Checkbox
            id="newsletter-preference"
            checked={isSubscribed}
            onCheckedChange={handleSubscriptionChange}
            disabled={isUpdating}
          />
          <Label 
            htmlFor="newsletter-preference" 
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {isSubscribed ? (
              <>
                <Mail className="inline h-4 w-4 mr-1" />
                Subscribed to newsletter
              </>
            ) : (
              <>
                <MailX className="inline h-4 w-4 mr-1" />
                Not subscribed to newsletter
              </>
            )}
          </Label>
          
          {isUpdating && (
            <Loader2 className="h-4 w-4 animate-spin ml-2" />
          )}
        </div>

        <p className="text-xs text-gray-500">
          {isSubscribed 
            ? "You're receiving our newsletter. You can unsubscribe anytime."
            : "You won't receive newsletter updates, but your account remains active."
          }
        </p>
      </div>

      <div className="pt-2 border-t">
        <p className="text-xs text-gray-400">
          Newsletter powered by Buttondown. Your email is only used for NPC communications.
        </p>
      </div>
    </div>
  );
};

export default NewsletterPreferences;