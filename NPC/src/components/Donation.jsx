
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const Donation = () => {
  const { toast } = useToast();
  const [amount, setAmount] = useState('25');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDonate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!amount || Number(amount) < 1) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a donation amount of at least $1.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }

    const anonymousEmail = `anon-${Date.now()}@npc.org`;

    // 1. Insert a submission record for the anonymous donation
    const { data: submissionData, error: submissionError } = await supabase
      .from('submissions')
      .insert({
        username: 'anonymous',
        full_name: 'Anonymous Donor',
        email: anonymousEmail, // Use a unique anonymous email for Stripe
        newsletter: false,
        message: `Standalone anonymous donation of $${amount}.`,
        status: 'pending',
      })
      .select('id')
      .single();
    
    if (submissionError) {
      toast({
        title: 'Submission Failed',
        description: submissionError.message,
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }

    // 2. Trigger Stripe Checkout
    try {
      const { data, error: functionError } = await supabase.functions.invoke('create-checkout-session', {
        body: JSON.stringify({
          email: anonymousEmail, // Pass the anonymous email to Stripe
          fullName: 'Anonymous Donor',
          submissionId: submissionData.id,
          amount: Number(amount) * 100, // Pass amount in cents
        }),
      });

      if (functionError) throw functionError;

      const stripe = await stripePromise;
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }
    } catch (error) {
      toast({
        title: 'Donation Error',
        description: `Could not redirect to checkout: ${error.message}`,
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  };

  return (
    <section id="donate" className="py-20 px-4 sm:px-6 lg:px-8 bg-black text-white">
      <div className="max-w-2xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold mb-6"
        >
          Support Our Work Anonymously
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-lg mb-8 leading-relaxed"
        >
          Your contribution helps us build inclusive, creative communities where everyone belongs.
        </motion.p>

        <motion.form
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          onSubmit={handleDonate}
          className="bg-white text-black p-8 border-2 border-white space-y-6"
        >
          <div className="space-y-2">
            <Label htmlFor="amount">Donation Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="25"
              min="1"
              required
              className="border-black focus:ring-black text-lg"
            />
          </div>
          
          <div className="text-sm text-gray-600 border-t border-gray-200 pt-4">
            <p className="font-semibold">Your Privacy is Protected</p>
            <p>You will be asked for payment information on the next screen for processing, but NPC will **not** see or store your personal details. Your donation will be recorded anonymously.</p>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full border-2 border-black bg-black text-white hover:bg-white hover:text-black font-bold py-6 disabled:opacity-50"
          >
            {isSubmitting ? 'Processing...' : 'Donate Anonymously'}
          </Button>
        </motion.form>
      </div>
    </section>
  );
};

export default Donation;
