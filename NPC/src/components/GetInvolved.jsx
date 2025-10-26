
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const GetInvolved = () => {
  return (
    <section id="get-involved" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-3xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold mb-6"
        >
          Ready to Join Us?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, delay: 0.2 }}
          className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto mb-8"
        >
          Become a part of our community, volunteer your skills, or partner with us. Click the button below to fill out our sign-up form and start your journey with NPC.
        </motion.p>
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, delay: 0.4 }}
        >
            <Button asChild size="lg" className="border-2 border-black bg-white text-black hover:bg-black hover:text-white font-bold py-7 text-lg">
                <Link to="/signup">
                    Sign Up Now <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
            </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default GetInvolved;
