import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const useSessionExpiry = (refreshThreshold = 300000) => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSessionExpiry = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error fetching session:', error.message);
        return;
      }

      if (!session) {
        navigate('/login');
        return;
      }

      const expiresAt = new Date(session.expires_at * 1000);
      const now = new Date();
      const timeLeft = expiresAt - now;

      if (timeLeft <= refreshThreshold) {
        try {
          const { error: refreshError } = await supabase.auth.refreshSession();

          if (refreshError) {
            console.error('Error refreshing session:', refreshError.message);
            navigate('/login');
          }
        } catch (err) {
          console.error('Unexpected error during refresh:', err);
          navigate('/login');
        }
      }
    };

    const interval = setInterval(checkSessionExpiry, 60000);

    return () => clearInterval(interval);
  }, [navigate, refreshThreshold]);
};

export default useSessionExpiry;