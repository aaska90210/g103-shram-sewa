import { Search, Bell, ChevronDown, BadgeCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

const TopHeader = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [userData, setUserData] = useState({ name: 'User', initial: 'U', isVerified: false });

    useEffect(() => {
        // Initial load from localStorage
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (storedUser.name) {
            setUserData({
                name: storedUser.name,
                initial: (storedUser.name || 'U')[0].toUpperCase(),
                isVerified: storedUser.isVerified || false
            });
        }

        // Fetch fresh data
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await axios.get('http://localhost:5000/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data) {
                const user = {
                    name: res.data.fullName,
                    initial: (res.data.fullName || 'U')[0].toUpperCase(),
                    isVerified: res.data.isVerified
                };
                setUserData(user);
                
                // Update localStorage to keep it fresh
                localStorage.setItem('user', JSON.stringify({
                    name: res.data.fullName,
                    verificationStatus: res.data.verificationStatus,
                    isVerified: res.data.isVerified
                }));
            }
        } catch (error) {
            console.error("Failed to fetch user data", error);
        }
    };

    const { name, initial, isVerified } = userData;

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

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
                        <span className="header-profile-name flex items-center gap-1">
                            {name}
                            {isVerified && (
                                <BadgeCheck className="w-5 h-5 text-blue-500" />
                            )}
                        </span>
                        <ChevronDown size={16} />
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
