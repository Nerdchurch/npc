
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import vmSafe from '@/lib/vmSafe';

const Hero = () => {
  const scrollToSection = (href) => {
    const element = vmSafe.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Nerdchurch Partners Corporation (NPC)
            </h1>
            <p className="text-lg md:text-xl mb-8 leading-relaxed">
              A creative nonprofit building inclusive, nerdy communities through storytelling, learning, and collaboration.
            </p>
            {/* Removed Learn More and Donate buttons as they are in the navigation */}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-[#F5F5F5] p-8 border border-black"
            id="about"
          >
            <h2 className="text-2xl font-bold mb-4">Who We Are</h2>
            <p className="leading-relaxed mb-4">
              We are a community-centered nonprofit dedicated to creating spaces where curiosity, creativity, and collaboration thrive.
            </p>
            <p className="leading-relaxed">
              Through our projects and partnerships, we build inclusive environments that celebrate learning, storytelling, and mutual support—because everyone deserves a place to belong.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
