// Map utility functions for Google Maps integration

/**
 * Generate a Google Maps URL from location string or coordinates
 */
export function getGoogleMapsUrl(location: string, lat?: number | null, lng?: number | null): string {
    if (lat && lng) {
        // Use coordinates if available for precise location
        return `https://www.google.com/maps?q=${lat},${lng}`;
    }
    // Fallback to location string search
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}

/**
 * Calculate distance between two coordinate pairs using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(lat: number, lng: number): string {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

/**
 * Parse coordinates from string format "lat,lng"
 */
export function parseCoordinates(coords: string): { lat: number; lng: number } | null {
    if (!coords) return null;
    const parts = coords.split(',').map(s => parseFloat(s.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        return { lat: parts[0], lng: parts[1] };
    }
    return null;
}

/**
 * Get address from coordinates using Google Maps Geocoding API
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
    try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
            console.warn('Google Maps API key not configured');
            return null;
        }

        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
        );

        const data = await response.json();

        if (data.status === 'OK' && data.results.length > 0) {
            return data.results[0].formatted_address;
        }

        return null;
    } catch (error) {
        console.error('Reverse geocoding failed:', error);
        return null;
    }
}

/**
 * Format time range for display
 */
export function formatTimeRange(startTime: string | Date, endTime: string | Date): string {
    const start = new Date(startTime);
    const end = new Date(endTime);

    const startTimeStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endTimeStr = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Check if same day
    const sameDay = start.toDateString() === end.toDateString();

    if (sameDay) {
        return `${startTimeStr} - ${endTimeStr}`;
    } else {
        // Different days, show date too
        const startDateStr = start.toLocaleDateString([], { month: 'short', day: 'numeric' });
        const endDateStr = end.toLocaleDateString([], { month: 'short', day: 'numeric' });
        return `${startDateStr} ${startTimeStr} - ${endDateStr} ${endTimeStr}`;
    }
}

/**
 * Calculate duration in human-readable format
 */
export function formatDuration(startTime: string | Date, endTime: string | Date): string {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end.getTime() - start.getTime();

    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0 && minutes > 0) {
        return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
        return `${hours}h`;
    } else {
        return `${minutes}m`;
    }
}
