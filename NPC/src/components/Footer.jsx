
import React from 'react';
import { Mail, Twitter, Instagram, Facebook } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const quickLinks = [
    { label: 'Home', href: '/#home', isExternal: false },
    { label: 'About', href: '/#about', isExternal: false },
    { label: 'Projects', href: '/#projects', isExternal: false },
    { label: 'Donate', href: '/#donate', isExternal: false },
  ];
  
  const subpageLinks = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Public Records (Soon)', href: '#' },
  ];

  const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Facebook, href: '#', label: 'Facebook' },
  ];

  const scrollToSection = (href) => {
    // If we are already on the home page, scroll smoothly
    if (window.location.pathname === '/') {
      const element = document.querySelector(href.replace('/', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // If we are on another page, navigate to home and then scroll
      window.location.href = href;
    }
  };

  return (
    <footer className="bg-black text-white py-12 px-4 sm:px-6 lg:px-8 border-t border-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <span className="text-2xl font-bold block mb-4">NPC</span>
            <p className="text-sm leading-relaxed mb-4">
              Building inclusive, creative, and educational communities through storytelling, learning, and mutual support.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4" />
              <a href="mailto:hello@nerdchurch.org" className="hover:underline focus:underline focus:outline-none">
                hello@nerdchurch.org
              </a>
            </div>
          </div>

          <div>
            <span className="font-bold block mb-4">Quick Links</span>
            <nav className="space-y-2">
              {quickLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => scrollToSection(link.href)}
                  className="block hover:underline focus:underline focus:outline-none text-left"
                >
                  {link.label}
                </button>
              ))}
            </nav>
          </div>
          
          <div>
            <span className="font-bold block mb-4">Member Links</span>
            <nav className="space-y-2">
              {subpageLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="block hover:underline focus:underline focus:outline-none"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <span className="font-bold block mb-4">Connect</span>
            <div className="flex gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="border border-white p-2 hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-white transition-colors"
                  >
                    <Icon className="w-5 h-5" strokeWidth={1.5} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="border-t border-white pt-8 text-center text-sm">
          <p>© {new Date().getFullYear()} Nerdchurch Partners Corporation. All rights reserved.</p>
          <p className="mt-2">Nonprofit Status Pending</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
