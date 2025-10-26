import React, { useState } from 'react';
import { buttondownService } from '@/lib/buttondownService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Mail, Loader2, CheckCircle } from 'lucide-react';

const NewsletterSignup = ({ 
  className = "",
  placeholder = "Enter your email...",
  buttonText = "Subscribe",
  showTitle = true,
  title = "Stay Updated",
  description = "Get the latest NPC news and opportunities delivered to your inbox."
}) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive"
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await buttondownService.handleSubscription({
        email: email.trim(),
        subscribe: true,
        metadata: {
          source: 'newsletter_widget',
          signup_page: window.location.pathname
        }
      });

      if (result.success) {
        setIsSuccess(true);
        setEmail('');
        toast({
          title: "Successfully Subscribed!",
          description: result.message === 'Already subscribed' 
            ? "You're already on our newsletter list!" 
            : "Welcome to the NPC newsletter!",
          variant: "default"
        });
      } else {
        toast({
          title: "Subscription Failed",
          description: result.error?.message || "There was an issue subscribing you to the newsletter. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Newsletter signup error:', error);
      toast({
        title: "Network Error",
        description: "Unable to connect to newsletter service. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={`p-4 bg-green-50 border border-green-200 rounded-lg ${className}`}>
        <div className="flex items-center space-x-2 text-green-800">
          <CheckCircle className="h-5 w-5" />
          <h3 className="font-medium">Successfully Subscribed!</h3>
        </div>
        <p className="mt-2 text-sm text-green-700">
          Thank you for joining our newsletter. You'll receive updates about NPC events and opportunities.
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-3 border-green-300 text-green-700 hover:bg-green-100"
          onClick={() => setIsSuccess(false)}
        >
          Subscribe Another Email
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {showTitle && (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          disabled={isSubmitting}
          className="flex-1"
          required
        />
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="px-4"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Subscribing...
            </>
          ) : (
            <>
              <Mail className="h-4 w-4 mr-2" />
              {buttonText}
            </>
          )}
        </Button>
      </form>
      
      <p className="text-xs text-gray-500">
        We respect your privacy. Unsubscribe at any time.
      </p>
    </div>
  );
};

export default NewsletterSignup;