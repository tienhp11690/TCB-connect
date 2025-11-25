'use client';

import { MouseEvent } from 'react';

interface UserAvatarProps {
    avatarUrl: string;
    username: string;
    gender?: string | null;
    onClick?: (e: MouseEvent) => void;
    size?: number;
}

export default function UserAvatar({ avatarUrl, username, gender, onClick, size = 40 }: UserAvatarProps) {
    const getGenderIcon = () => {
        if (gender === 'male') return '♂️';
        if (gender === 'female') return '♀️';
        return null;
    };

    const genderIcon = getGenderIcon();

    return (
        <div style={{ position: 'relative', display: 'inline-block', cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
            <img
                src={avatarUrl}
                alt={username}
                style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    borderRadius: '50%',
                    objectFit: 'cover'
                }}
            />
            {genderIcon && (
                <div style={{
                    position: 'absolute',
                    bottom: '-2px',
                    right: '-2px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    width: `${size * 0.4}px`,
                    height: `${size * 0.4}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: `${size * 0.3}px`,
                    border: '1px solid #ddd'
                }}>
                    {genderIcon}
                </div>
            )}
        </div>
    );
}
