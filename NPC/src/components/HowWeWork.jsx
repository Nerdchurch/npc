
import React from 'react';
import { motion } from 'framer-motion';
import { Ear, Link2, Hammer, Heart, Eye, TrendingUp } from 'lucide-react';

const HowWeWork = () => {
  const steps = [
    { icon: Ear, label: 'Listen', description: 'We start by hearing your story' },
    { icon: Link2, label: 'Connect', description: 'Building bridges between people' },
    { icon: Hammer, label: 'Build', description: 'Creating together with intention' },
    { icon: Heart, label: 'Support', description: 'Sustaining community care' },
    { icon: Eye, label: 'Reflect', description: 'Learning from our experiences' },
    { icon: TrendingUp, label: 'Evolve', description: 'Growing with our communities' },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold mb-12 text-center"
        >
          How We Work
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="grid grid-cols-2 gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <Icon className="w-12 h-12 mx-auto mb-3" strokeWidth={1} />
                  <h3 className="text-xl font-bold mb-1">{step.label}</h3>
                  <p className="text-sm">{step.description}</p>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-black text-white p-8 flex items-center"
          >
            <div>
              <h3 className="text-2xl font-bold mb-4">Our Ethos</h3>
              <p className="text-lg leading-relaxed">
                We center accessibility, inclusion, creativity, and curiosity in all we build.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HowWeWork;
