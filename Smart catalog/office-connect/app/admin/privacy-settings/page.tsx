'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Save, Shield } from 'lucide-react';

interface PrivacySettings {
    showFullName: boolean;
    showGender: boolean;
    showAge: boolean;
    showWorkUnit: boolean;
    showMaritalStatus: boolean;
    showHomeAddress: boolean;
    showOfficeAddress: boolean;
    updatedAt?: string;
}

export default function PrivacySettingsPage() {
    const [settings, setSettings] = useState<PrivacySettings>({
        showFullName: true,
        showGender: true,
        showAge: true,
        showWorkUnit: true,
        showMaritalStatus: false,
        showHomeAddress: false,
        showOfficeAddress: false,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/privacy-settings');
            if (res.status === 403) {
                router.push('/dashboard');
                return;
            }
            if (res.ok) {
                const data = await res.json();
                setSettings(data);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);

        try {
            const res = await fetch('/api/admin/privacy-settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });

            if (res.ok) {
                const updated = await res.json();
                setSettings(updated);
                setMessage({ type: 'success', text: 'Privacy settings saved successfully!' });
            } else {
                setMessage({ type: 'error', text: 'Failed to save settings' });
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            setMessage({ type: 'error', text: 'Failed to save settings' });
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = (field: keyof PrivacySettings) => {
        setSettings({ ...settings, [field]: !settings[field] });
    };

    if (loading) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '3rem' }}>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <Link href="/admin" className="btn btn-secondary">
                    ← Back to Admin
                </Link>
                <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Shield size={32} />
                    Privacy Settings
                </h1>
                <div style={{ width: '120px' }} /> {/* Spacer */}
            </div>

            <div className="glass card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '0.5rem' }}>User Information Visibility</h3>
                    <p style={{ color: '#666', fontSize: '0.95rem' }}>
                        Configure which user information is visible when hovering over avatars and usernames across the application.
                    </p>
                </div>

                {/* Settings List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                    {/* Full Name */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', padding: '1rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.02)', transition: 'background 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.02)'}
                    >
                        <input
                            type="checkbox"
                            checked={settings.showFullName}
                            onChange={() => handleToggle('showFullName')}
                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                        />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 'bold' }}>Full Name</div>
                            <div style={{ fontSize: '0.85rem', color: '#666' }}>Show user's real name</div>
                        </div>
                    </label>

                    {/* Gender */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', padding: '1rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.02)', transition: 'background 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.02)'}
                    >
                        <input
                            type="checkbox"
                            checked={settings.showGender}
                            onChange={() => handleToggle('showGender')}
                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                        />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 'bold' }}>Gender</div>
                            <div style={{ fontSize: '0.85rem', color: '#666' }}>Show user's gender</div>
                        </div>
                    </label>

                    {/* Age */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', padding: '1rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.02)', transition: 'background 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.02)'}
                    >
                        <input
                            type="checkbox"
                            checked={settings.showAge}
                            onChange={() => handleToggle('showAge')}
                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                        />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 'bold' }}>Age</div>
                            <div style={{ fontSize: '0.85rem', color: '#666' }}>Show user's age (calculated from birth year)</div>
                        </div>
                    </label>

                    {/* Work Unit */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', padding: '1rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.02)', transition: 'background 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.02)'}
                    >
                        <input
                            type="checkbox"
                            checked={settings.showWorkUnit}
                            onChange={() => handleToggle('showWorkUnit')}
                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                        />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 'bold' }}>Work Unit / Department</div>
                            <div style={{ fontSize: '0.85rem', color: '#666' }}>Show user's work unit or department</div>
                        </div>
                    </label>

                    {/* Marital Status */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', padding: '1rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.02)', transition: 'background 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.02)'}
                    >
                        <input
                            type="checkbox"
                            checked={settings.showMaritalStatus}
                            onChange={() => handleToggle('showMaritalStatus')}
                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                        />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 'bold' }}>Marital Status</div>
                            <div style={{ fontSize: '0.85rem', color: '#666' }}>Show user's marital status</div>
                        </div>
                    </label>

                    {/* Home Address */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', padding: '1rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.02)', transition: 'background 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.02)'}
                    >
                        <input
                            type="checkbox"
                            checked={settings.showHomeAddress}
                            onChange={() => handleToggle('showHomeAddress')}
                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                        />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 'bold' }}>Home Address</div>
                            <div style={{ fontSize: '0.85rem', color: '#666' }}>Show user's home address</div>
                        </div>
                    </label>

                    {/* Office Address */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', padding: '1rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.02)', transition: 'background 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.02)'}
                    >
                        <input
                            type="checkbox"
                            checked={settings.showOfficeAddress}
                            onChange={() => handleToggle('showOfficeAddress')}
                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                        />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 'bold' }}>Office Address</div>
                            <div style={{ fontSize: '0.85rem', color: '#666' }}>Show user's office address</div>
                        </div>
                    </label>
                </div>

                {/* Message */}
                {message && (
                    <div style={{
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        marginBottom: '1rem',
                        background: message.type === 'success' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                        border: `1px solid ${message.type === 'success' ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)'}`,
                        color: message.type === 'success' ? '#4CAF50' : '#F44336'
                    }}>
                        {message.text}
                    </div>
                )}

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn btn-primary"
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                    <Save size={20} />
                    {saving ? 'Saving...' : 'Save Settings'}
                </button>

                {/* Last Updated */}
                {settings.updatedAt && (
                    <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: '#999' }}>
                        Last updated: {new Date(settings.updatedAt).toLocaleString()}
                    </div>
                )}
            </div>
        </div>
    );
}
