'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet'; // Import Leaflet itself for icon customization
import { MapPin } from 'lucide-react';

// Fix for default marker icon issue with Webpack/React-Leaflet
// This is a common workaround to ensure Leaflet's default icons load correctly
// @ts-ignore - Leaflet icon workaround
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface LocationMapPickerProps {
    latitude?: number;
    longitude?: number;
    onLocationChange: (lat: number, lng: number, address?: string) => void;
    height?: string;
}

const defaultCenter = {
    lat: 21.0285, // Hanoi, Vietnam
    lng: 105.8542,
};

export default function LocationMapPicker({
    latitude,
    longitude,
    onLocationChange,
    height = '400px',
}: LocationMapPickerProps) {
    const [markerPosition, setMarkerPosition] = useState(
        latitude && longitude ? { lat: latitude, lng: longitude } : defaultCenter
    );
    const markerRef = useRef<L.Marker | null>(null);

    useEffect(() => {
        if (latitude && longitude) {
            const newPos = { lat: latitude, lng: longitude };
            setMarkerPosition(newPos);
            // Optionally, pan the map to the new position if it's different
            // This would require access to the map instance, typically via useMap() in a child component
        }
    }, [latitude, longitude]);

    const reverseGeocode = async (lat: number, lng: number) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();
            if (data && data.display_name) {
                onLocationChange(lat, lng, data.display_name);
            } else {
                onLocationChange(lat, lng);
            }
        } catch (error) {
            console.error('Error during reverse geocoding:', error);
            onLocationChange(lat, lng); // Call with just lat/lng on error
        }
    };

    const MapEventsComponent = () => {
        useMapEvents({
            click: (e) => {
                const { lat, lng } = e.latlng;
                setMarkerPosition({ lat, lng });
                reverseGeocode(lat, lng);
            },
        });
        return null;
    };

    const handleMarkerDragEnd = () => {
        const marker = markerRef.current;
        if (marker != null) {
            const { lat, lng } = marker.getLatLng();
            setMarkerPosition({ lat, lng });
            reverseGeocode(lat, lng);
        }
    };

    return (
        <div style={{ width: '100%' }}>
            <MapContainer
                center={markerPosition}
                zoom={15}
                scrollWheelZoom={true}
                style={{ height, width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapEventsComponent />
                <Marker
                    position={markerPosition}
                    draggable={true}
                    eventHandlers={{ dragend: handleMarkerDragEnd }}
                    ref={markerRef}
                />
            </MapContainer>
            <div
                style={{
                    marginTop: '0.5rem',
                    fontSize: '0.85rem',
                    color: '#666',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                }}
            >
                <MapPin size={14} />
                <span>
                    Click on the map or drag the marker to select a precise location
                    {markerPosition && (
                        <span style={{ marginLeft: '0.5rem', fontFamily: 'monospace' }}>
                            ({markerPosition.lat.toFixed(6)}, {markerPosition.lng.toFixed(6)})
                        </span>
                    )}
                </span>
            </div>
        </div>
    );
}
