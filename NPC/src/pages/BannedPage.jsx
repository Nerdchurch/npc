
import React from 'react';
import { Helmet } from 'react-helmet';
import { Ban } from 'lucide-react';

const BannedPage = () => {
  return (
    <>
      <Helmet>
        <title>Account Access Restricted | NPC</title>
        <meta name="description" content="Your NPC account access has been restricted due to a violation of our community guidelines." />
      </Helmet>
      <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white text-center py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl">
          <Ban className="mx-auto h-16 w-16 text-red-600 mb-6" />
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Account Access Restricted</h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Your account access has been restricted due to a violation of our community guidelines. Maintaining a safe and respectful environment is our top priority. For more information or to appeal this decision, please contact our moderation team directly.
          </p>
        </div>
      </main>
    </>
  );
};

export default BannedPage;
