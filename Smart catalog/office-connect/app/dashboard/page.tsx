'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Activity {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
}

export default function DashboardPage() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [user, setUser] = useState<any>(null);
    const [favorites, setFavorites] = useState<Activity[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFavorites, setShowFavorites] = useState(true);

    useEffect(() => {
        fetchActivities();
        fetchUser();
        fetchFavorites();
    }, []);

    const fetchActivities = async () => {
        const res = await fetch('/api/activities');
        const data = await res.json();
        if (Array.isArray(data)) setActivities(data);
    };

    const fetchUser = async () => {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.user) setUser(data.user);
    };

    const fetchFavorites = async () => {
        const res = await fetch('/api/user/favorites');
        const data = await res.json();
        if (Array.isArray(data.favorites)) setFavorites(data.favorites);
    };

    const toggleFavorite = async (e: React.MouseEvent, activityId: string) => {
        e.preventDefault(); // Prevent link navigation
        e.stopPropagation();

        const res = await fetch('/api/user/favorites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ activityId }),
        });

        if (res.ok) {
            fetchFavorites(); // Refresh favorites
        }
    };

    const filteredActivities = activities.filter(a =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const isFavorite = (id: string) => favorites.some(f => f.id === id);

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1>Hello, {user?.username || 'Friend'}! 👋</h1>
                    <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>What would you like to do today?</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link href="/my-events" className="btn btn-primary">📅 My Events</Link>
                    <Link href="/profile" className="btn" style={{ background: 'rgba(255,255,255,0.5)' }}>Profile</Link>
                    {user?.role === 'admin' && <Link href="/admin" className="btn btn-secondary">Admin</Link>}
                    <button onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/auth/login'; }} className="btn" style={{ background: '#eee' }}>Logout</button>
                </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <input
                    type="text"
                    placeholder="Search activities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: '100%', maxWidth: '400px', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc' }}
                />
            </div>

            {favorites.length > 0 && (
                <div style={{ marginBottom: '3rem' }}>
                    <div
                        onClick={() => setShowFavorites(!showFavorites)}
                        style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: '1rem' }}
                    >
                        <h2 style={{ margin: 0, marginRight: '0.5rem' }}>Your Favorites</h2>
                        <span style={{ transform: showFavorites ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                    </div>

                    {showFavorites && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                            {favorites.map((activity) => (
                                <Link href={`/events/${activity.id}`} key={activity.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div className="glass card" style={{ height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer', position: 'relative' }}>
                                        <button
                                            onClick={(e) => toggleFavorite(e, activity.id)}
                                            style={{
                                                position: 'absolute', top: '10px', right: '10px',
                                                background: 'white', border: 'none', borderRadius: '50%',
                                                width: '30px', height: '30px', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                            }}
                                        >
                                            ❤️
                                        </button>
                                        {activity.imageUrl ? (
                                            <img
                                                src={activity.imageUrl}
                                                alt={activity.name}
                                                style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '0.5rem', marginBottom: '1rem' }}
                                            />
                                        ) : (
                                            <div style={{ width: '100%', height: '200px', background: '#eee', borderRadius: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <span>No Image</span>
                                            </div>
                                        )}
                                        <h3>{activity.name}</h3>
                                        <p style={{ opacity: 0.7, flex: 1 }}>{activity.description}</p>
                                        <div style={{ marginTop: '1rem', textAlign: 'right', color: 'var(--primary)', fontWeight: 'bold' }}>
                                            Join Activities &rarr;
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <h2>All Activities</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                {filteredActivities.map((activity) => (
                    <Link href={`/events/${activity.id}`} key={activity.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="glass card" style={{ height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer', position: 'relative' }}>
                            <button
                                onClick={(e) => toggleFavorite(e, activity.id)}
                                style={{
                                    position: 'absolute', top: '10px', right: '10px',
                                    background: 'white', border: 'none', borderRadius: '50%',
                                    width: '30px', height: '30px', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                }}
                            >
                                {isFavorite(activity.id) ? '❤️' : '🤍'}
                            </button>
                            {activity.imageUrl ? (
                                <img
                                    src={activity.imageUrl}
                                    alt={activity.name}
                                    style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '0.5rem', marginBottom: '1rem' }}
                                />
                            ) : (
                                <div style={{ width: '100%', height: '200px', background: '#eee', borderRadius: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span>No Image</span>
                                </div>
                            )}
                            <h3>{activity.name}</h3>
                            <p style={{ opacity: 0.7, flex: 1 }}>{activity.description}</p>
                            <div style={{ marginTop: '1rem', textAlign: 'right', color: 'var(--primary)', fontWeight: 'bold' }}>
                                Join Activities &rarr;
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
