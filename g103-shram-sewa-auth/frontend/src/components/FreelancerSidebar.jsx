import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Search, FileText, Briefcase, Wallet, User, CalendarDays } from 'lucide-react';

// === Sidebar Navigation Links for Freelancer/Worker ===
// These links are specific to the worker role
const navItems = [
    { path: '/worker/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/worker/find-work', label: 'Find Work', icon: Search },
    { path: '/worker/applications', label: 'My Applications', icon: FileText },
    { path: '/worker/active-tasks', label: 'Active Tasks', icon: Briefcase },
    { path: '/worker/availability', label: 'Availability', icon: CalendarDays },
    { path: '/worker/earnings', label: 'Earnings', icon: Wallet },
    { path: '/worker/profile', label: 'My Profile', icon: User },
];

const FreelancerSidebar = () => {
    // Get user data from localStorage (set during login/registration)
    const getUserData = () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            return {
                name: user.name || 'Worker',
                initial: (user.name || 'W')[0].toUpperCase()
            };
        } catch {
            return { name: 'Worker', initial: 'W' };
        }
    };

    const { name, initial } = getUserData();

    return (
        <aside className="dashboard-sidebar">
            {/* === Brand Logo === */}
            {/* Shows the platform name at the top */}
            <div className="sidebar-logo">
                <h1>Shram Sewa</h1>
            </div>

            {/* === Navigation Links === */}
            {/* Worker-specific navigation menu */}
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

            {/* === User Info at Bottom === */}
            {/* Shows the logged-in worker's name and role */}
            <div className="sidebar-footer">
                <div className="sidebar-user">
                    <div className="sidebar-user-avatar">
                        {initial}
                    </div>
                    <div className="sidebar-user-info">
                        <p className="sidebar-user-name">{name}</p>
                        <p className="sidebar-user-role">Worker Account</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default FreelancerSidebar;
