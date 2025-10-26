
import React from 'react';
import { Routes, Route, useSearchParams, useLocation } from 'react-router-dom';
import { AuthProvider } from '@/contexts/SupabaseAuthContext';
import Home from '@/pages/Home';
import LatestPage from '@/pages/LatestPage';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import ProjectPage from '@/pages/ProjectPage';
import SignUpPage from '@/pages/SignUpPage';
import ContactPage from '@/pages/ContactPage';
import WaitlistPage from '@/pages/WaitlistPage';
import WaitlistDashboardPage from '@/pages/WaitlistDashboardPage';
import StaffDashboard from '@/pages/StaffDashboard';
import MoUDashboard from '@/pages/MoUDashboard';
import DeniedPage from '@/pages/DeniedPage';
import BannedPage from '@/pages/BannedPage';
import PendingPage from '@/pages/PendingPage';
import EditProfilePage from '@/pages/EditProfilePage';
import MessageUsPage from '@/pages/MessageUsPage';
import { useToast } from '@/components/ui/use-toast';
import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import vmSafe from '@/lib/vmSafe';

const DonationStatusHandler = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const location = useLocation();

  useEffect(() => {
    if (searchParams.get('donation') === 'success') {
      toast({
        title: 'Thank You for Your Donation!',
        description: "We've received your submission and will be in touch soon.",
      });
      vmSafe.replaceState(null, '', location.pathname);
    } else if (searchParams.get('donation') === 'cancelled') {
       toast({
        title: 'Donation Cancelled',
        description: "Your submission was received. You can always donate later!",
        variant: 'destructive',
      });
      vmSafe.replaceState(null, '', location.pathname);
    }
  }, [searchParams, toast, location.pathname]);

  return null;
}

const PageLayout = ({ children, hasHeader = true, hasFooter = true }) => (
  <div className="flex flex-col min-h-screen">
    {hasHeader && <Header />}
    <main className="flex-grow">{children}</main>
    {hasFooter && <Footer />}
  </div>
);

function App() {
  return (
    <AuthProvider>
      <DonationStatusHandler />
      <Routes>
        <Route path="/" element={<PageLayout><Home /></PageLayout>} />
        <Route path="/latest" element={<PageLayout><LatestPage /></PageLayout>} />
        <Route path="/login" element={<PageLayout><LoginPage /></PageLayout>} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/signup" element={<PageLayout><SignUpPage /></PageLayout>} />
        <Route path="/contact" element={<PageLayout><ContactPage /></PageLayout>} />
        <Route path="/waitlist" element={<PageLayout><WaitlistPage /></PageLayout>} />
        <Route path="/waitlist-dashboard" element={<PageLayout><WaitlistDashboardPage /></PageLayout>} />
        <Route path="/staff/dashboard" element={<StaffDashboard />} />
        <Route path="/mou/dashboard" element={<MoUDashboard />} />
        <Route path="/denied" element={<PageLayout><DeniedPage /></PageLayout>} />
        <Route path="/banned" element={<PageLayout><BannedPage /></PageLayout>} />
        <Route path="/pending" element={<PageLayout><PendingPage /></PageLayout>} />
        <Route path="/profile/edit" element={<PageLayout><EditProfilePage /></PageLayout>} />
        <Route path="/message-us" element={<MessageUsPage />} />
        <Route path="/projects/the-beacon-project" element={<ProjectPage 
          projectName="The Beacon Project"
          tagline="Guiding light for those seeking safe, inclusive creative spaces."
          wordpressUrl="https://beacon.nerdguild.org/wp-json/wp/v2/posts"
        />} />
        <Route path="/projects/nerd-church" element={<ProjectPage 
            projectName="Nerd Church"
            tagline="A gathering space for storytelling, learning, and shared curiosity."
            wordpressUrl="https://nerd.church/wp-json/wp/v2/posts"
        />} />
        <Route path="/projects/roots-and-reach" element={<ProjectPage 
          projectName="Roots & Reach"
          tagline="Building foundational community connections that grow and expand organically."
          wordpressUrl="https://rar.nerdguild.org/wp-json/wp/v2/posts"
        />} />
        <Route path="/projects/hieroscope" element={<ProjectPage 
          projectName="Hieroscope"
          tagline="Exploring sacred stories and meaningful conversations across communities."
          wordpressUrl="https://hieroscope.com/wp-json/wp/v2/posts"
        />} />
        <Route path="/projects/nerd-and-turf" element={<ProjectPage
          projectName="Nerd & Turf"
          tagline="Where sports culture meets nerd culture in unexpected, joyful ways."
          wordpressUrl={null} // No WP feed for this one yet
        />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
