import { useState, useEffect } from 'react';

interface LocationState {
  locationName: string;
  city: string;
  lat: number | null;
  lon: number | null;
  loading: boolean;
  error: string | null;
}

export const useLocation = () => {
  const [state, setState] = useState<LocationState>({
    locationName: 'Detecting location...',
    city: 'Hyderabad', // Default fallback
    lat: null,
    lon: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchLocation = async () => {
      // Check localStorage first
      const cachedData = localStorage.getItem('userLocationData');
      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          setState({
            locationName: parsed.locationName,
            city: parsed.city || 'Hyderabad',
            lat: parsed.lat || null,
            lon: parsed.lon || null,
            loading: false,
            error: null,
          });
          return;
        } catch (e) {
          console.error("Failed to parse cached location data", e);
        }
      }

      if (!navigator.geolocation) {
        setState({
          locationName: 'Andhra Pradesh, India', // Fallback
          city: 'Hyderabad',
          lat: 17.385,
          lon: 78.4867,
          loading: false,
          error: 'Geolocation is not supported by your browser',
        });
        return;
      }

      const success = async (position: GeolocationPosition) => {
        const { latitude, longitude } = position.coords;
        try {
          // Using OpenStreetMap (Nominatim) for reverse geocoding
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
            {
              headers: {
                'Accept-Language': 'en-US,en;q=0.9',
              }
            }
          );
          
          if (!response.ok) {
            throw new Error('Failed to fetch location data');
          }

          const data = await response.json();
          
          const address = data.address || {};
          const city = address.city || address.town || address.village || address.state_district || '';
          const stateName = address.state || '';
          const country = address.country || '';
          
          // Formulate display string
          const components = [city, stateName, country].filter(Boolean);
          // Remove duplicates (sometimes city and state_district are the same)
          const uniqueComponents = Array.from(new Set(components));
          
          const formattedLocation = uniqueComponents.length > 0 ? uniqueComponents.join(', ') : 'Andhra Pradesh, India';
          const detectedCity = city || 'Hyderabad';

          const locationData = {
            locationName: formattedLocation,
            city: detectedCity,
            lat: latitude,
            lon: longitude,
          };
          localStorage.setItem('userLocationData', JSON.stringify(locationData));
          
          setState({
            locationName: formattedLocation,
            city: detectedCity,
            lat: latitude,
            lon: longitude,
            loading: false,
            error: null,
          });
        } catch (error) {
          console.error('Error reverse geocoding:', error);
          setState({
            locationName: 'Andhra Pradesh, India', // Fallback
            city: 'Hyderabad',
            lat: latitude,
            lon: longitude,
            loading: false,
            error: 'Failed to reverse geocode',
          });
        }
      };

      const error = (err: GeolocationPositionError) => {
        console.warn(`Geolocation ERROR(${err.code}): ${err.message}`);
        setState({
          locationName: 'Andhra Pradesh, India', // Fallback
          city: 'Hyderabad',
          lat: null,
          lon: null,
          loading: false,
          error: err.message,
        });
      };

      navigator.geolocation.getCurrentPosition(success, error, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });
    };

    fetchLocation();
  }, []);

  return state;
};
