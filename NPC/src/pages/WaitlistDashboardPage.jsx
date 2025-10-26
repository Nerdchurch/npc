
import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Hourglass } from 'lucide-react';

export const WaitlistDashboardContent = () => {
  return (
    <div className="min-h-[calc(100vh-15rem)] flex flex-col items-center justify-center text-center py-20 px-4 sm:px-6 lg:px-8">
        <Hourglass className="mx-auto h-16 w-16 text-black mb-6" />
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">You're on the Waitlist!</h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Thanks for your interest! We're carefully building a safe and inclusive community for members of all ages. You've been added to our waitlist, and we'll notify you as soon as we have a space ready for you. We can't wait for you to join us!
        </p>
        <Button asChild className="border-2 border-black bg-white text-black hover:bg-black hover:text-white font-bold py-6">
            <Link to="/">
                Explore Our Projects
            </Link>
        </Button>
    </div>
  )
}


const WaitlistDashboardPage = () => {
  return (
    <>
      <Helmet>
        <title>Waitlist | NPC</title>
        <meta name="description" content="You've been added to the NPC waitlist." />
      </Helmet>
      <main className="bg-white">
        <WaitlistDashboardContent />
      </main>
    </>
  );
};

export default WaitlistDashboardPage;
