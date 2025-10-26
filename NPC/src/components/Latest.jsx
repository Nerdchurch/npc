
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LatestFeed } from '@/components/LatestFeed';


const Latest = () => {
  return (
    <section id="latest" className="py-20 px-4 sm:px-6 lg:px-8 bg-black text-white">
      <div className="max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold mb-12 text-center"
        >
          From the Network
        </motion.h2>

        <div className="bg-white text-black rounded-lg p-4">
             <LatestFeed />
        </div>

        <div className="text-center mt-12">
            <Link 
              to="/latest" 
              className="inline-block text-white font-semibold py-2 px-6 border-2 border-white hover:bg-white hover:text-black transition-colors duration-300"
            >
              See All
            </Link>
        </div>

      </div>
    </section>
  );
};

export default Latest;
