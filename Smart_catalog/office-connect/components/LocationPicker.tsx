'use client';

import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icon issue moved to component


interface LocationPickerProps {
    label: string;
    initialAddress?: string;
    initialCoordinates?: string;
    onLocationSelect: (address: string, coordinates: string) => void;
}

function LocationMarker({ position, setPosition }: { position: L.LatLng | null, setPosition: (pos: L.LatLng) => void }) {
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });

    useEffect(() => {
        if (position) {
            map.flyTo(position, map.getZoom());
        }
    }, [position, map]);

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
}

function MapResizer({ isFullScreen }: { isFullScreen: boolean }) {
    const map = useMapEvents({});
    useEffect(() => {
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 100);
        return () => clearTimeout(timer);
    }, [isFullScreen, map]);
    return null;
}

export default function LocationPicker({ label, initialAddress = '', initialCoordinates, onLocationSelect }: LocationPickerProps) {
    const [address, setAddress] = useState(initialAddress);
    const [position, setPosition] = useState<L.LatLng | null>(null);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);

    useEffect(() => {
        // Fix Leaflet icon issue
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
    }, []);

    useEffect(() => {
        if (initialCoordinates) {
            const [lat, lng] = initialCoordinates.split(',').map(Number);
            if (!isNaN(lat) && !isNaN(lng)) {
                setPosition(new L.LatLng(lat, lng));
            }
        }
    }, [initialCoordinates]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (address && address.length >= 3) {
                performSearch(address);
            } else {
                setSearchResults([]);
            }
        }, 1000);

        return () => clearTimeout(delayDebounceFn);
    }, [address]);

    const performSearch = async (query: string) => {
        setIsSearching(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`);
            if (!res.ok) throw new Error('Network response was not ok');
            const data = await res.json();
            setSearchResults(data);
        } catch (error) {
            console.error("Search failed", error);
        }
        setIsSearching(false);
    };

    const handleSearch = (query: string) => {
        setAddress(query);
    };

    const selectResult = (result: any) => {
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);
        const newPos = new L.LatLng(lat, lon);
        setPosition(newPos);
        setAddress(result.display_name);
        setSearchResults([]);
        onLocationSelect(result.display_name, `${lat},${lon}`);
    };

    const handleMapClick = async (pos: L.LatLng) => {
        setPosition(pos);
        // Reverse geocode
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.lat}&lon=${pos.lng}`);
            const data = await res.json();
            if (data.display_name) {
                setAddress(data.display_name);
                onLocationSelect(data.display_name, `${pos.lat},${pos.lng}`);
            }
        } catch (error) {
            console.error("Reverse geocode failed", error);
            onLocationSelect(`${pos.lat}, ${pos.lng}`, `${pos.lat},${pos.lng}`);
        }
    };

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    const mapContainerStyle = isFullScreen ? {
        position: 'fixed' as 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        background: 'white',
    } : {
        height: '300px',
        width: '100%',
        border: '1px solid #ccc',
        borderRadius: '0.5rem',
        overflow: 'hidden',
        position: 'relative' as 'relative',
    };

    return (
        <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>{label}</label>

            <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
                <input
                    type="text"
                    value={address}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search address..."
                    style={{ width: '100%', padding: '0.5rem' }}
                />
                {searchResults.length > 0 && (
                    <div style={{
                        position: 'absolute', top: '100%', left: 0, right: 0,
                        background: 'white', border: '1px solid #ccc', zIndex: 1000,
                        maxHeight: '200px', overflowY: 'auto'
                    }}>
                        {searchResults.map((result, idx) => (
                            <div
                                key={idx}
                                onClick={() => selectResult(result)}
                                style={{ padding: '0.5rem', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                                className="hover:bg-gray-100"
                            >
                                {result.display_name}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div style={mapContainerStyle}>
                <MapContainer center={position || [21.0285, 105.8542]} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker position={position} setPosition={handleMapClick} />
                    <MapResizer isFullScreen={isFullScreen} />
                </MapContainer>

                <button
                    onClick={toggleFullScreen}
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        zIndex: 10000,
                        padding: '0.5rem 1rem',
                        background: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '0.25rem',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                    }}
                >
                    {isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
                </button>
            </div>
        </div>
    );
}
