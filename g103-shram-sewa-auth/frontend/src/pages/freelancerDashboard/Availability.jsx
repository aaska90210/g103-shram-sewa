import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Save, Info } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Availability = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    // Store unavailable dates as simple YYYY-MM-DD strings
    const [unavailableDates, setUnavailableDates] = useState(new Set());
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [saveMessage, setSaveMessage] = useState('');

    useEffect(() => {
        fetchAvailability();
    }, []);

    const fetchAvailability = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await axios.get('http://localhost:5000/api/users/availability', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setUnavailableDates(new Set(response.data.unavailableDates || []));
        } catch (error) {
            console.error('Error fetching availability:', error);
            toast.error('Failed to load availability');
        } finally {
            setIsLoading(false);
        }
    };

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Get calendar math
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Format helpers
    const getMonthName = (date) => date.toLocaleString('default', { month: 'long' });
    const formatDateKey = (day) => {
        const d = String(day).padStart(2, '0');
        const m = String(month + 1).padStart(2, '0');
        return `${year}-${m}-${d}`;
    };

    // Handlers
    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const handleDateClick = (day) => {
        if (!day) return;
        const dateKey = formatDateKey(day);
        const newUnavailable = new Set(unavailableDates);

        if (newUnavailable.has(dateKey)) {
            newUnavailable.delete(dateKey); // Mark as available
        } else {
            newUnavailable.add(dateKey); // Mark as unavailable
        }

        setUnavailableDates(newUnavailable);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Please login to save availability');
                return;
            }

            await axios.put(
                'http://localhost:5000/api/users/availability',
                { unavailableDates: Array.from(unavailableDates) },
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            setSaveMessage('Availability updated successfully!');
            toast.success('Availability updated!');
            setTimeout(() => setSaveMessage(''), 3000);
        } catch (error) {
            console.error('Error saving availability:', error);
            toast.error('Failed to save availability');
        } finally {
            setIsSaving(false);
        }
    };

    // Calculate rendering grid
    const calendarDays = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        calendarDays.push(null); // Empty slots for days of prev month
    }
    for (let i = 1; i <= daysInMonth; i++) {
        calendarDays.push(i);
    }

    // Stats
    const totalDays = daysInMonth;
    // Count how many unavailable dates fall in this specific month
    let unavailableThisMonth = 0;
    for (let i = 1; i <= daysInMonth; i++) {
        if (unavailableDates.has(formatDateKey(i))) {
            unavailableThisMonth++;
        }
    }
    const availableThisMonth = totalDays - unavailableThisMonth;

    return (
        <div>
            {/* Page Header */}
            <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h1>Availability Calendar</h1>
                    <p>Select the days you are unavailable for work.</p>
                </div>
                <button
                    className="btn-primary"
                    onClick={handleSave}
                    disabled={isSaving}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <Save size={18} />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {/* Notification message */}
            {saveMessage && (
                <div style={{ backgroundColor: '#D1FAE5', color: '#065F46', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Info size={18} />
                    {saveMessage}
                </div>
            )}

            {/* Content Display */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 1fr)', gap: '1.5rem', alignItems: 'start' }}>

                {/* Visual Calendar */}
                <div className="payment-summary" style={{ display: 'block' }}>
                    <div className="summary-card" style={{ padding: '0', overflow: 'hidden' }}>

                        {/* Calendar Header Controls */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', borderBottom: '1px solid #E5E7EB', backgroundColor: '#F9FAFB' }}>
                            <button onClick={handlePrevMonth} style={{ padding: '0.5rem', background: 'white', border: '1px solid #E5E7EB', borderRadius: '0.375rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                                <ChevronLeft size={20} />
                            </button>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                                {getMonthName(currentDate)} {year}
                            </h2>
                            <button onClick={handleNextMonth} style={{ padding: '0.5rem', background: 'white', border: '1px solid #E5E7EB', borderRadius: '0.375rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        <div style={{ padding: '1.5rem' }}>
                            {/* Days of Week */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', marginBottom: '1rem', textAlign: 'center' }}>
                                {daysOfWeek.map(day => (
                                    <div key={day} style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#6B7280', textTransform: 'uppercase' }}>
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Days */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '0.5rem' }}>
                                {calendarDays.map((day, index) => {
                                    if (day === null) {
                                        return <div key={`empty-${index}`} style={{ aspectRatio: '1', padding: '0.5rem' }} />;
                                    }

                                    const isUnavailable = unavailableDates.has(formatDateKey(day));

                                    // Today highlight logic
                                    const today = new Date();
                                    const isToday =
                                        day === today.getDate() &&
                                        month === today.getMonth() &&
                                        year === today.getFullYear();

                                    return (
                                        <button
                                            key={day}
                                            onClick={() => handleDateClick(day)}
                                            style={{
                                                aspectRatio: '1',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRadius: '0.5rem',
                                                border: isToday ? '2px solid #2563EB' : '1px solid #E5E7EB',
                                                backgroundColor: isUnavailable ? '#FEE2E2' : '#FFFFFF',
                                                color: isUnavailable ? '#B91C1C' : '#111827',
                                                fontWeight: isToday ? 'bold' : 'normal',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                position: 'relative'
                                            }}
                                            onMouseOver={(e) => {
                                                if (!isUnavailable) e.currentTarget.style.backgroundColor = '#F3F4F6';
                                            }}
                                            onMouseOut={(e) => {
                                                if (!isUnavailable) e.currentTarget.style.backgroundColor = '#FFFFFF';
                                            }}
                                        >
                                            <span style={{ fontSize: '1rem' }}>{day}</span>
                                            {isUnavailable && (
                                                <span style={{ fontSize: '0.65rem', marginTop: '0.25rem', fontWeight: '500' }}>Busy</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                    </div>
                </div>

                {/* Sidebar Stats & Legend */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Legend Card */}
                    <div className="payment-summary" style={{ display: 'block' }}>
                        <div className="summary-card" style={{ height: '100%' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>Legend</h3>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '0.25rem', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}></div>
                                <span style={{ fontSize: '0.875rem', color: '#4B5563' }}>Available (Click to mark Busy)</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '0.25rem', backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5' }}></div>
                                <span style={{ fontSize: '0.875rem', color: '#4B5563' }}>Unavailable</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '0.25rem', backgroundColor: '#FFFFFF', border: '2px solid #2563EB' }}></div>
                                <span style={{ fontSize: '0.875rem', color: '#4B5563' }}>Today</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div className="payment-summary" style={{ display: 'block' }}>
                        <div className="summary-card" style={{ height: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <CalendarIcon size={20} style={{ color: '#2563EB' }} />
                                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', margin: '0', color: '#111827' }}>Monthly Summary</h3>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #E5E7EB' }}>
                                <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>Available Days</span>
                                <span style={{ fontWeight: 'bold', color: '#059669' }}>{availableThisMonth}</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0' }}>
                                <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>Unavailable Days</span>
                                <span style={{ fontWeight: 'bold', color: '#DC2626' }}>{unavailableThisMonth}</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Availability;
