import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Briefcase, Wallet, Users, ShieldCheck, Clock, User } from 'lucide-react';

// sidebar navigation links
const navItems = [
    { path: '/hirer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/hirer/post-job', label: 'Post Job', icon: PlusCircle },
    { path: '/hirer/manage-jobs', label: 'Manage Jobs', icon: Briefcase },
    { path: '/hirer/workers', label: 'My Workers', icon: Users },
    { path: '/hirer/payments', label: 'Payments', icon: Wallet },
    { path: '/hirer/profile', label: 'My Profile', icon: User },
];

const HirerSidebar = () => {
    // Get user data from localStorage (set during login/registration)
    const [userData, setUserData] = useState({ name: 'User', initial: 'U', verificationStatus: 'Pending' });

    useEffect(() => {
        const updateUserData = () => {
            try {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                setUserData({
                    name: user.name || 'User',
                    initial: (user.name || 'U')[0].toUpperCase(),
                    verificationStatus: user.verificationStatus || 'Pending'
                });
            } catch {
                setUserData({ name: 'User', initial: 'U', verificationStatus: 'Pending' });
            }
        };

        // Initial load
        updateUserData();

        // Listen for storage changes (updates from Profile page)
        window.addEventListener('storage', updateUserData);
        return () => window.removeEventListener('storage', updateUserData);
    }, []);

    const { name, initial, verificationStatus } = userData;
    const isVerified = verificationStatus === 'Verified';

    return (
        <aside className="dashboard-sidebar">
            {/* brand logo */}
            <div className="sidebar-logo">
                <h1>Shram Sewa</h1>
            </div>

            {/* navigation links */}
            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            isActive ? 'sidebar-nav-item active' : 'sidebar-nav-item'
                        }
                    >
                        <item.icon />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* user info at bottom - Shows registered name */}
            <div className="sidebar-footer">
                <div className="sidebar-user">
                    <div className="sidebar-user-avatar">
                        {initial}
                    </div>
                    <div className="sidebar-user-info">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <p className="sidebar-user-name" style={{ marginBottom: 0 }}>{name}</p>
                            {isVerified ? (
                                <ShieldCheck size={16} color="#10B981" fill="#D1FAE5" className="verification-icon verified" title="Verified Account" />
                            ) : (
                                <Clock size={16} color="#F59E0B" className="verification-icon pending" title="Verification Pending" />
                            )}
                        </div>
                        <p className="sidebar-user-role">
                            Client • <span style={{ color: isVerified ? '#10B981' : '#F59E0B' }}>
                                {isVerified ? 'Verified' : 'Pending'}
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default HirerSidebar;
