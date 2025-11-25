'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { MapPin, ExternalLink } from 'lucide-react';
import UserAvatar from '@/components/UserAvatar';
import UserPreview from '@/components/UserPreview';
import UserProfilePopup from '@/components/UserProfilePopup';
import AttachmentViewer from '@/components/AttachmentViewer';
import { formatTimeRange, getGoogleMapsUrl } from '@/lib/mapUtils';

interface UserInfo {
    id: string;
    username: string;
    avatarUrl: string;
    fullName?: string | null;
    gender?: string | null;
    birthYear?: number | null;
    workUnit?: string | null;
}

interface EventDetail {
    id: string;
    startTime: string;
    endTime: string;
    location: string;
    latitude?: number | null;
    longitude?: number | null;
    maxParticipants: number;
    description?: string;
    attachments?: string;
    host: UserInfo;
    activityType: { name: string };
    participants: { user: UserInfo; joinedAt: string }[];
}

interface Comment {
    id: string;
    content: string;
    createdAt: string;
    user: UserInfo;
}

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [event, setEvent] = useState<EventDetail | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
    const [viewerIndex, setViewerIndex] = useState<number | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string>('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchCurrentUser();
        fetchEvent();
        fetchComments();
    }, [id]);

    const fetchCurrentUser = async () => {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.user) setCurrentUserId(data.user.id);
    };

    const fetchEvent = async () => {
        const res = await fetch(`/api/events/${id}`);
        const data = await res.json();
        if (!data.error) setEvent(data);
        setLoading(false);
    };

    const fetchComments = async () => {
        const res = await fetch(`/api/events/${id}/comments`);
        const data = await res.json();
        if (!data.error) setComments(data);
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        const res = await fetch(`/api/events/${id}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: newComment }),
        });

        if (res.ok) {
            const comment = await res.json();
            setComments([comment, ...comments]);
            setNewComment('');
        }
    };

    const handleJoinEvent = async () => {
        setActionLoading(true);
        const res = await fetch(`/api/events/${id}/join`, { method: 'POST' });
        if (res.ok) {
            await fetchEvent();
        } else {
            alert('Failed to join event');
        }
        setActionLoading(false);
    };

    const handleLeaveEvent = async () => {
        if (!confirm('Are you sure you want to leave this event?')) return;
        setActionLoading(true);
        const res = await fetch(`/api/events/${id}/leave`, { method: 'POST' });
        if (res.ok) {
            await fetchEvent();
        } else {
            alert('Failed to leave event');
        }
        setActionLoading(false);
    };

    if (loading) return <div className="container"><p>Loading event details...</p></div>;
    if (!event) return <div className="container"><p>Event not found.</p></div>;

    const attachments = event.attachments ? JSON.parse(event.attachments) : [];

    return (
        <div className="container">
            <Link href="/dashboard" className="btn btn-secondary" style={{ marginBottom: '1rem', display: 'inline-block' }}>&larr; Dashboard</Link>

            <div className="glass card">
                <div style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                    <span style={{ textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px', color: '#666' }}>{event.activityType.name}</span>
                    <h1 style={{ fontSize: '2.5rem', margin: '0.5rem 0' }}>
                        {formatTimeRange(event.startTime, event.endTime)}
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.2rem' }}>
                        <MapPin size={20} />
                        <span style={{ flex: 1 }}>{event.location}</span>
                        <a
                            href={getGoogleMapsUrl(event.location, event.latitude, event.longitude)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                color: 'var(--primary)',
                                textDecoration: 'none',
                                fontSize: '1rem',
                                padding: '0.5rem 1rem',
                                borderRadius: '0.5rem',
                                border: '1px solid var(--primary)',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'var(--primary)';
                                e.currentTarget.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'var(--primary)';
                            }}
                            title="Open in Google Maps"
                        >
                            <ExternalLink size={16} />
                            Open in Maps
                        </a>
                    </div>
                    <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>Hosted by</span>
                        <UserPreview userId={event.host.id}>
                            <UserAvatar
                                avatarUrl={event.host.avatarUrl}
                                username={event.host.username}
                                gender={event.host.gender}
                                size={30}
                            />
                        </UserPreview>
                        <UserPreview userId={event.host.id}>
                            <strong style={{ cursor: 'pointer' }}>
                                {event.host.fullName || event.host.username}
                            </strong>
                        </UserPreview>
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '1rem', paddingBottom: '1rem', marginBottom: '1rem', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                    {currentUserId === event.host.id ? (
                        <Link href={`/events/edit/${event.id}`} className="btn btn-secondary">
                            ✏️ Edit Event
                        </Link>
                    ) : (
                        <>
                            {event.participants.some(p => p.user.id === currentUserId) ? (
                                <button
                                    onClick={handleLeaveEvent}
                                    className="btn btn-secondary"
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? 'Leaving...' : 'Leave Event'}
                                </button>
                            ) : (
                                <button
                                    onClick={handleJoinEvent}
                                    className="btn btn-primary"
                                    disabled={actionLoading || event.participants.length >= event.maxParticipants}
                                >
                                    {actionLoading ? 'Joining...' : event.participants.length >= event.maxParticipants ? 'Event Full' : 'Join Event'}
                                </button>
                            )}
                        </>
                    )}
                </div>

                {/* Description */}
                {event.description && (
                    <div style={{ marginBottom: '2rem' }}>
                        <h3>Description</h3>
                        <div
                            className="ql-editor"
                            dangerouslySetInnerHTML={{ __html: event.description }}
                            style={{ padding: 0 }}
                        />
                    </div>
                )}

                {/* Attachments */}
                {attachments.length > 0 && (
                    <div style={{ marginBottom: '2rem' }}>
                        <h3>Attachments</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                            {attachments.map((url: string, index: number) => (
                                <div
                                    key={index}
                                    onClick={() => setViewerIndex(index)}
                                    style={{ cursor: 'pointer', position: 'relative' }}
                                >
                                    {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                        <img
                                            src={url}
                                            alt={`Attachment ${index + 1}`}
                                            style={{
                                                width: '100%',
                                                height: '150px',
                                                objectFit: 'cover',
                                                borderRadius: '0.5rem',
                                                transition: 'transform 0.2s, box-shadow 0.2s',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'scale(1.05)';
                                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'scale(1)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        />
                                    ) : (
                                        <div
                                            style={{
                                                padding: '1rem',
                                                background: '#f0f0f0',
                                                borderRadius: '0.5rem',
                                                textAlign: 'center',
                                                height: '150px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#e0e0e0'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = '#f0f0f0'}
                                        >
                                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📄</div>
                                            <div style={{ fontSize: '0.8rem', wordBreak: 'break-word' }}>{url.split('/').pop()}</div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <h3>Participants ({event.participants.length}/{event.maxParticipants})</h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem', marginBottom: '2rem' }}>
                    {event.participants.map((p) => (
                        <div key={p.user.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem', background: 'rgba(255,255,255,0.5)', borderRadius: '0.5rem' }}>
                            <UserPreview userId={p.user.id}>
                                <UserAvatar
                                    avatarUrl={p.user.avatarUrl}
                                    username={p.user.username}
                                    gender={p.user.gender}
                                />
                            </UserPreview>
                            <div style={{ flex: 1 }}>
                                <UserPreview userId={p.user.id}>
                                    <div style={{ fontWeight: 'bold', cursor: 'pointer' }}>
                                        {p.user.fullName || p.user.username}
                                    </div>
                                </UserPreview>
                                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Joined {new Date(p.joinedAt).toLocaleTimeString()}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Comments Section */}
                <div style={{ borderTop: '2px solid rgba(0,0,0,0.1)', paddingTop: '2rem' }}>
                    <h3>Comments ({comments.length})</h3>

                    {/* Add Comment Form */}
                    <form onSubmit={handleAddComment} style={{ marginBottom: '2rem' }}>
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            style={{ width: '100%', minHeight: '80px', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ddd', resize: 'vertical' }}
                        />
                        <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                            Post Comment
                        </button>
                    </form>

                    {/* Comments List */}
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {comments.map((comment) => (
                            <div key={comment.id} className="glass card" style={{ padding: '1rem' }}>
                                <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                                    <UserPreview userId={comment.user.id}>
                                        <UserAvatar
                                            avatarUrl={comment.user.avatarUrl}
                                            username={comment.user.username}
                                            gender={comment.user.gender}
                                            size={40}
                                        />
                                    </UserPreview>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <UserPreview userId={comment.user.id}>
                                                <strong style={{ cursor: 'pointer' }}>
                                                    {comment.user.fullName || comment.user.username}
                                                </strong>
                                            </UserPreview>
                                            <small style={{ color: '#666' }}>
                                                {new Date(comment.createdAt).toLocaleString()}
                                            </small>
                                        </div>
                                        <p style={{ margin: '0.5rem 0 0 0', whiteSpace: 'pre-wrap' }}>{comment.content}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* User Profile Popup */}
            {selectedUser && (
                <UserProfilePopup
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                />
            )}

            {/* Attachment Viewer */}
            {viewerIndex !== null && (
                <AttachmentViewer
                    attachments={attachments}
                    currentIndex={viewerIndex}
                    onClose={() => setViewerIndex(null)}
                    onNavigate={(index) => setViewerIndex(index)}
                />
            )}
        </div>
    );
}
