'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('activities');
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    // Data states
    const [users, setUsers] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [newActivity, setNewActivity] = useState({ name: '', description: '', imageUrl: '' });

    useEffect(() => {
        checkAdmin();
    }, []);

    const checkAdmin = async () => {
        try {
            const res = await fetch('/api/auth/me');
            const data = await res.json();
            if (data.user && data.user.role === 'admin') {
                setIsAdmin(true);
                fetchStats();
            } else {
                router.push('/dashboard');
            }
        } catch (e) {
            router.push('/auth/login');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        const res = await fetch('/api/admin/stats');
        if (res.ok) {
            const data = await res.json();
            setUsers(data.users);
            setEvents(data.events);
        }
    };

    const handleCreateActivity = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/activities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newActivity),
        });
        if (res.ok) {
            alert('Activity created!');
            setNewActivity({ name: '', description: '', imageUrl: '' });
        } else {
            alert('Failed to create activity');
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });
        const data = await res.json();
        if (data.success) {
            setNewActivity({ ...newActivity, imageUrl: data.url });
        }
    };

    if (loading) return <div className="container">Loading...</div>;
    if (!isAdmin) return null;

    return (
        <div className="container">
            <Link href="/dashboard" className="btn btn-secondary" style={{ marginBottom: '1rem', display: 'inline-block' }}>&larr; Dashboard</Link>
            <h1>Admin Dashboard</h1>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #ccc', paddingBottom: '1rem' }}>
                <button
                    className={`btn ${activeTab === 'activities' ? 'btn-primary' : ''}`}
                    onClick={() => setActiveTab('activities')}
                    style={{ background: activeTab === 'activities' ? undefined : '#eee' }}
                >
                    Manage Activities
                </button>
                <button
                    className={`btn ${activeTab === 'events' ? 'btn-primary' : ''}`}
                    onClick={() => setActiveTab('events')}
                    style={{ background: activeTab === 'events' ? undefined : '#eee' }}
                >
                    Event Logs
                </button>
                <button
                    className={`btn ${activeTab === 'users' ? 'btn-primary' : ''}`}
                    onClick={() => setActiveTab('users')}
                    style={{ background: activeTab === 'users' ? undefined : '#eee' }}
                >
                    User Management
                </button>
                <Link
                    href="/admin/privacy-settings"
                    className="btn"
                    style={{ background: '#eee', textDecoration: 'none' }}
                >
                    🔒 Privacy Settings
                </Link>
            </div>

            {activeTab === 'activities' && (
                <div className="glass card" style={{ maxWidth: '600px' }}>
                    <h2>Create New Activity</h2>
                    <form onSubmit={handleCreateActivity}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Name</label>
                            <input
                                type="text"
                                required
                                value={newActivity.name}
                                onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem' }}
                            />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description</label>
                            <textarea
                                value={newActivity.description}
                                onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem' }}
                            />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Activity Image</label>

                            {/* Image Preview */}
                            {newActivity.imageUrl && (
                                <div style={{ marginBottom: '1rem', position: 'relative', display: 'inline-block' }}>
                                    <img
                                        src={newActivity.imageUrl}
                                        alt="Preview"
                                        style={{ width: '200px', height: '150px', objectFit: 'cover', borderRadius: '0.5rem' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setNewActivity({ ...newActivity, imageUrl: '' })}
                                        style={{
                                            position: 'absolute',
                                            top: '5px',
                                            right: '5px',
                                            background: 'red',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '25px',
                                            height: '25px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        ×
                                    </button>
                                </div>
                            )}

                            {/* Upload Button */}
                            <div style={{ marginBottom: '0.5rem' }}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    id="image-upload"
                                    style={{ display: 'none' }}
                                    onChange={handleImageUpload}
                                />
                                <label
                                    htmlFor="image-upload"
                                    className="btn"
                                    style={{ background: '#eee', cursor: 'pointer', display: 'inline-block' }}
                                >
                                    📤 Upload Image
                                </label>
                            </div>

                            {/* Manual URL Input */}
                            <input
                                type="text"
                                placeholder="Or paste image URL..."
                                value={newActivity.imageUrl}
                                onChange={(e) => setNewActivity({ ...newActivity, imageUrl: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem' }}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary">Create Activity</button>
                    </form>
                </div>
            )}

            {activeTab === 'events' && (
                <div>
                    <h2>Recent Events</h2>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                                <th style={{ padding: '0.5rem' }}>Event</th>
                                <th style={{ padding: '0.5rem' }}>Host</th>
                                <th style={{ padding: '0.5rem' }}>Date</th>
                                <th style={{ padding: '0.5rem' }}>Location</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.map(event => (
                                <tr key={event.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '0.5rem' }}>{event.activityType?.name}</td>
                                    <td style={{ padding: '0.5rem' }}>{event.host?.username}</td>
                                    <td style={{ padding: '0.5rem' }}>{new Date(event.startTime).toLocaleString()}</td>
                                    <td style={{ padding: '0.5rem' }}>{event.location}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'users' && (
                <div>
                    <h2>Users</h2>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {users.map(user => (
                            <div key={user.id} className="glass card" style={{ padding: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <strong>{user.username}</strong> ({user.email || 'No email'})
                                        <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', background: '#eee', padding: '0.2rem 0.5rem', borderRadius: '1rem' }}>
                                            {user.role}
                                        </span>
                                    </div>
                                    <div>Joined: {new Date(user.createdAt).toLocaleDateString()}</div>
                                </div>
                                <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                                    Hosted Events: {user.hostedEvents?.length || 0}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
