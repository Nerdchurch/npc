
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { ChevronDown, LogOut } from 'lucide-react';

const ProjectHeader = ({ projectName }) => {
  const { user, signOut, profile } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
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

  const handleNpcClick = (e) => {
    e.preventDefault();
    navigate('/');
    setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 0);
  };

  return (
    <header className="fixed top-0 z-50 w-full border-b border-black bg-white/95 backdrop-blur-sm supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" onClick={handleNpcClick} className="text-xl font-bold tracking-tighter">
            NPC
          </Link>
          <span className="text-gray-400">|</span>
          <span className="text-lg font-medium text-gray-800">{projectName}</span>
        </div>
        
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

export default ProjectHeader;
