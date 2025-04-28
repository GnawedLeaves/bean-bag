// src/hooks/useLocation.ts
import { useState, useEffect } from 'react';
import { LocationData, getCurrentLocation } from '../services/location';


interface UseLocationResult {
    location: LocationData | null;
    loading: boolean;
    error: Error | null;
}
export const useLocationHook = (): UseLocationResult => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const data = await getCurrentLocation();
        setLocation(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to get location'));
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, []);

  return { location, loading, error } 
};