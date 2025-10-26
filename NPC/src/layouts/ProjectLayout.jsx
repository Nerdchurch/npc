
import React from 'react';
import ProjectHeader from '@/components/ProjectHeader';
import Footer from '@/components/Footer';
import { Toaster } from '@/components/ui/toaster';

const ProjectLayout = ({ projectName, children }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ProjectHeader projectName={projectName} />
      <main className="flex-grow pt-24 md:pt-28">
        {children}
      </main>
      <Footer />
      <Toaster />
    </div>
  );
};

export default ProjectLayout;
