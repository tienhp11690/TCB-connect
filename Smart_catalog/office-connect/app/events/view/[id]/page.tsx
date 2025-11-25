'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { MapPin, ExternalLink, Calendar, Clock, User, Users, Share2, ArrowLeft } from 'lucide-react';
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
    bannerUrl?: string;
    attachments?: string;
    host: UserInfo;
    activityType: { name: string; imageUrl?: string };
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

    if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Loading event details...</p></div>;
    if (!event) return <div className="min-h-screen flex items-center justify-center"><p className="text-red-500">Event not found.</p></div>;

    const attachments = event.attachments ? JSON.parse(event.attachments) : [];
    const bannerImage = event.bannerUrl || event.activityType.imageUrl;
    const isHost = currentUserId === event.host.id;
    const isParticipant = event.participants.some(p => p.user.id === currentUserId);
    const isFull = event.participants.length >= event.maxParticipants;

    // Fallback gradient if no image
    const backgroundStyle = bannerImage
        ? { backgroundImage: `url(${bannerImage})` }
        : { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Hero Section */}
            <div className="relative h-[300px] md:h-[400px] w-full bg-cover bg-center" style={backgroundStyle}>
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

                <div className="absolute top-4 left-4 z-10">
                    <Link href="/dashboard" className="flex items-center gap-2 text-white/90 hover:text-white bg-black/20 hover:bg-black/40 px-4 py-2 rounded-full transition-all backdrop-blur-sm">
                        <ArrowLeft size={18} />
                        <span>Back</span>
                    </Link>
                </div>

                <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-8 relative z-10 text-white">
                    <div className="inline-block bg-primary/90 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wider w-fit">
                        {event.activityType.name}
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold mb-2 text-shadow-lg leading-tight">
                        {event.activityType.name} Event
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-white/90">
                        <div className="flex items-center gap-2">
                            <Calendar size={18} />
                            <span>{new Date(event.startTime).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock size={18} />
                            <span>{new Date(event.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(event.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin size={18} />
                            <span>{event.location}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-8 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Host & Actions Card */}
                        <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                <UserPreview userId={event.host.id}>
                                    <UserAvatar
                                        avatarUrl={event.host.avatarUrl}
                                        username={event.host.username}
                                        gender={event.host.gender}
                                        size={50}
                                    />
                                </UserPreview>
                                <div>
                                    <p className="text-sm text-gray-500">Hosted by</p>
                                    <UserPreview userId={event.host.id}>
                                        <p className="font-bold text-lg text-gray-900 cursor-pointer hover:text-primary transition-colors">
                                            {event.host.fullName || event.host.username}
                                        </p>
                                    </UserPreview>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                {isHost ? (
                                    <Link href={`/events/edit/${event.id}`} className="flex-1 sm:flex-none text-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2.5 px-6 rounded-xl transition-all">
                                        Edit Event
                                    </Link>
                                ) : (
                                    <>
                                        {isParticipant ? (
                                            <button
                                                onClick={handleLeaveEvent}
                                                disabled={actionLoading}
                                                className="flex-1 sm:flex-none bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-2.5 px-6 rounded-xl transition-all border border-red-200"
                                            >
                                                {actionLoading ? 'Leaving...' : 'Leave Event'}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleJoinEvent}
                                                disabled={actionLoading || isFull}
                                                className={`flex-1 sm:flex-none font-semibold py-2.5 px-6 rounded-xl transition-all shadow-lg shadow-primary/30 ${isFull
                                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                        : 'bg-primary hover:bg-primary-dark text-white'
                                                    }`}
                                            >
                                                {actionLoading ? 'Joining...' : isFull ? 'Event Full' : 'Join Event'}
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        {event.description && (
                            <div className="bg-white rounded-2xl shadow-sm p-6">
                                <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                                    Description
                                </h3>
                                <div
                                    className="ql-editor prose prose-sm max-w-none text-gray-600"
                                    dangerouslySetInnerHTML={{ __html: event.description }}
                                />
                            </div>
                        )}

                        {/* Attachments */}
                        {attachments.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm p-6">
                                <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                                    Attachments
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {attachments.map((url: string, index: number) => (
                                        <div
                                            key={index}
                                            onClick={() => setViewerIndex(index)}
                                            className="group cursor-pointer relative rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all"
                                        >
                                            {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                                <div className="aspect-square overflow-hidden bg-gray-100">
                                                    <img
                                                        src={url}
                                                        alt={`Attachment ${index + 1}`}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="aspect-square flex flex-col items-center justify-center bg-gray-50 group-hover:bg-gray-100 transition-colors p-4 text-center">
                                                    <div className="text-3xl mb-2">📄</div>
                                                    <div className="text-xs text-gray-500 line-clamp-2 break-all">{url.split('/').pop()}</div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Comments Section */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h3 className="text-xl font-bold mb-6 text-gray-800">Discussion</h3>

                            <form onSubmit={handleAddComment} className="mb-8 flex gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                        {/* Placeholder for current user avatar if available */}
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <User size={20} />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Add a comment..."
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newComment.trim()}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-primary-dark disabled:text-gray-300 p-2 transition-colors"
                                    >
                                        Send
                                    </button>
                                </div>
                            </form>

                            <div className="space-y-6">
                                {comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-4 group">
                                        <UserPreview userId={comment.user.id}>
                                            <UserAvatar
                                                avatarUrl={comment.user.avatarUrl}
                                                username={comment.user.username}
                                                gender={comment.user.gender}
                                                size={40}
                                            />
                                        </UserPreview>
                                        <div className="flex-1">
                                            <div className="bg-gray-50 rounded-2xl rounded-tl-none px-4 py-3 inline-block max-w-full">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <UserPreview userId={comment.user.id}>
                                                        <span className="font-bold text-sm text-gray-900 cursor-pointer hover:underline">
                                                            {comment.user.fullName || comment.user.username}
                                                        </span>
                                                    </UserPreview>
                                                    <span className="text-xs text-gray-400">
                                                        {new Date(comment.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-gray-700 text-sm leading-relaxed">{comment.content}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {comments.length === 0 && (
                                    <p className="text-center text-gray-400 py-4 italic">No comments yet. Be the first to say something!</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Location Card */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <MapPin size={20} className="text-primary" />
                                Location
                            </h3>
                            <p className="text-gray-600 mb-4 text-sm">{event.location}</p>
                            <a
                                href={getGoogleMapsUrl(event.location, event.latitude, event.longitude)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full text-center border border-gray-200 hover:border-primary text-gray-600 hover:text-primary font-medium py-2 rounded-xl transition-all text-sm"
                            >
                                View on Google Maps
                            </a>
                        </div>

                        {/* Participants Card */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                    <Users size={20} className="text-primary" />
                                    Participants
                                </h3>
                                <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full">
                                    {event.participants.length}/{event.maxParticipants}
                                </span>
                            </div>

                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {event.participants.map((p) => (
                                    <div key={p.user.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                        <UserPreview userId={p.user.id}>
                                            <UserAvatar
                                                avatarUrl={p.user.avatarUrl}
                                                username={p.user.username}
                                                gender={p.user.gender}
                                                size={36}
                                            />
                                        </UserPreview>
                                        <div className="flex-1 min-w-0">
                                            <UserPreview userId={p.user.id}>
                                                <p className="text-sm font-medium text-gray-900 truncate cursor-pointer hover:text-primary">
                                                    {p.user.fullName || p.user.username}
                                                </p>
                                            </UserPreview>
                                            <p className="text-xs text-gray-400">
                                                Joined {new Date(p.joinedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Popup Components */}
            {selectedUser && (
                <UserProfilePopup
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                />
            )}

            {viewerIndex !== null && (
                <AttachmentViewer
                    attachments={attachments}
                    initialIndex={viewerIndex}
                    onClose={() => setViewerIndex(null)}
                />
            )}
        </div>
    );
}                                    </div >
                                </UserPreview >
    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Joined {new Date(p.joinedAt).toLocaleTimeString()}</div>
                            </div >
                        </div >
                    ))}
                </div >

    {/* Comments Section */ }
    < div style = {{ borderTop: '2px solid rgba(0,0,0,0.1)', paddingTop: '2rem' }}>
        <h3>Comments ({comments.length})</h3>

{/* Add Comment Form */ }
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

{/* Comments List */ }
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
                </div >
            </div >

    {/* User Profile Popup */ }
{
    selectedUser && (
        <UserProfilePopup
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
        />
    )
}

{/* Attachment Viewer */ }
{
    viewerIndex !== null && (
        <AttachmentViewer
            attachments={attachments}
            currentIndex={viewerIndex}
            onClose={() => setViewerIndex(null)}
            onNavigate={(index) => setViewerIndex(index)}
        />
    )
}
        </div >
    );
}
