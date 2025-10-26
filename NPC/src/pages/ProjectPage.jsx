
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Users, Target, Rss, HeartHandshake as Handshake, DollarSign, Check, Glasses as Binoculars, BarChartBig as ChartBarBig } from 'lucide-react';
import ProjectLayout from '@/layouts/ProjectLayout';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";


// Helper function to decode HTML entities
const decode = (str) => {
  if (typeof window === 'undefined' || !str) return "";
  const textarea = document.createElement('textarea');
  textarea.innerHTML = str;
  return textarea.value;
}

const Section = ({ icon: Icon, title, children, className = "", id = "" }) => (
  <motion.section 
    id={id}
    className={`py-12 border-b border-black ${className}`}
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.6 }}
  >
    <div className="flex items-center gap-4 mb-6">
      <Icon className="w-8 h-8 flex-shrink-0" strokeWidth={1.5} />
      <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
    </div>
    <div className="prose prose-lg max-w-none text-black prose-p:text-black prose-li:text-black prose-strong:text-black prose-a:text-black">
      {children}
    </div>
  </motion.section>
);

const ProgressBar = ({ value, isComplete }) => (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
            className="bg-black h-2.5 rounded-full transition-all duration-500" 
            style={{ width: `${value}%` }}
        ></div>
    </div>
);

const goalsData = [
  {
    phase: 'Phase 1: Research & Development',
    status: 'Complete',
    progress: 100,
    milestones: [
      {
        title: 'Community Needs Assessment',
        progress: 100,
        description: 'Conducted surveys and focus groups to understand community needs and identify key areas for impact. This foundational research shapes the entire project strategy.',
      },
      {
        title: 'Program Framework Design',
        progress: 100,
        description: 'Developed the core structure of the Roots & Reach program, including workshop formats, outreach strategies, and facilitator training materials.',
      },
    ],
  },
  {
    phase: 'Phase 2: Launch & Engagement',
    status: 'In Progress (45%)',
    progress: 45,
    milestones: [
      {
        title: 'Recruit 5 Community Facilitators',
        progress: 80,
        description: 'Onboarding passionate community leaders to guide workshops and events. We are still looking for individuals with experience in creative writing and digital art.',
      },
      {
        title: 'Host 3 Foundational Workshops',
        progress: 10,
        description: 'Launching our initial series of workshops focused on collaborative storytelling. The first event is scheduled, and planning for the next two is underway.',
      },
    ],
  },
  {
    phase: 'Phase 3: Evaluation & Growth',
    status: 'Upcoming',
    progress: 0,
    milestones: [
      {
        title: 'Build a Sustainable Volunteer Network',
        progress: 0,
        description: 'Creating a structured volunteer program to ensure the long-term health and growth of the project, with clear roles and opportunities for development.',
      },
      {
        title: 'Expand Outreach to New Regions',
        progress: 0,
        description: 'Planning the expansion of Roots & Reach programming into two new neighboring communities, based on the success and learnings from our initial launch.',
      },
    ],
  },
];

const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
};

