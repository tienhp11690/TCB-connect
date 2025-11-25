'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import RichTextEditor from '@/components/RichTextEditor';
import dynamic from 'next/dynamic';

const LocationMapPicker = dynamic(() => import('@/components/LocationMapPicker'), {
    ssr: false,
    loading: () => <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '0.5rem', minHeight: '300px' }}>Loading map...</div>
});

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
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

    useEffect(() => {
        fetchEvent();
    }, [id]);

    const fetchEvent = async () => {
        const res = await fetch(`/api/events/${id}`);
        const data = await res.json();
        if (!data.error) {
            const attachments = data.attachments ? JSON.parse(data.attachments) : [];
            setForm({
                startTime: new Date(data.startTime).toISOString().slice(0, 16),
                endTime: new Date(data.endTime).toISOString().slice(0, 16),
                location: data.location,
                latitude: data.latitude ?? null,
                longitude: data.longitude ?? null,
                maxParticipants: data.maxParticipants,
                description: data.description || '',
                attachments: attachments,
            });
        }
        setLoading(false);
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
        setSaving(true);

        const res = await fetch(`/api/events/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        });

        if (res.ok) {
            router.push(`/events/view/${id}`);
        } else {
            alert('Failed to update event');
        }
        setSaving(false);
    };

    if (loading) return <div className="container"><p>Loading...</p></div>;

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <div className="glass card" style={{ width: '100%', maxWidth: '600px' }}>
                <Link href={`/events/view/${id}`} style={{ marginBottom: '1rem', display: 'inline-block', color: '#666' }}>&larr; Cancel</Link>
                <h1 style={{ marginBottom: '1.5rem' }}>Edit Event</h1>

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
                                    endTime: form.endTime && new Date(form.endTime) > new Date(startTime)
                                        ? form.endTime
                                        : new Date(new Date(startTime).getTime() + 60 * 60 * 1000).toISOString().slice(0, 16)
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

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Where?</label>
                        <input
                            type="text"
                            required
                            value={form.location}
                            onChange={(e) => setForm({ ...form, location: e.target.value })}
                            style={{ width: '100%' }}
                        />
                    </div>

                    {/* Map Picker */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Select Location on Map</label>
                        <LocationMapPicker
                            latitude={form.latitude ?? undefined}
                            longitude={form.longitude ?? undefined}
                            onLocationChange={(lat, lng, address) => {
                                setForm({
                                    ...form,
                                    latitude: lat,
                                    longitude: lng,
                                    location: address || form.location
                                });
                            }}
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

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
}
