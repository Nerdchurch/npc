// Buttondown newsletter API service
// https://api.buttondown.email/v1/

class ButtondownService {
  constructor() {
    this.apiKey = import.meta.env.VITE_BUTTONDOWN_API_KEY;
    this.baseUrl = 'https://api.buttondown.email/v1';
    
    if (!this.apiKey) {
      console.warn('Buttondown API key not found. Newsletter functionality will be disabled.');
    }
  }

  /**
   * Subscribe a user to the newsletter
   * @param {Object} subscriber - Subscriber information
   * @param {string} subscriber.email - Email address (required)
   * @param {string} subscriber.name - Full name (optional)
   * @param {Object} subscriber.metadata - Additional metadata (optional)
   * @returns {Promise<Object>} - API response
   */
  async subscribe({ email, name, metadata = {} }) {
    if (!this.apiKey) {
      console.warn('Buttondown API key not configured');
      return { success: false, error: 'API key not configured' };
    }

    try {
      const response = await fetch(`${this.baseUrl}/subscribers`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          notes: name || '',
          metadata: {
            source: 'npc_website_signup',
            signup_date: new Date().toISOString(),
            ...metadata
          }
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Successfully subscribed to newsletter:', email);
        return { success: true, data };
      } else {
        // Handle specific error cases
        if (response.status === 400 && data.email && data.email.includes('already exists')) {
          console.log('Email already subscribed:', email);
          return { success: true, data, message: 'Already subscribed' };
        }
        
        console.error('Buttondown subscription error:', data);
        return { success: false, error: data };
      }
    } catch (error) {
      console.error('Network error subscribing to newsletter:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Unsubscribe a user from the newsletter
   * @param {string} email - Email address to unsubscribe
   * @returns {Promise<Object>} - API response
   */
  async unsubscribe(email) {
    if (!this.apiKey) {
      console.warn('Buttondown API key not configured');
      return { success: false, error: 'API key not configured' };
    }

    try {
      // First, get the subscriber ID
      const subscriber = await this.getSubscriber(email);
      if (!subscriber.success) {
        return { success: false, error: 'Subscriber not found' };
      }

      const response = await fetch(`${this.baseUrl}/subscribers/${subscriber.data.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${this.apiKey}`,
        },
      });

      if (response.ok) {
        console.log('Successfully unsubscribed:', email);
        return { success: true };
      } else {
        const data = await response.json();
        console.error('Buttondown unsubscribe error:', data);
        return { success: false, error: data };
      }
    } catch (error) {
      console.error('Network error unsubscribing from newsletter:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get subscriber information by email
   * @param {string} email - Email address
   * @returns {Promise<Object>} - Subscriber data
   */
  async getSubscriber(email) {
    if (!this.apiKey) {
      return { success: false, error: 'API key not configured' };
    }

    try {
      const response = await fetch(`${this.baseUrl}/subscribers?email=${encodeURIComponent(email)}`, {
        headers: {
          'Authorization': `Token ${this.apiKey}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.results && data.results.length > 0) {
        return { success: true, data: data.results[0] };
      } else {
        return { success: false, error: 'Subscriber not found' };
      }
    } catch (error) {
      console.error('Error fetching subscriber:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update subscriber newsletter status in Supabase
   * @param {string} email - Email address
   * @param {boolean} subscribed - Newsletter subscription status
   * @returns {Promise<Object>} - Update result
   */
  async updateSubscriptionStatus(email, subscribed) {
    try {
      const { supabase } = await import('@/lib/supabaseClient');
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          newsletter_subscribed: subscribed,
          newsletter_updated_at: new Date().toISOString()
        })
        .eq('email', email);

      if (error) {
        console.error('Error updating newsletter status in database:', error);
        return { success: false, error };
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating subscription status:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle newsletter subscription with database sync
   * @param {Object} params - Subscription parameters
   * @param {string} params.email - Email address
   * @param {string} params.name - Full name
   * @param {boolean} params.subscribe - Whether to subscribe
   * @param {Object} params.metadata - Additional metadata
   * @returns {Promise<Object>} - Operation result
   */
  async handleSubscription({ email, name, subscribe, metadata = {} }) {
    try {
      let result;
      
      if (subscribe) {
        // Subscribe to Buttondown
        result = await this.subscribe({ email, name, metadata });
      } else {
        // Unsubscribe from Buttondown
        result = await this.unsubscribe(email);
      }

      // Update database regardless of Buttondown result
      // (keeps user in database but tracks newsletter preference)
      await this.updateSubscriptionStatus(email, subscribe);

      return result;
    } catch (error) {
      console.error('Error handling newsletter subscription:', error);
      return { success: false, error: error.message };
    }
  }
}

export const buttondownService = new ButtondownService();
export default buttondownService;