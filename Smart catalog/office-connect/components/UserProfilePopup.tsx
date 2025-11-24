'use client';

interface UserProfile {
    id: string;
    username: string;
    fullName?: string | null;
    gender?: string | null;
    birthYear?: number | null;
    workUnit?: string | null;
    avatarUrl: string;
}

interface UserProfilePopupProps {
    user: UserProfile;
    onClose: () => void;
}

export default function UserProfilePopup({ user, onClose }: UserProfilePopupProps) {
    const getAge = () => {
        if (!user.birthYear) return null;
        const currentYear = new Date().getFullYear();
        return currentYear - user.birthYear;
    };

    const getGenderDisplay = () => {
        if (user.gender === 'male') return '♂️ Male';
        if (user.gender === 'female') return '♀️ Female';
        return 'Other';
    };

    return (
        <>
            {/* Overlay */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {/* Popup */}
                <div
                    onClick={(e) => e.stopPropagation()}
                    className="glass card"
                    style={{
                        maxWidth: '400px',
                        width: '90%',
                        position: 'relative',
                        animation: 'slideIn 0.2s ease-out'
                    }}
                >
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            background: 'transparent',
                            border: 'none',
                            fontSize: '24px',
                            cursor: 'pointer',
                            color: '#666'
                        }}
                    >
                        ×
                    </button>

                    {/* Avatar */}
                    <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                        <img
                            src={user.avatarUrl}
                            alt={user.username}
                            style={{
                                width: '100px',
                                height: '100px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '3px solid var(--primary)'
                            }}
                        />
                    </div>

                    {/* User Info */}
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ margin: '0 0 0.5rem 0' }}>{user.fullName || user.username}</h2>
                        {user.fullName && (
                            <p style={{ color: '#666', margin: '0 0 1rem 0' }}>@{user.username}</p>
                        )}
                    </div>

                    <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <strong>Gender:</strong>
                            <span>{getGenderDisplay()}</span>
                        </div>

                        {getAge() && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <strong>Age:</strong>
                                <span>{getAge()} years old</span>
                            </div>
                        )}

                        {user.workUnit && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <strong>Work Unit:</strong>
                                <span>{user.workUnit}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes slideIn {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </>
    );
}
