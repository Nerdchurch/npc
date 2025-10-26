
import React from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import vmSafe from '@/lib/vmSafe';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { ChevronDown, LogOut } from 'lucide-react';

const Header = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      // The onAuthStateChange listener will handle state updates.
      // We just need to navigate.
      navigate('/');
    }
  };

  const getDashboardPath = () => {
    if (profile?.role === 'staff') {
      return '/staff/dashboard';
    }
    if (profile?.role === 'mou') {
      return '/mou/dashboard';
    }
    return '/dashboard';
  };

  const navLinkClass = ({ isActive }) =>
    `relative text-sm font-medium text-black transition-colors hover:text-opacity-70 ${isActive ? 'after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[2px] after:bg-black' : ''}`;
  
  const scrollToSection = (sectionId) => {
    if (sectionId === 'top') {
      vmSafe.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const section = vmSafe.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black bg-white/95 backdrop-blur-sm supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between">
        <Link 
          to="/" 
          className="text-xl font-bold tracking-tighter"
          onClick={(e) => {
            if (isHomePage) {
              e.preventDefault();
              scrollToSection('top');
            }
          }}
        >
          NPC
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {isHomePage ? (
            <>
              <a href="#projects" onClick={(e) => { e.preventDefault(); scrollToSection('projects'); }} className="relative text-sm font-medium text-black transition-colors hover:text-opacity-70">Projects</a>
              <a href="#house-rules" onClick={(e) => { e.preventDefault(); scrollToSection('house-rules'); }} className="relative text-sm font-medium text-black transition-colors hover:text-opacity-70">House Rules</a>
              <a href="#latest" onClick={(e) => { e.preventDefault(); scrollToSection('latest'); }} className="relative text-sm font-medium text-black transition-colors hover:text-opacity-70">Latest</a>
              <a href="#donate" onClick={(e) => { e.preventDefault(); scrollToSection('donate'); }} className="relative text-sm font-medium text-black transition-colors hover:text-opacity-70">Support</a>
            </>
          ) : (
            <>
              <NavLink to="/#projects" className={navLinkClass}>Projects</NavLink>
              <NavLink to="/#house-rules" className={navLinkClass}>House Rules</NavLink>
              <NavLink to="/latest" className={navLinkClass}>Latest</NavLink>
              <NavLink to="/#donate" className={navLinkClass}>Support</NavLink>
            </>
          )}
        </nav>
        <div className="flex items-center gap-4">
          {user ? (
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 border-black bg-white">
                  <span>Actions</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuItem asChild>
                  <Link to={getDashboardPath()}>Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile/edit">Edit Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                   <Link to="/message-us">Message Us</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link to="/login">Log In</Link>
              </Button>
              <Button asChild className="border-2 border-black bg-white text-black hover:bg-black hover:text-white">
                <Link to="/signup">Get Involved</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
