import { Outlet, Navigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import TopHeader from '../components/TopHeader'; // Reusing TopHeader
import '../styles/Dashboard.css'; // Ensure styles are loaded

const AdminLayout = () => {
    const role = localStorage.getItem('role');

    // Protect Admin Routes
    if (role !== 'Admin') {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="dashboard-layout">
            <AdminSidebar />
            
            {/* Reusing existing TopHeader, though it might show user info which is fine */}
            <TopHeader /> 
            
            <main className="dashboard-content">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;