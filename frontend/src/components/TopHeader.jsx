import { Search, Bell, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const TopHeader = () => {
    const [showDropdown, setShowDropdown] = useState(false);

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
        <header className="dashboard-header">
            {/* search bar */}
            <div className="header-search">
                <div className="header-search-wrapper">
                    <Search className="header-search-icon" />
                    <input
                        type="text"
                        placeholder="Search jobs, workers..."
                        className="header-search-input"
                    />
                </div>
            </div>

            {/* right side: notifications and profile */}
            <div className="header-actions">
                {/* notification bell */}
                <button className="header-notification">
                    <Bell />
                    <span className="notification-badge"></span>
                </button>

                {/* profile dropdown - Shows registered name */}
                <div className="header-profile">
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="header-profile-btn"
                    >
                        <div className="header-profile-avatar">
                            {initial}
                        </div>
                        <span className="header-profile-name">{name}</span>
                        <ChevronDown />
                    </button>

                    {/* dropdown menu */}
                    {showDropdown && (
                        <div className="header-profile-dropdown">
                            <a href="#" className="dropdown-item">
                                Profile Settings
                            </a>
                            <a href="#" className="dropdown-item">
                                Help & Support
                            </a>
                            <div className="dropdown-divider"></div>
                            <button
                                onClick={() => {
                                    localStorage.clear();
                                    window.location.href = '/login';
                                }}
                                className="dropdown-item logout"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default TopHeader;
