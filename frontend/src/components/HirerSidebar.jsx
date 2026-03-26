import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Briefcase, Wallet, Users } from 'lucide-react';

// sidebar navigation links
const navItems = [
    { path: '/hirer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/hirer/post-job', label: 'Post Job', icon: PlusCircle },
    { path: '/hirer/manage-jobs', label: 'Manage Jobs', icon: Briefcase },
    { path: '/hirer/workers', label: 'My Workers', icon: Users },
    { path: '/hirer/payments', label: 'Payments', icon: Wallet },
];

const HirerSidebar = () => {
    // Get user data from localStorage (set during login/registration)
    const getUserData = () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            return {
                name: user.name || 'User',
                initial: (user.name || 'U')[0].toUpperCase()
            };
        } catch {
            return { name: 'User', initial: 'U' };
        }
    };

    const { name, initial } = getUserData();

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
                        <p className="sidebar-user-name">{name}</p>
                        <p className="sidebar-user-role">Client Account</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default HirerSidebar;
