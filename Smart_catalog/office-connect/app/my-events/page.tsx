'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CalendarView from '@/components/CalendarView';
import CalendarHeader from '@/components/CalendarHeader';

interface Event {
    id: string;
    startTime: string;
    endTime: string;
    location: string;
    maxParticipants: number;
    host: { id: string; username: string; avatarUrl: string };
    activityType: { id: string; name: string };
    participants: { user: { id: string; username: string; avatarUrl: string } }[];
}

export default function MyEventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
    const [currentMonth, setCurrentMonth] = useState(new Date());

    useEffect(() => {
        fetchMyEvents();
        // Load saved view preference
        const savedView = localStorage.getItem('myEventsView');
        if (savedView === 'list' || savedView === 'calendar') {
            setViewMode(savedView);
        }
    }, []);

    const fetchMyEvents = async () => {
        const res = await fetch('/api/user/events');
        const data = await res.json();
        if (Array.isArray(data)) setEvents(data);
        setLoading(false);
    };

    const handleViewChange = (mode: 'calendar' | 'list') => {
        setViewMode(mode);
        localStorage.setItem('myEventsView', mode);
    };

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const handleToday = () => {
        setCurrentMonth(new Date());
    };

    return (
        <div className="container">
            <div style={{ marginBottom: '1rem' }}>
                <Link href="/dashboard" className="btn btn-secondary">&larr; Back to Dashboard</Link>
            </div>

            <h1 style={{ marginBottom: '1.5rem' }}>My Joined Events</h1>

            {loading ? (
                <p>Loading your events...</p>
            ) : events.length === 0 ? (
                <div className="glass card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <h3>You haven't joined any events yet.</h3>
                    <p>Browse activities on the dashboard to find events to join!</p>
                    <br />
                    <Link href="/dashboard" className="btn btn-primary">
                        Go to Dashboard
                    </Link>
                </div>
            ) : (
                <>
                    <CalendarHeader
                        currentMonth={currentMonth}
                        onPrevMonth={handlePrevMonth}
                        onNextMonth={handleNextMonth}
                        onToday={handleToday}
                        viewMode={viewMode}
                        onViewChange={handleViewChange}
                    />

                    {viewMode === 'calendar' ? (
                        <CalendarView
                            events={events}
                            currentMonth={currentMonth}
                        />
                    ) : (
                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            {events.map((event) => (
                                <Link
                                    key={event.id}
                                    href={`/events/view/${event.id}`}
                                    style={{ textDecoration: 'none', color: 'inherit' }}
                                >
                                    <div className="glass card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
                                        {/* Activity Badge */}
                                        <div style={{ display: 'inline-block', background: 'var(--primary)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                                            {event.activityType.name}
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            <img src={event.host.avatarUrl || ''} alt="Host" style={{ width: '30px', height: '30px', borderRadius: '50%' }} />
                                            <strong>{event.host.username}</strong> is hosting
                                        </div>

                                        <h3 style={{ marginBottom: '0.5rem' }}>
                                            {new Date(event.startTime).toLocaleDateString()} - {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </h3>
                                        <p>📍 {event.location}</p>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                                            <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                                                {event.participants.length} / {event.maxParticipants} joined
                                            </span>
                                            <div style={{ display: 'flex' }}>
                                                {event.participants.slice(0, 5).map((p, i) => (
                                                    <img
                                                        key={i}
                                                        src={p.user.avatarUrl || ''}
                                                        title={p.user.username}
                                                        style={{ width: '24px', height: '24px', borderRadius: '50%', marginLeft: i > 0 ? '-8px' : '0', border: '2px solid white' }}
                                                    />
                                                ))}
                                                {event.participants.length > 5 && <span style={{ marginLeft: '5px', fontSize: '0.8rem' }}>+{event.participants.length - 5}</span>}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
