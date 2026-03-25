import { Outlet } from 'react-router-dom';
import FreelancerSidebar from '../components/FreelancerSidebar';
import TopHeader from '../components/TopHeader';
import '../styles/Dashboard.css';

// === Freelancer Layout Wrapper ===
// This layout wraps all worker/freelancer pages
// It provides the sidebar, top header, and content area
const FreelancerLayout = () => {
    return (
        <div className="dashboard-layout">
            {/* Left Sidebar - Fixed position */}
            <FreelancerSidebar />
            
            {/* Top Header - Search, notifications, profile */}
            <TopHeader />
            
            {/* Main Content Area - Where pages are rendered */}
            <main className="dashboard-content">
                <Outlet />
            </main>
        </div>
    );
};

export default FreelancerLayout;
