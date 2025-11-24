'use client';

import { useState, useEffect, useRef } from 'react';
import { User, Briefcase, Calendar } from 'lucide-react';

interface UserData {
    id: string;
    username: string;
    avatarUrl: string | null;
    fullName?: string;
    gender?: string;
    birthYear?: number;
    workUnit?: string;
    maritalStatus?: string;
}

interface UserPreviewProps {
    userId: string;
    children: React.ReactNode;
}

export default function UserPreview({ userId, children }: UserPreviewProps) {
    const [showPreview, setShowPreview] = useState(false);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const fetchedRef = useRef(false);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const handleMouseEnter = () => {
        // Debounce to avoid fetching too quickly
        timeoutRef.current = setTimeout(() => {
            setShowPreview(true);
            if (!fetchedRef.current) {
                fetchUserData();
            }
        }, 300); // 300ms delay
    };

    const handleMouseLeave = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setShowPreview(false);
    };

    const fetchUserData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/users/${userId}`);
            if (res.ok) {
                const data = await res.json();
                setUserData(data);
                fetchedRef.current = true;
            }
        } catch (error) {
            console.error('Error fetching user preview:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateAge = (birthYear: number) => {
        const currentYear = new Date().getFullYear();
        return currentYear - birthYear;
    };

    const getGenderIcon = (gender?: string) => {
        if (gender === 'male') return '♂️';
        if (gender === 'female') return '♀️';
        return null;
    };

    return (
        <div
            style={{ position: 'relative', display: 'inline-block' }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}

            {showPreview && (
                <div
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 1000,
                        width: '280px',
                        background: 'white',
                        border: '1px solid rgba(0,0,0,0.1)',
                        borderRadius: '12px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                        padding: '16px',
                        pointerEvents: 'none',
                        animation: 'fadeIn 0.2s ease-in-out',
                    }}
                >
                    {loading && (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                            Loading...
                        </div>
                    )}

                    {!loading && userData && (
                        <div>
                            {/* Avatar and Username */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                <img
                                    src={userData.avatarUrl || '/default-avatar.png'}
                                    alt={userData.username}
                                    style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        border: '2px solid var(--primary)'
                                    }}
                                />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '2px' }}>
                                        @{userData.username}
                                    </div>
                                    {userData.fullName && (
                                        <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                            {userData.fullName}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* User Details */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {/* Gender and Age */}
                                {(userData.gender || userData.birthYear) && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                                        <Calendar size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                                        <span>
                                            {getGenderIcon(userData.gender)}
                                            {userData.gender && <span style={{ textTransform: 'capitalize' }}>{userData.gender}</span>}
                                            {userData.gender && userData.birthYear && ', '}
                                            {userData.birthYear && `${calculateAge(userData.birthYear)} years old`}
                                        </span>
                                    </div>
                                )}

                                {/* Work Unit */}
                                {userData.workUnit && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                                        <Briefcase size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                                        <span>{userData.workUnit}</span>
                                    </div>
                                )}

                                {/* Marital Status */}
                                {userData.maritalStatus && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                                        <User size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                                        <span style={{ textTransform: 'capitalize' }}>{userData.maritalStatus}</span>
                                    </div>
                                )}
                            </div>

                            {/* No data message */}
                            {!userData.fullName && !userData.gender && !userData.birthYear && !userData.workUnit && !userData.maritalStatus && (
                                <div style={{ textAlign: 'center', color: '#999', fontSize: '0.85rem', padding: '8px 0' }}>
                                    No additional information available
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateX(-50%) translateY(-4px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(-50%) translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}
