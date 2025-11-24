'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import RichTextEditor from '@/components/RichTextEditor';
import LocationMapPicker from '@/components/LocationMapPicker';

function CreateEventForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activityTypeId = searchParams.get('typeId');

    const [form, setForm] = useState({
        startTime: '',
        endTime: '',
        location: '',
        latitude: null as number | null,
        longitude: null as number | null,
        maxParticipants: 10,
        description: '',
        attachments: [] as string[],
    });
    const [loading, setLoading] = useState(false);
    const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleLocationSearch = async (query: string) => {
        setForm({ ...form, location: query });

        if (!query || query.length < 1) {
            setLocationSuggestions([]);
            return;
        }

        try {
            const res = await fetch(`/api/locations/suggest?query=${encodeURIComponent(query)}`);
            if (res.ok) {
                const data = await res.json();
                setLocationSuggestions(data.suggestions);
                setShowSuggestions(true);
            }
        } catch (error) {
            console.error("Failed to fetch suggestions", error);
        }
    };

    const selectLocation = (location: string) => {
        setForm({ ...form, location });
        setShowSuggestions(false);
    };

    const handleLocationFromMap = (lat: number, lng: number, address?: string) => {
        setForm({
            ...form,
            latitude: lat,
            longitude: lng,
            location: address || form.location
        });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const uploadedUrls: string[] = [];

        for (let i = 0; i < files.length; i++) {
            const formData = new FormData();
            formData.append('file', files[i]);

            try {
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });
                const data = await res.json();
                if (data.success) {
                    uploadedUrls.push(data.url);
                }
            } catch (error) {
                console.error('Upload failed', error);
            }
        }

        setForm({ ...form, attachments: [...form.attachments, ...uploadedUrls] });
    };

    const removeAttachment = (index: number) => {
        setForm({ ...form, attachments: form.attachments.filter((_, i) => i !== index) });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const res = await fetch('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...form,
                activityTypeId,
            }),
        });

        if (res.ok) {
            router.push(`/events/${activityTypeId}`);
        } else {
            alert('Failed to create event');
        }
        setLoading(false);
    };

    if (!activityTypeId) return <p>Invalid Activity Type</p>;

    return (
        <div className="glass card" style={{ width: '100%', maxWidth: '500px' }}>
            <Link href={`/events/${activityTypeId}`} style={{ marginBottom: '1rem', display: 'inline-block', color: '#666' }}>&larr; Cancel</Link>
            <h1 style={{ marginBottom: '1.5rem' }}>Create New Event</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Start Date & Time</label>
                    <input
                        type="datetime-local"
                        required
                        value={form.startTime}
                        onChange={(e) => {
                            const startTime = e.target.value;
                            setForm({
                                ...form,
                                startTime,
                                // Auto-fill end time to 1 hour after start if empty
                                endTime: form.endTime || new Date(new Date(startTime).getTime() + 60 * 60 * 1000).toISOString().slice(0, 16)
                            });
                        }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>End Date & Time</label>
                    <input
                        type="datetime-local"
                        required
                        value={form.endTime}
                        onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                        min={form.startTime}
                    />
                    {form.startTime && form.endTime && new Date(form.endTime) <= new Date(form.startTime) && (
                        <small style={{ color: 'red', display: 'block', marginTop: '0.25rem' }}>
                            End time must be after start time
                        </small>
                    )}
                </div>

                <div style={{ position: 'relative' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Where?</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <input
                                type="text"
                                required
                                placeholder="Enter location..."
                                value={form.location}
                                onChange={(e) => handleLocationSearch(e.target.value)}
                                onFocus={() => {
                                    if (form.location) handleLocationSearch(form.location);
                                    setShowSuggestions(true);
                                }}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                style={{ width: '100%', paddingRight: '30px' }}
                            />
                            <MapPin size={16} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                        </div>
                    </div>

                    {showSuggestions && locationSuggestions.length > 0 && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            background: 'white',
                            borderRadius: '0.5rem',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            zIndex: 10,
                            maxHeight: '200px',
                            overflowY: 'auto',
                            marginTop: '0.5rem'
                        }}>
                            {locationSuggestions.map((item, index) => (
                                <div
                                    key={index}
                                    onClick={() => selectLocation(item)}
                                    style={{
                                        padding: '0.75rem',
                                        cursor: 'pointer',
                                        borderBottom: '1px solid #eee',
                                    }}
                                    className="hover:bg-gray-100"
                                >
                                    <span style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{item}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Map Picker */}
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Select Location on Map</label>
                    <LocationMapPicker
                        latitude={form.latitude ?? undefined}
                        longitude={form.longitude ?? undefined}
                        onLocationChange={handleLocationFromMap}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Max Participants</label>
                    <input
                        type="number"
                        required
                        min="2"
                        max="50"
                        value={form.maxParticipants}
                        onChange={(e) => setForm({ ...form, maxParticipants: parseInt(e.target.value) })}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Description</label>
                    <RichTextEditor
                        value={form.description}
                        onChange={(value) => setForm({ ...form, description: value })}
                        placeholder="Describe your event..."
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Attachments (Images/Files)</label>
                    <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx"
                        multiple
                        onChange={handleFileUpload}
                        style={{ marginBottom: '0.5rem' }}
                    />
                    {form.attachments.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                            {form.attachments.map((url, index) => (
                                <div key={index} style={{ position: 'relative' }}>
                                    {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                        <img src={url} alt="Attachment" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '0.5rem' }} />
                                    ) : (
                                        <div style={{ width: '100px', height: '100px', background: '#f0f0f0', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                                            📄 File
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => removeAttachment(index)}
                                        style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px' }}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                    {loading ? 'Creating...' : 'Create Event'}
                </button>
            </form>
        </div>
    );
}

export default function CreateEventPage() {
    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <Suspense fallback={<p>Loading...</p>}>
                <CreateEventForm />
            </Suspense>
        </div>
    );
}
