import { useEffect, useRef, useState } from 'react';

const MapPicker = ({ value, onChange, height = 280 }) => {

    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markerRef = useRef(null);


    const [leafletReady, setLeafletReady] = useState(!!window.L);

    useEffect(() => {
        if (!window.L) {
            // Inject Stylesheet
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);

            // Inject Script
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = () => setLeafletReady(true);
            document.head.appendChild(script);
        }
    }, []);

    // === Effect 2: Initialize Map ===
   
    useEffect(() => {
        if (!leafletReady || !mapRef.current || mapInstance.current) return;

        const L = window.L;
        
        // Default center (Kathmandu) or the provided value
        const defaultCenter = [27.7172, 85.3240];
        const initialCenter = value ? [value.lat, value.lng] : defaultCenter;

        // Create the map instance
        const map = L.map(mapRef.current).setView(initialCenter, 13);
        mapInstance.current = map;

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

      
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        // Add initial marker if a value was passed in
        if (value) {
            markerRef.current = L.marker([value.lat, value.lng]).addTo(map);
        }

        // Handle Map Clicks (Drop/Move Pin)
        map.on('click', (e) => {
            const { lat, lng } = e.latlng;
            
            // Move existing marker or create a new one
            if (markerRef.current) {
                markerRef.current.setLatLng([lat, lng]);
            } else {
                markerRef.current = L.marker([lat, lng]).addTo(map);
            }

            
            if (onChange) onChange({ lat, lng });
        });

        return () => { 
            map.remove(); 
            mapInstance.current = null; 
            markerRef.current = null; 
        };
    }, [leafletReady, value, onChange]);

    // === Geolocation Handler ===
    // Finds the user's current device location and pins it
    const handleLocateMe = () => {
        if (!navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition((pos) => {
            const { latitude: lat, longitude: lng } = pos.coords;
            const L = window.L;
            const map = mapInstance.current;

            if (!map || !L) return;

            // Pan map to user location
            map.setView([lat, lng], 15);

            // Move or place marker
            if (markerRef.current) {
                markerRef.current.setLatLng([lat, lng]);
            } else {
                markerRef.current = L.marker([lat, lng]).addTo(map);
            }

            // Pass coordinates back to parent component
            if (onChange) onChange({ lat, lng });
        });
    };

    return (
        <div>
            {/* Map Container */}
            <div style={{ position: 'relative' }}>
                <div 
                    ref={mapRef} 
                    style={{ 
                        height, 
                        borderRadius: 8, 
                        border: '1px solid #e5e7eb', 
                        overflow: 'hidden', 
                        background: '#f3f4f6' 
                    }} 
                />

                {/* Loading Overlay */}
                {!leafletReady && (
                    <div style={{ 
                        position: 'absolute', 
                        inset: 0, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        background: '#f3f4f6', 
                        borderRadius: 8, 
                        fontSize: 14, 
                        color: '#6b7280' 
                    }}>
                        Loading map...
                    </div>
                )}
            </div>

            {/* Controls Below Map */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginTop: 8 
            }}>
                <button 
                    type="button" 
                    onClick={handleLocateMe} 
                    style={{ 
                        fontSize: 13, 
                        padding: '6px 12px', 
                        border: '1px solid #d1d5db', 
                        borderRadius: 6, 
                        background: 'white', 
                        cursor: 'pointer', 
                        color: '#374151' 
                    }}
                >
                    📍 Use my location
                </button>

                {/* Show Coordinates if pinned */}
                {value && (
                    <span style={{ fontSize: 12, color: '#6b7280' }}>
                        {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
                    </span>
                )}
            </div>

            {/* Helper Text if no pin dropped yet */}
            {!value && (
                <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>
                    Click on the map to pin the job location
                </p>
            )}
        </div>
    );
};

export default MapPicker;