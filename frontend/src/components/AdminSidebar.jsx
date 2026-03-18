import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, UserCheck, ShieldCheck, LogOut } from 'lucide-react';

const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/verify-clients', label: 'Verify Clients', icon: ShieldCheck },
    { path: '/admin/verify-freelancers', label: 'Verify Freelancers', icon: UserCheck },
    { path: '/admin/users', label: 'All Users', icon: Users },
];

const AdminSidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <aside className="dashboard-sidebar">
            {/* brand logo */}
            <div className="sidebar-logo">
                <h1>Admin Panel</h1>
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
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* footer */}
            <div className="sidebar-footer">
                <button 
                    onClick={handleLogout}
                    className="sidebar-nav-item" 
                    style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', color: '#dc2626' }}
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;