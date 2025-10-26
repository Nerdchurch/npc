
import React from 'react';
import { motion } from 'framer-motion';

const WelcomeMessage = () => {
  return (
    <motion.p
      className='text-xl md:text-2xl text-white max-w-2xl mx-auto'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      Hello there! I'm your AI coding companion for the <span className='font-semibold text-purple-300'>NPC</span> website.
      I'm here to help you build an amazing web application!
    </motion.p>
  );
};

export default WelcomeMessage;
