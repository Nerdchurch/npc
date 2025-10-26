
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { StaffDashboardPageContent } from '@/pages/StaffDashboard';
import { DashboardPageContent } from '@/pages/DashboardPage';
import { WaitlistDashboardContent } from '@/pages/WaitlistDashboardPage';
import DeniedPage from '@/pages/DeniedPage';
import BannedPage from '@/pages/BannedPage';
import PendingPage from '@/pages/PendingPage';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';

export const MouDashboardContent = () => {
  const [view, setView] = useState('staff');

  const renderContent = () => {
    switch(view) {
        case 'staff':
            return <StaffDashboardPageContent />;
        case 'member':
            return <DashboardPageContent />;
        case 'waitlisted':
            return <WaitlistDashboardContent />;
        case 'denied':
            return <DeniedPage />;
        case 'banned':
            return <BannedPage />;
        case 'pending':
            return <div className="p-8"><PendingPage /></div>;
        default:
            return <StaffDashboardPageContent />;
    }
  }

  return (
    <>
        <div className="max-w-7xl mx-auto">
             <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
                <h1 className="text-3xl md:text-4xl font-bold">MoU Dashboard</h1>
                <div className="flex items-center gap-4">
                    <Label htmlFor="dashboard-view" className="font-bold">Dashboard View:</Label>
                    <Select value={view} onValueChange={setView}>
                        <SelectTrigger id="dashboard-view" className="w-[180px] border-black bg-white">
                            <SelectValue placeholder="Select a view" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="staff">Staff</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="waitlisted">Waitlisted</SelectItem>
                            <SelectItem value="denied">Denied</SelectItem>
                            <SelectItem value="banned">Banned</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>

        <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-lg">
            {renderContent()}
        </div>
    </>
  );
};


const MoUDashboard = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Helmet>
        <title>MoU Dashboard | NPC</title>
        <meta name="description" content="All-access dashboard for NPC." />
      </Helmet>
      
      <Header />

      <main className="flex-grow bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <MouDashboardContent />
      </main>

      <Footer />
    </div>
  );
};

export default MoUDashboard;
