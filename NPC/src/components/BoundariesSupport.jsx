
import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Users, BookOpen, FileText, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const BoundariesSupport = () => {
  const resources = [
    { label: 'National Suicide Prevention Lifeline', link: 'https://988lifeline.org/' },
    { label: 'Crisis Text Line', link: 'https://www.crisistextline.org/' },
    { label: 'SAMHSA National Helpline', link: 'https://www.samhsa.gov/find-help/national-helpline' },
  ];

  const supportLinks = [
    { icon: Users, label: 'Volunteer Opportunities' },
    { icon: Users, label: 'Partner Organizations' },
    { icon: BookOpen, label: 'Resource Library' },
    { icon: FileText, label: 'Gathering Space' },
    { icon: Mail, label: 'Contact Team' },
  ];
  

  return (
    <section id="house-rules" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#F5F5F5]">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold mb-12 text-center"
        >
          House Rules
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white border-2 border-black p-8"
          >
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="w-6 h-6 flex-shrink-0 mt-1" />
              <h3 className="text-2xl font-bold">Boundaries</h3>
            </div>
            <p className="mb-4 leading-relaxed">
              NPC and its partners are inclusive community spaces, not professional services. We are not counselors, doctors, or lawyers, and we do not provide professional advice.
            </p>
            <p className="mb-6 leading-relaxed font-medium">
              If you are in crisis, please seek immediate help from professionals or crisis hotlines.
            </p>
            <div className="space-y-2">
              <p className="font-bold mb-3">Crisis Resources:</p>
              {resources.map((resource) => (
                <a
                  key={resource.label}
                  href={resource.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:underline focus:underline focus:outline-none"
                >
                  → {resource.label}
                </a>
              ))}
               <Link to="/contact" className="block hover:underline focus:underline focus:outline-none text-left mt-4">
                  → Have a resource to suggest? Let us know.
                </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white border-2 border-black p-8"
            id="support"
          >
            <h3 className="text-2xl font-bold mb-4">Support Hub</h3>
            <p className="mb-6 leading-relaxed">
              A gathering space for allies, volunteers, and friends. Here, you can find resources, collaborate, or join our work.
            </p>
            <div className="space-y-3">
              {supportLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    className="flex items-center gap-3 w-full text-left p-3 border border-black hover:bg-black hover:text-white focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <Icon className="w-5 h-5" strokeWidth={1.5} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BoundariesSupport;
