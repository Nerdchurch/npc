
import React from 'react';
import { Helmet } from 'react-helmet';
import Hero from '@/components/Hero';
import Projects from '@/components/Projects';
import HowWeWork from '@/components/HowWeWork';
import BoundariesSupport from '@/components/BoundariesSupport';
import Latest from '@/components/Latest';
import GetInvolved from '@/components/GetInvolved';
import Donation from '@/components/Donation';

const Home = () => {
  return (
    <>
      <Helmet>
        <title>NPC | Building Inclusive Communities</title>
        <meta name="description" content="NPC is a creative nonprofit building inclusive, nerdy communities through storytelling, learning, and collaboration." />
      </Helmet>
      <Hero />
      <section id="projects"><Projects /></section>
      <HowWeWork />
      <section id="house-rules"><BoundariesSupport /></section>
      <section id="latest"><Latest /></section>
      <GetInvolved />
      <Donation />
    </>
  );
};

export default Home;