const ProjectPage = ({ projectName, tagline, wordpressUrl }) => {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith('/projects/')) {
        window.scrollTo(0, 0);
    }

    const fetchUpdates = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${wordpressUrl}?per_page=3`);
        if (!response.ok) {
          throw new Error('Failed to fetch project updates.');
        }
        const data = await response.json();
        const formattedUpdates = data.map(post => ({
          id: post.id,
          title: decode(post.title?.rendered),
          content: decode(post.content?.rendered),
          link: post.link,
          date: new Date(post.date_gmt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        }));
        setUpdates(formattedUpdates);
      } catch (error) {
        console.error("Error fetching project updates:", error);
      }
      setLoading(false);
    };

    if(wordpressUrl) {
      fetchUpdates();
    } else {
      setLoading(false);
    }
  }, [wordpressUrl, location.pathname]);


  return (
    <ProjectLayout projectName={projectName}>
      <Helmet>
        <title>NPC | {projectName}</title>
        <meta name="description" content={`Learn about ${projectName}, a project by NPC. ${tagline}`} />
        <meta name="author" content="NPC" />
      </Helmet>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center py-16 border-b border-black">
          <motion.p 
            className="text-lg font-semibold mb-4 text-gray-800"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {tagline}
          </motion.p>
        </header>

        <Section icon={Binoculars} title="Overview">
          <p>{tagline} It addresses the need for structured yet flexible community-building initiatives that honor individual stories while fostering collective identity. By creating spaces for creative outreach and education, this project serves as a cornerstone for NPC’s mission to build inclusive, nerdy communities where everyone feels a sense of belonging.</p>
        </Section>
        
        <Section icon={Target} title="Purpose">
          <p>This project exists to bridge the gap between isolated individuals and a vibrant, interconnected community. In a world that often feels disconnected, Roots & Reach provides a structured pathway for people to find their place, share their skills, and grow together. It is directly relevant to NPC’s mission by emphasizing grassroots learning and collaborative storytelling, ensuring that every voice contributes to our collective narrative.It’s about more than just organizing events; it’s about nurturing an ecosystem of mutual support.</p>
        </Section>
        
        <Section icon={CheckCircle} title="Outcomes & Impact">
          <p>Success is measured by both tangible and intangible outcomes. Tangibly, we aim to host 10+ events and reach over 200 individuals in our first year. Intangibly, success looks like a thriving community where members report a strong sense of belonging, feel empowered to lead their own initiatives, and actively support one another. We will share testimonials and key metrics here as the project progresses.</p>
        </Section>

        <Section icon={ChartBarBig} title="Goals">
            <p>Our goals are broken down into distinct phases, each with clear milestones to track our progress toward building a sustainable and impactful community program.</p>
            <Accordion type="single" collapsible className="w-full mt-8">
                {goalsData.map((phase, index) => (
                    <AccordionItem value={`phase-${index}`} key={index} className="border-b-2 border-black">
                        <AccordionTrigger className="text-xl font-bold hover:no-underline">
                            <div className="flex-1 text-left">
                                {phase.phase}
                                <p className="text-sm font-normal text-gray-600">{phase.status}</p>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4 pl-4 border-l-2 border-black">
                            <Accordion type="single" collapsible className="w-full">
                                {phase.milestones.map((milestone, mIndex) => (
                                    <AccordionItem value={`milestone-${mIndex}`} key={mIndex} className="border-b border-gray-300 last:border-b-0">
                                        <AccordionTrigger className="hover:no-underline">
                                            <div className="w-full text-left pr-4">
                                                <p className="font-semibold">{milestone.title}</p>
                                                <ProgressBar value={milestone.progress} isComplete={milestone.progress === 100} />
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="pt-2">
                                            <p className="mb-4">{milestone.description}</p>
                                            <Button variant="link" className="p-0 h-auto text-black font-bold" onClick={() => scrollToSection('get-involved')}>
                                                Help Us &rarr;
                                            </Button>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </Section>
        
        <Section icon={DollarSign} title="Resources & Funding">
          <p>The project is sustained through a mix of community donations, grants, and support from the NPC general fund. Our goal is to secure initial seed funding to cover facilitator stipends and material costs for the first year.</p>
           <div className="space-y-6 mt-8">
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-base font-medium">Year 1 Funding Goal</span>
                        <span className="text-sm font-medium text-gray-600">In Progress (60%)</span>
                    </div>
                    <ProgressBar value={60} isComplete={false} />
                </div>
            </div>
            <div className="flex flex-wrap gap-4 mt-6">
                <Button asChild variant="outline" className="border-2 border-black hover:bg-black hover:text-white">
                   <Link to="/signup">Donate to NPC</Link>
                </Button>
            </div>
        </Section>
        
        <Section icon={Users} title="Team & Roles">
          <ul className="space-y-4">
            <li><strong>Project Lead:</strong> Oversees strategy and ensures the project aligns with NPC's mission.</li>
            <li><strong>Collaborators:</strong> Subject-matter experts and community leaders who co-design and facilitate workshops.</li>
            <li><strong>Partner Organizations:</strong> Groups that provide resources, venues, or cross-promotional support.</li>
            <li><strong>Volunteer Opportunities:</strong> Roles are available for event support, digital moderation, and outreach.</li>
          </ul>
        </Section>

        <Section id="get-involved" icon={Handshake} title="Ways to Get Involved">
          <p>Your support is vital to our success! You can help us grow by volunteering your time, partnering with us on an event, or making a donation. Subscribe to our newsletter to stay updated on the latest opportunities.</p>
          <div className="flex flex-wrap gap-4 mt-6">
            <Button asChild variant="outline" className="border-2 border-black hover:bg-black hover:text-white">
              <Link to="/signup">Volunteer or Partner</Link>
            </Button>
          </div>
        </Section>

        <Section icon={Rss} title="Updates / In Progress">
          {loading ? <p>Loading latest updates...</p> : (
            updates.length > 0 ? (
              <Accordion type="single" collapsible className="w-full -mx-4">
                {updates.map(post => (
                  <AccordionItem value={`item-${post.id}`} key={post.id} className="border-b border-gray-300">
                    <AccordionTrigger className="w-full text-left p-4 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black group">
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-1">{post.date}</p>
                        <h3 className="text-xl font-bold leading-tight group-hover:underline">{post.title}</h3>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 pt-0">
                      <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : <p>No recent updates found for this project.</p>
          )}
        </Section>
      </div>
    </ProjectLayout>
  );
};

export default ProjectPage;
