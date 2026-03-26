import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import axios from 'axios';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const res = await axios.get('http://localhost:5000/api/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data.notifications);
            setUnreadCount(res.data.unreadCount);
        } catch {
            // silently fail
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleOpen = async () => {
        setOpen(!open);
        if (!open && unreadCount > 0) {
            try {
                const token = localStorage.getItem('token');
                await axios.put('http://localhost:5000/api/notifications/read-all', {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUnreadCount(0);
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            } catch {
                // ignore
            }
        }
    };

    const timeAgo = (dateStr) => {
        const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
        if (diff < 60) return 'just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    const iconMap = {
        application: '📋',
        approved: '✅',
        rejected: '❌',
        completed: '🏁',
        review: '⭐',
        job_nearby: '📍'
    };

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button
                onClick={handleOpen}
                style={{
                    position: 'relative', background: 'none', border: 'none',
                    cursor: 'pointer', padding: 6, borderRadius: 8,
                    display: 'flex', alignItems: 'center', color: '#374151'
                }}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute', top: 0, right: 0,
                        background: '#EF4444', color: 'white', borderRadius: '50%',
                        width: 16, height: 16, fontSize: 10, fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div style={{
                    position: 'absolute', right: 0, top: '110%', width: 320,
                    background: 'white', border: '1px solid #e5e7eb',
                    borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    zIndex: 1000, overflow: 'hidden'
                }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', fontWeight: 600, fontSize: 14, color: '#111827' }}>
                        Notifications
                    </div>

                    {notifications.length === 0 ? (
                        <div style={{ padding: '24px 16px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
                            No notifications yet
                        </div>
                    ) : (
                        <div style={{ maxHeight: 340, overflowY: 'auto' }}>
                            {notifications.map(n => (
                                <div key={n._id} style={{
                                    padding: '10px 16px', borderBottom: '1px solid #f9fafb',
                                    background: n.read ? 'white' : '#eff6ff',
                                    display: 'flex', gap: 10, alignItems: 'flex-start'
                                }}>
                                    <span style={{ fontSize: 18, lineHeight: 1.4 }}>{iconMap[n.type] || '🔔'}</span>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: 13, color: '#374151', margin: 0, lineHeight: 1.4 }}>{n.message}</p>
                                        <p style={{ fontSize: 11, color: '#9ca3af', margin: '3px 0 0' }}>{timeAgo(n.createdAt)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
