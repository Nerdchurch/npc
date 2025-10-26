
import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const EditProfilePage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    phone: '',
    pronouns: '',
    social_links: '',
    interests: '',
    message: '',
  });
  const [pageLoading, setPageLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProfileData = useCallback(async () => {
    if (!user) {
      setPageLoading(false);
      return;
    }

    setPageLoading(true);
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('email', user.email)
      .single();
    
    if (data) {
      setFormData({
        username: data.username || '',
        full_name: data.full_name || '',
        phone: data.phone || '',
        pronouns: data.pronouns || '',
        social_links: data.social_links || '',
        interests: data.interests || '',
        message: data.message || '',
      });
    } else if (error && error.code !== 'PGRST116') {
      toast({ title: "Error fetching profile", description: error.message, variant: "destructive" });
    }
    setPageLoading(false);
  }, [user]);

  useEffect(() => {
    // If auth has finished loading and there's no user, redirect.
    if (!authLoading && !user) {
      navigate('/login');
    }
    // If there is a user, fetch their data.
    if (user) {
      fetchProfileData();
    }
  }, [user, authLoading, navigate, fetchProfileData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    const { error: submissionError } = await supabase
      .from('submissions')
      .update({
        username: formData.username,
        full_name: formData.full_name,
        phone: formData.phone,
        pronouns: formData.pronouns,
        social_links: formData.social_links,
        interests: formData.interests,
        message: formData.message,
      })
      .eq('email', user.email);

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        username: formData.username,
        full_name: formData.full_name,
      })
      .eq('id', user.id);

    if (submissionError || profileError) {
      toast({ title: "Error updating profile", description: submissionError?.message || profileError?.message, variant: "destructive" });
    } else {
      toast({ title: "Profile Updated", description: "Your changes have been saved successfully!" });
    }

    setIsSubmitting(false);
  };

  if (authLoading || pageLoading) {
    return (
        <div className="min-h-[calc(100vh-15rem)] flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-black" />
        </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Edit Profile | NPC</title>
        <meta name="description" content="Edit your NPC profile details, including contact information, social links, and interests." />
      </Helmet>
      <div className="min-h-[calc(100vh-15rem)] bg-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-12 text-center">Edit Your Profile</h1>
            <form onSubmit={handleSubmit} className="space-y-6 border-2 border-black p-8">
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" name="username" value={formData.username} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input id="full_name" name="full_name" value={formData.full_name} onChange={handleChange} />
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" value={user?.email || ''} disabled className="bg-gray-100" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
                    </div>
                </div>
                 <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="pronouns">Pronouns</Label>
                        <Input id="pronouns" name="pronouns" value={formData.pronouns} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="social_links">Social Links</Label>
                        <Input id="social_links" name="social_links" value={formData.social_links} onChange={handleChange} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="interests">Interest Areas</Label>
                    <Input id="interests" name="interests" value={formData.interests} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" name="message" value={formData.message} onChange={handleChange} rows={5} />
                </div>
                 <div className="border-t border-gray-200 pt-6">
                    <Button type="submit" disabled={isSubmitting} className="w-full border-2 border-black bg-white text-black hover:bg-black hover:text-white font-bold py-6 disabled:opacity-50">
                        {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </div>
      </div>
    </>
  );
};

export default EditProfilePage;
