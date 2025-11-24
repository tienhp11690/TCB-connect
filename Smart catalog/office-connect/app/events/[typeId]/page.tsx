'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapPin, ExternalLink, Navigation, Clock } from 'lucide-react';
import { formatTimeRange, getGoogleMapsUrl, calculateDistance, parseCoordinates } from '@/lib/mapUtils';

interface Event {
    id: string;
    startTime: string;
    endTime: string;
    location: string;
    latitude?: number | null;
    longitude?: number | null;
    maxParticipants: number;
    host: { id: string; username: string; avatarUrl: string };
    participants: { user: { id: string; username: string; avatarUrl: string } }[];
}

export default function EventListPage({ params }: { params: Promise<{ typeId: string }> }) {
    const { typeId } = use(params);
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'joined'>('all');
    const [currentUserId, setCurrentUserId] = useState<string>('');
    const [sortBy, setSortBy] = useState<'time' | 'distance-home' | 'distance-office'>('time');
    const [userCoordinates, setUserCoordinates] = useState<{ home: { lat: number; lng: number } | null; office: { lat: number; lng: number } | null }>({ home: null, office: null });
    const router = useRouter();

    useEffect(() => {
        fetchCurrentUser();
        fetchEvents();
    }, [typeId]);

    const fetchCurrentUser = async () => {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.user) {
            setCurrentUserId(data.user.id);
            // Parse user's home and office coordinates
            const homeCoords = data.user.homeCoordinates ? parseCoordinates(data.user.homeCoordinates) : null;
            const officeCoords = data.user.officeCoordinates ? parseCoordinates(data.user.officeCoordinates) : null;
            setUserCoordinates({ home: homeCoords, office: officeCoords });
        }
    };

    const fetchEvents = async () => {
        const res = await fetch(`/api/events?activityTypeId=${typeId}`);
        const data = await res.json();
        if (Array.isArray(data)) setEvents(data);
        setLoading(false);
    };

    // Calculate distance for each event
    const eventsWithDistance = events.map(event => {
        let distanceFromHome: number | null = null;
        let distanceFromOffice: number | null = null;

        if (event.latitude && event.longitude) {
            if (userCoordinates.home) {
                distanceFromHome = calculateDistance(
                    userCoordinates.home.lat,
                    userCoordinates.home.lng,
                    event.latitude,
                    event.longitude
                );
            }
            if (userCoordinates.office) {
                distanceFromOffice = calculateDistance(
                    userCoordinates.office.lat,
                    userCoordinates.office.lng,
                    event.latitude,
                    event.longitude
                );
            }
        }

        return { ...event, distanceFromHome, distanceFromOffice };
    });

    // Filter events based on active tab
    let filteredEvents = activeTab === 'joined'
        ? eventsWithDistance.filter(e => e.participants.some(p => p.user.id === currentUserId))
        : eventsWithDistance;

    // Sort events
    filteredEvents = [...filteredEvents].sort((a, b) => {
        if (sortBy === 'time') {
            return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
        } else if (sortBy === 'distance-home') {
            if (a.distanceFromHome === null) return 1;
            if (b.distanceFromHome === null) return -1;
            return a.distanceFromHome - b.distanceFromHome;
        } else if (sortBy === 'distance-office') {
            if (a.distanceFromOffice === null) return 1;
            if (b.distanceFromOffice === null) return -1;
            return a.distanceFromOffice - b.distanceFromOffice;
        }
        return 0;
    });

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <Link href="/dashboard" className="btn btn-secondary">&larr; Back</Link>
                <h1>Upcoming Events</h1>
                <Link href={`/events/create?typeId=${typeId}`} className="btn btn-primary">
                    + Create New Event
                </Link>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '2px solid rgba(0,0,0,0.1)' }}>
                <button
                    onClick={() => setActiveTab('all')}
                    style={{
                        background: 'none',
                        border: 'none',
                        padding: '0.75rem 1.5rem',
                        fontSize: '1rem',
                        fontWeight: activeTab === 'all' ? 'bold' : 'normal',
                        color: activeTab === 'all' ? 'var(--primary)' : '#666',
                        borderBottom: activeTab === 'all' ? '3px solid var(--primary)' : '3px solid transparent',
                        cursor: 'pointer',
                        marginBottom: '-2px'
                    }}
                >
                    All Events
                </button>
                <button
                    onClick={() => setActiveTab('joined')}
                    style={{
                        background: 'none',
                        border: 'none',
                        padding: '0.75rem 1.5rem',
                        fontSize: '1rem',
                        fontWeight: activeTab === 'joined' ? 'bold' : 'normal',
                        color: activeTab === 'joined' ? 'var(--primary)' : '#666',
                        borderBottom: activeTab === 'joined' ? '3px solid var(--primary)' : '3px solid transparent',
                        cursor: 'pointer',
                        marginBottom: '-2px'
                    }}
                >
                    My Events
                </button>
            </div>

            {/* Sort By Selector */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.9rem', color: '#666', fontWeight: 'bold' }}>Sort by:</label>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'time' | 'distance-home' | 'distance-office')}
                    style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #ddd',
                        background: 'rgba(255, 255, 255, 0.9)',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        minWidth: '200px'
                    }}
                >
                    <option value="time">⏰ Time (Earliest First)</option>
                    <option value="distance-home" disabled={!userCoordinates.home}>
                        🏠 Distance from Home {!userCoordinates.home && '(Set home address)'}
                    </option>
                    <option value="distance-office" disabled={!userCoordinates.office}>
                        🏢 Distance from Office {!userCoordinates.office && '(Set office address)'}
                    </option>
                </select>
            </div>

            {loading ? (
                <p>Loading events...</p>
            ) : filteredEvents.length === 0 ? (
                <div className="glass card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <h3>{activeTab === 'joined' ? 'You haven\'t joined any events yet.' : 'No events found for this activity yet.'}</h3>
                    <p>{activeTab === 'joined' ? 'Join an event from the All Events tab!' : 'Be the first to organize one!'}</p>
                    {activeTab === 'all' && (
                        <>
                            <br />
                            <Link href={`/events/create?typeId=${typeId}`} className="btn btn-primary">
                                Create Event
                            </Link>
                        </>
                    )}
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {filteredEvents.map((event) => (
                        <Link
                            key={event.id}
                            href={`/events/view/${event.id}`}
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            <div className="glass card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <img src={event.host.avatarUrl || ''} alt="Host" style={{ width: '30px', height: '30px', borderRadius: '50%' }} />
                                    <strong>{event.host.username}</strong> is hosting
                                </div>
                                <h3 style={{ marginBottom: '0.5rem' }}>
                                    {formatTimeRange(event.startTime, event.endTime)}
                                </h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <MapPin size={16} style={{ flexShrink: 0 }} />
                                    <span style={{ flex: 1 }}>{event.location}</span>
                                    <a
                                        href={getGoogleMapsUrl(event.location, event.latitude, event.longitude)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.25rem',
                                            color: 'var(--primary)',
                                            textDecoration: 'none',
                                            fontSize: '0.85rem',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '0.25rem',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        title="Open in Google Maps"
                                    >
                                        <ExternalLink size={14} />
                                        Maps
                                    </a>
                                </div>

                                {/* Distance Indicator */}
                                {sortBy !== 'time' && (
                                    <div style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                                        {sortBy === 'distance-home' && event.distanceFromHome !== null && (
                                            <div style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.25rem',
                                                padding: '0.25rem 0.75rem',
                                                background: 'rgba(76, 175, 80, 0.1)',
                                                border: '1px solid rgba(76, 175, 80, 0.3)',
                                                borderRadius: '1rem',
                                                fontSize: '0.85rem',
                                                fontWeight: 'bold',
                                                color: '#4CAF50'
                                            }}>
                                                <Navigation size={14} />
                                                {event.distanceFromHome < 1
                                                    ? `${(event.distanceFromHome * 1000).toFixed(0)}m from home`
                                                    : `${event.distanceFromHome.toFixed(1)} km from home`}
                                            </div>
                                        )}
                                        {sortBy === 'distance-office' && event.distanceFromOffice !== null && (
                                            <div style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.25rem',
                                                padding: '0.25rem 0.75rem',
                                                background: 'rgba(33, 150, 243, 0.1)',
                                                border: '1px solid rgba(33, 150, 243, 0.3)',
                                                borderRadius: '1rem',
                                                fontSize: '0.85rem',
                                                fontWeight: 'bold',
                                                color: '#2196F3'
                                            }}>
                                                <Navigation size={14} />
                                                {event.distanceFromOffice < 1
                                                    ? `${(event.distanceFromOffice * 1000).toFixed(0)}m from office`
                                                    : `${event.distanceFromOffice.toFixed(1)} km from office`}
                                            </div>
                                        )}
                                    </div>
                                )}

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
        </div>
    );
}
