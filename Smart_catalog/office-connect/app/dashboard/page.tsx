'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, Clock, User } from 'lucide-react';
import UserAvatar from '@/components/UserAvatar';

interface ActivityType {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
}

interface Event {
    id: string;
    startTime: string;
    endTime: string;
    location: string;
    description?: string;
    bannerUrl?: string;
    activityType: {
        name: string;
        imageUrl?: string;
    };
    host: {
        id: string;
        username: string;
        avatarUrl: string;
    };
    participants: {
        user: {
            id: string;
            username: string;
            avatarUrl: string;
        };
    }[];
}

export default function DashboardPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [user, setUser] = useState<any>(null);
    const [favorites, setFavorites] = useState<ActivityType[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFavorites, setShowFavorites] = useState(true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            await Promise.all([fetchEvents(), fetchUser(), fetchFavorites()]);
            setLoading(false);
        };
        loadData();
    }, []);

    const fetchEvents = async () => {
        const res = await fetch('/api/events');
        const data = await res.json();
        if (Array.isArray(data)) setEvents(data);
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
        e.preventDefault();
        e.stopPropagation();

        const res = await fetch('/api/user/favorites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ activityId }),
        });

        if (res.ok) {
            fetchFavorites();
        }
    };

    const filteredEvents = events.filter(e =>
        e.activityType.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const isFavorite = (activityId: string) => favorites.some(f => f.id === activityId);

    if (loading) {
        return <div className="container flex items-center justify-center min-h-[50vh]"><p>Loading dashboard...</p></div>;
    }

    return (
        <div className="container pb-20">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Hello, {user?.username || 'Friend'}! 👋</h1>
                    <p className="text-gray-500 text-lg">Ready for your next activity?</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Link href="/my-events" className="btn btn-primary shadow-lg shadow-primary/20">
                        📅 My Events
                    </Link>
                    <Link href="/profile" className="btn bg-white border border-gray-200 hover:bg-gray-50 text-gray-700">
                        Profile
                    </Link>
                    {user?.role === 'admin' && (
                        <Link href="/admin" className="btn bg-gray-800 text-white hover:bg-gray-900">
                            Admin
                        </Link>
                    )}
                    <button
                        onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/auth/login'; }}
                        className="btn bg-gray-100 hover:bg-gray-200 text-gray-700"
                    >
                        Logout
                    </button>
                </div>
            </div>

            <div className="mb-8 relative">
                <input
                    type="text"
                    placeholder="Search events by activity or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full max-w-md px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 pl-10"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            </div>

            {favorites.length > 0 && (
                <div className="mb-12">
                    <div
                        onClick={() => setShowFavorites(!showFavorites)}
                        className="flex items-center cursor-pointer mb-4 group"
                    >
                        <h2 className="text-xl font-bold text-gray-800 mr-2 group-hover:text-primary transition-colors">Favorite Activities</h2>
                        <span className={`transform transition-transform duration-200 ${showFavorites ? 'rotate-180' : ''}`}>▼</span>
                    </div>

                    {showFavorites && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {favorites.map((activity) => (
                                <Link href={`/events/create?activityTypeId=${activity.id}`} key={activity.id} className="block group">
                                    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-100 h-full flex flex-col">
                                        <div className="relative h-32 overflow-hidden">
                                            {activity.imageUrl ? (
                                                <img
                                                    src={activity.imageUrl}
                                                    alt={activity.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                                                    No Image
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                            <h3 className="absolute bottom-3 left-3 text-white font-bold text-lg">{activity.name}</h3>
                                            <button
                                                onClick={(e) => toggleFavorite(e, activity.id)}
                                                className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full shadow-sm hover:bg-white transition-colors"
                                            >
                                                ❤️
                                            </button>
                                        </div>
                                        <div className="p-4 flex-1 flex flex-col justify-between">
                                            <p className="text-sm text-gray-500 line-clamp-2 mb-3">{activity.description}</p>
                                            <span className="text-primary text-sm font-semibold group-hover:translate-x-1 transition-transform inline-block">
                                                Create Event &rarr;
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Upcoming Events</h2>
                <Link href="/events/create" className="btn btn-primary text-sm py-2 px-4">
                    + Create Event
                </Link>
            </div>

            {filteredEvents.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                    <p className="text-gray-500 mb-4">No upcoming events found.</p>
                    <Link href="/events/create" className="btn btn-primary">
                        Create the first one!
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.map((event) => {
                        const bannerImage = event.bannerUrl || event.activityType.imageUrl;
                        return (
                            <Link href={`/events/view/${event.id}`} key={event.id} className="block group h-full">
                                <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 h-full flex flex-col">
                                    {/* Card Image */}
                                    <div className="relative aspect-video overflow-hidden bg-gray-100">
                                        {bannerImage ? (
                                            <img
                                                src={bannerImage}
                                                alt={event.activityType.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                                                {event.activityType.name}
                                            </div>
                                        )}
                                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-gray-700 shadow-sm">
                                            {event.activityType.name}
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-5 flex-1 flex flex-col">
                                        <div className="flex items-center gap-2 text-primary text-sm font-semibold mb-2">
                                            <Calendar size={14} />
                                            <span>{new Date(event.startTime).toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                                            <span className="text-gray-300">•</span>
                                            <Clock size={14} />
                                            <span>{new Date(event.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>

                                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                                            {event.activityType.name} @ {event.location}
                                        </h3>

                                        <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                                            <MapPin size={14} className="flex-shrink-0" />
                                            <span className="truncate">{event.location}</span>
                                        </div>

                                        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <UserAvatar
                                                    avatarUrl={event.host.avatarUrl}
                                                    username={event.host.username}
                                                    size={24}
                                                />
                                                <span className="text-xs text-gray-600 truncate max-w-[100px]">
                                                    {event.host.username}
                                                </span>
                                            </div>
                                            <div className="flex -space-x-2">
                                                {event.participants.slice(0, 3).map((p, i) => (
                                                    <div key={i} className="border-2 border-white rounded-full">
                                                        <UserAvatar
                                                            avatarUrl={p.user.avatarUrl}
                                                            username={p.user.username}
                                                            size={24}
                                                        />
                                                    </div>
                                                ))}
                                                {event.participants.length > 3 && (
                                                    <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] text-gray-500 font-bold">
                                                        +{event.participants.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
