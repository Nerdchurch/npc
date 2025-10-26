
import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';

const DeniedPage = () => {
  return (
    <>
      <Helmet>
        <title>Application Status | NPC</title>
        <meta name="description" content="Your application to join NPC has been denied." />
      </Helmet>
      <main className="min-h-screen flex items-center justify-center bg-gray-50 text-center py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl">
          <ShieldAlert className="mx-auto h-16 w-16 text-red-500 mb-6" />
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Application Denied</h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Thank you for your interest in our community. After careful review, we are unable to approve your application at this time. This does not prevent you from re-applying in the future should circumstances change. If you believe this is a mistake, please feel free to reach out to our support team.
          </p>
          <Button asChild className="border-2 border-black bg-white text-black hover:bg-black hover:text-white font-bold py-6">
            <Link to="/">
              Return Home
            </Link>
          </Button>
        </div>
      </main>
    </>
  );
};

export default DeniedPage;
