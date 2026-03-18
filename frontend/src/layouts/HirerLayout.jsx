import { Outlet } from 'react-router-dom';
import HirerSidebar from '../components/HirerSidebar';
import TopHeader from '../components/TopHeader';
import '../styles/Dashboard.css';

// main layout: sidebar + top header + content area
const HirerLayout = () => {
    return (
        <div className="dashboard-layout">
            {/* sidebar fixed on left */}
            <HirerSidebar />
            
            {/* top header */}
            <TopHeader />
            
            {/* main content area with margin for sidebar and header */}
            <main className="dashboard-content">
                <Outlet />
            </main>
        </div>
    );
};

export default HirerLayout;
