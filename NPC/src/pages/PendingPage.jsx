
import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

const PendingPage = () => {
  return (
    <>
      <Helmet>
        <title>Application Pending | NPC</title>
        <meta name="description" content="Your application to join NPC is pending review." />
      </Helmet>
      <main className="min-h-screen flex items-center justify-center bg-gray-50 text-center py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl">
          <Clock className="mx-auto h-16 w-16 text-black mb-6" />
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Application Pending</h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Thank you for your submission! Your application is currently under review by our team. We appreciate your patience and will notify you via email as soon as a decision has been made.
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

export default PendingPage;
