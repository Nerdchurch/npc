
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mountain, Trophy, HeartPulse as HeartPlus, BookOpen, MessageCircle, Ampersand } from 'lucide-react';

const Projects = () => {
  const projects = [
    {
      icon: Mountain,
      name: 'Roots & Reach',
      description: 'Building foundational community connections that grow and expand organically.',
      path: '/projects/roots-and-reach',
    },
    {
      icon: HeartPlus,
      name: 'Beacon Project',
      description: 'Guiding light for those seeking safe, inclusive creative spaces.',
      path: '/projects/the-beacon-project',
    },
    {
      icon: Trophy,
      name: 'Nerd & Turf',
      description: 'Where sports culture meets nerd culture in unexpected, joyful ways.',
      path: '/projects/nerd-and-turf',
    },
    {
      icon: BookOpen,
      name: 'Nerd Church',
      description: 'A gathering space for storytelling, learning, and shared curiosity.',
      path: '/projects/nerd-church',
    },
    {
      icon: MessageCircle,
      name: 'Hieroscope',
      description: 'Exploring sacred stories and meaningful conversations across communities.',
      path: '/projects/hieroscope',
    },
    {
      icon: Ampersand,
      name: 'Partners',
      description: 'Connecting dreamers, doers, and organizations who believe in making learning and belonging universal.',
      path: '/contact',
    },
  ];

  return (
    <section id="projects" className="py-20 px-4 sm:px-6 lg:px-8 bg-black text-white">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold mb-12 text-center"
        >
          Our Projects
        </motion.h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => {
            const Icon = project.icon;
            const isExternal = project.path.startsWith('/#');
            
            const content = (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-white p-6 h-full hover:bg-white hover:text-black transition-colors duration-300"
                >
                  <Icon className="w-12 h-12 mb-4" strokeWidth={1} />
                  <h3 className="text-xl font-bold mb-2">{project.name}</h3>
                  <div className="w-12 h-px bg-white group-hover:bg-black mb-3"></div>
                  <p className="leading-relaxed">{project.description}</p>
                </motion.div>
            );

            if (isExternal) {
                 return (
                    <a href={project.path} key={project.name} className="block group focus:outline-none focus:ring-2 focus:ring-white">
                        {content}
                    </a>
                 );
            }

            return (
              <Link to={project.path} key={project.name} className="block group focus:outline-none focus:ring-2 focus:ring-white">
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Projects;
