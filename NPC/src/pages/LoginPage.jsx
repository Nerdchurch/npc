
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data: signInData, error: signInError } = await signIn(email, password);

    if (signInError || !signInData.user) {
      setLoading(false);
      return;
    }
    
    // After successful sign-in, the AuthProvider's onAuthStateChange
    // will fetch the profile. We can navigate to a generic dashboard
    // link and let the DashboardPage component handle the role-based redirect.
    navigate('/dashboard'); 
    
    setLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Login | NPC</title>
        <meta name="description" content="Log in to your NPC account to access your personalized dashboard and community features." />
      </Helmet>
      <main className="min-h-[calc(100vh-15rem)] flex items-center justify-center bg-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div>
            <h1 className="text-center text-3xl font-bold">
              Log in to your account
            </h1>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{' '}
              <Link to="/signup" className="font-medium text-black hover:underline">
                sign up for a new account
              </Link>
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <Label htmlFor="email-address" className="sr-only">Email address</Label>
                <Input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="password" className="sr-only">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800" disabled={loading}>
                {loading ? 'Logging in...' : 'Log in'}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
};

export default LoginPage;
