
import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';

const WaitlistPage = () => {
  return (
    <>
      <Helmet>
        <title>Join Our Waitlist | NPC Community</title>
        <meta name="description" content="Join the waitlist for minors to be notified when our NPC community becomes safe and appropriate for all ages." />
      </Helmet>
      <Header />
      <main className="py-20 px-4 sm:px-6 lg:px-8 bg-white min-h-screen flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center border-2 border-black p-8 space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            You're on the Waitlist! 🎉
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg leading-relaxed mb-6"
          >
            Thank you so much for signing up! We're thrilled you want to be a part of our community. Currently, our main space is for adults (18+), but we're working hard to create a safe, ethical, and legally compliant environment that's perfect for younger members.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg leading-relaxed mb-8 font-medium"
          >
            We truly value your interest and will notify you as soon as we've built out a fantastic space just for you. Thanks for your patience!
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-8 text-sm"
          >
            <Link to="/" className="underline hover:no-underline">Back to Home</Link>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default WaitlistPage;
