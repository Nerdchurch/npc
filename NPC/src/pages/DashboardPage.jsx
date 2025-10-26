
import React from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Navigate, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LatestFeed } from '@/components/LatestFeed';

export const DashboardPageContent = () => (
    <>
        <Helmet>
            <title>Member Dashboard | NPC</title>
            <meta name="description" content="Your personalized member dashboard for NPC, featuring saved and read later posts." />
        </Helmet>
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <Tabs defaultValue="saved">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                        <TabsList>
                            <TabsTrigger value="saved">Saved Posts</TabsTrigger>
                            <TabsTrigger value="read-later">Read Later</TabsTrigger>
                        </TabsList>
                        <div className="flex gap-2">
                             <Button asChild variant="outline">
                                <Link to="/profile/edit">Edit Profile</Link>
                            </Button>
                             <Button asChild>
                                <Link to="/message-us">Message Us</Link>
                            </Button>
                        </div>
                    </div>
                    <TabsContent value="saved">
                        <h2 className="text-3xl font-bold mb-4">Saved Posts</h2>
                        <p className="text-gray-600 mb-6">Posts you've saved by marking them as a favorite.</p>
                        <LatestFeed userFeed={true} filter="favorited" />
                    </TabsContent>
                    <TabsContent value="read-later">
                        <h2 className="text-3xl font-bold mb-4">Read Later</h2>
                         <p className="text-gray-600 mb-6">Posts you've saved to read later.</p>
                        <LatestFeed userFeed={true} filter="read_later" />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    </>
);

const UserDashboard = () => (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="bg-white flex-grow">
          <DashboardPageContent />
      </main>
      <Footer />
    </div>
);

const DashboardPage = () => {
    const { profile, loading, user } = useAuth();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-white"><div className="text-xl font-semibold">Loading...</div></div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!profile) {
        // This can happen briefly while profile is loading after user object is available
        return <Navigate to="/pending" replace />;
    }

    // This logic handles users who completed the signup form
    if (profile.status) {
         switch (profile.status) {
            case 'denied':
                return <Navigate to="/denied" replace />;
            case 'banned':
                return <Navigate to="/banned" replace />;
            case 'pending':
                return <Navigate to="/pending" replace />;
            case 'waitlisted':
                return <Navigate to="/waitlist-dashboard" replace />;
            case 'approved':
                switch (profile.role) {
                    case 'staff':
                        return <Navigate to="/staff/dashboard" replace />;
                    case 'mou':
                        return <Navigate to="/mou/dashboard" replace />;
                    default:
                        return <UserDashboard />;
                }
            default:
                // Fallback for any other status
                 return <UserDashboard />;
        }
    }
    
    // Fallback for users who might not have a submission status yet
    switch (profile.role) {
        case 'staff':
            return <Navigate to="/staff/dashboard" replace />;
        case 'mou':
            return <Navigate to="/mou/dashboard" replace />;
        default:
            return <UserDashboard />;
    }
};

export default DashboardPage;
