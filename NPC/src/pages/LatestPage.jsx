
import React from 'react';
import { Helmet } from 'react-helmet';
import { LatestFeed } from '@/components/LatestFeed';

const LatestPage = () => {
  return (
    <>
      <Helmet>
        <title>Latest From The Network | NPC</title>
        <meta name="description" content="Explore the latest posts and updates from across the entire NPC network." />
      </Helmet>
      <main className="flex-grow bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">From the Network</h1>
            <p className="text-lg text-gray-600 mb-12 text-center">Our collective list of posts from across the NPC network.</p>
            <LatestFeed />
        </div>
      </main>
    </>
  );
};

export default LatestPage;
