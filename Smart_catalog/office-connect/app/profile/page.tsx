'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import LocationPicker to avoid SSR issues with Leaflet
const LocationPicker = dynamic(() => import('@/components/LocationPicker'), {
    ssr: false,
    loading: () => <p>Loading Map...</p>
});

const AVATARS = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Precious',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Midnight',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Molly',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Cuddles',
];

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [message, setMessage] = useState({ text: '', type: '' });

    // Profile Form State
    const [profileForm, setProfileForm] = useState({
        avatarUrl: '',
        fullName: '',
        gender: 'other',
        birthYear: new Date().getFullYear(),
        maritalStatus: 'single',
        workUnit: '',
        homeAddress: '',
        homeCoordinates: '',
        officeAddress: '',
        officeCoordinates: '',
    });

    // Security Form State
    const [securityForm, setSecurityForm] = useState({
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => {
                setMessage({ text: '', type: '' });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.user) {
            setUser(data.user);
            setProfileForm({
                avatarUrl: data.user.avatarUrl || AVATARS[0],
                fullName: data.user.fullName || '',
                gender: data.user.gender || 'other',
                birthYear: data.user.birthYear || new Date().getFullYear(),
                maritalStatus: data.user.maritalStatus || 'single',
                workUnit: data.user.workUnit || '',
                homeAddress: data.user.homeAddress || '',
                homeCoordinates: data.user.homeCoordinates || '',
                officeAddress: data.user.officeAddress || '',
                officeCoordinates: data.user.officeCoordinates || '',
            });
            setSecurityForm(prev => ({ ...prev, email: data.user.email || '' }));
        } else {
            router.push('/auth/login');
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setLoading(true);
        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                setProfileForm({ ...profileForm, avatarUrl: data.url });
            } else {
                alert('Upload failed');
            }
        } catch (error) {
            console.error(error);
            alert('Upload error');
        }
        setLoading(false);
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });

        const res = await fetch('/api/auth/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profileForm),
        });

        const data = await res.json();

        if (res.ok) {
            setMessage({ text: 'Profile updated successfully!', type: 'success' });
            fetchUser();
        } else {
            setMessage({ text: data.error || 'Failed to update profile', type: 'error' });
        }
        setLoading(false);
    };

    const handleUpdateSecurity = async (e: React.FormEvent) => {
        e.preventDefault();
        if (securityForm.newPassword && securityForm.newPassword !== securityForm.confirmPassword) {
            setMessage({ text: 'New passwords do not match', type: 'error' });
            return;
        }

        setLoading(true);
        setMessage({ text: '', type: '' });

        const res = await fetch('/api/auth/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: securityForm.email,
                password: securityForm.currentPassword,
                newPassword: securityForm.newPassword
            }),
        });

        const data = await res.json();

        if (res.ok) {
            setMessage({ text: 'Security settings updated successfully!', type: 'success' });
            setSecurityForm(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
        } else {
            setMessage({ text: data.error || 'Failed to update security settings', type: 'error' });
        }
        setLoading(false);
    };

    if (!user) return <div className="container"><p>Loading...</p></div>;

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <Link href="/dashboard" className="btn btn-secondary">&larr; Dashboard</Link>
                <h1>My Profile</h1>
                <div style={{ width: '100px' }}></div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #ccc' }}>
                <button
                    className={`btn ${activeTab === 'profile' ? 'btn-primary' : ''}`}
                    onClick={() => setActiveTab('profile')}
                    style={{ background: activeTab === 'profile' ? undefined : 'transparent', color: activeTab === 'profile' ? undefined : '#333' }}
                >
                    Edit Profile
                </button>
                <button
                    className={`btn ${activeTab === 'security' ? 'btn-primary' : ''}`}
                    onClick={() => setActiveTab('security')}
                    style={{ background: activeTab === 'security' ? undefined : 'transparent', color: activeTab === 'security' ? undefined : '#333' }}
                >
                    Account Security
                </button>
            </div>

            {message.text && (
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    backgroundColor: message.type === 'error' ? '#ff4d4f' : '#52c41a',
                    color: 'white',
                    padding: '1rem 2rem',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    zIndex: 1000,
                    animation: 'slideIn 0.3s ease-out',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <span>{message.type === 'error' ? '⚠️' : '✅'}</span>
                    {message.text}
                </div>
            )}
            <style jsx global>{`
                @keyframes slideIn {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>

            {activeTab === 'profile' && (
                <form onSubmit={handleUpdateProfile} className="glass card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    {/* Avatar */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
                        <img src={profileForm.avatarUrl} alt="Avatar" style={{ width: '120px', height: '120px', borderRadius: '50%', marginBottom: '1rem', objectFit: 'cover' }} />
                        <input type="file" accept="image/*" onChange={handleFileUpload} style={{ marginBottom: '1rem' }} />
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                            {AVATARS.map((avatar) => (
                                <img
                                    key={avatar}
                                    src={avatar}
                                    onClick={() => setProfileForm({ ...profileForm, avatarUrl: avatar })}
                                    style={{ width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', border: profileForm.avatarUrl === avatar ? '2px solid var(--primary)' : 'none' }}
                                />
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Full Name</label>
                            <input
                                type="text"
                                value={profileForm.fullName}
                                onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Gender</label>
                            <select
                                value={profileForm.gender}
                                onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem' }}
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Birth Year</label>
                            <input
                                type="number"
                                value={profileForm.birthYear || ''}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    setProfileForm({ ...profileForm, birthYear: isNaN(val) ? 0 : val });
                                }}
                                style={{ width: '100%', padding: '0.5rem' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Marital Status</label>
                            <select
                                value={profileForm.maritalStatus}
                                onChange={(e) => setProfileForm({ ...profileForm, maritalStatus: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem' }}
                            >
                                <option value="single">Single</option>
                                <option value="married">Married</option>
                                <option value="divorced">Divorced</option>
                                <option value="widowed">Widowed</option>
                            </select>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Work Unit</label>
                            <input
                                type="text"
                                value={profileForm.workUnit}
                                onChange={(e) => setProfileForm({ ...profileForm, workUnit: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem' }}
                            />
                        </div>
                    </div>

                    <hr style={{ margin: '2rem 0', border: '0', borderTop: '1px solid #eee' }} />

                    <LocationPicker
                        label="Home Address"
                        initialAddress={profileForm.homeAddress}
                        initialCoordinates={profileForm.homeCoordinates}
                        onLocationSelect={(addr, coords) => setProfileForm(prev => ({ ...prev, homeAddress: addr, homeCoordinates: coords }))}
                    />

                    <LocationPicker
                        label="Office Address"
                        initialAddress={profileForm.officeAddress}
                        initialCoordinates={profileForm.officeCoordinates}
                        onLocationSelect={(addr, coords) => setProfileForm(prev => ({ ...prev, officeAddress: addr, officeCoordinates: coords }))}
                    />

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
                        {loading ? 'Saving...' : 'Save Profile'}
                    </button>
                </form>
            )}

            {activeTab === 'security' && (
                <form onSubmit={handleUpdateSecurity} className="glass card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email (for recovery)</label>
                        <input
                            type="email"
                            value={securityForm.email}
                            onChange={(e) => setSecurityForm({ ...securityForm, email: e.target.value })}
                            style={{ width: '100%', padding: '0.5rem' }}
                        />
                    </div>

                    <hr style={{ margin: '2rem 0', border: '0', borderTop: '1px solid #eee' }} />
                    <h3>Change Password</h3>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Current Password</label>
                        <input
                            type="password"
                            value={securityForm.currentPassword}
                            onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                            style={{ width: '100%', padding: '0.5rem' }}
                        />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>New Password</label>
                        <input
                            type="password"
                            value={securityForm.newPassword}
                            onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                            style={{ width: '100%', padding: '0.5rem' }}
                        />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Confirm New Password</label>
                        <input
                            type="password"
                            value={securityForm.confirmPassword}
                            onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                            style={{ width: '100%', padding: '0.5rem' }}
                        />
                    </div>

                    <button type="submit" className="btn btn-secondary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Updating...' : 'Update Security Settings'}
                    </button>
                </form>
            )}
        </div>
    );
}
