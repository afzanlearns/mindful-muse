import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

/**
 * Handles authentication callbacks from Supabase email verification links.
 * When Supabase redirects with hash fragments (#access_token=...), this component
 * processes them and redirects the user appropriately.
 */
export const AuthHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Check if there are hash fragments in the URL (from email verification)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const error = hashParams.get('error');
      const errorDescription = hashParams.get('error_description');

      // If there's an error in the URL, show it and redirect to login
      if (error) {
        console.error('Auth error:', error, errorDescription);
        // Clean up the URL
        window.history.replaceState({}, document.title, '/');
        navigate('/login?error=verification_failed');
        return;
      }

      // If there's an access token, Supabase should have already processed it
      // via detectSessionInUrl. We just need to clean up the URL and redirect.
      if (accessToken) {
        try {
          // Wait a moment for Supabase to process the session
          await new Promise(resolve => setTimeout(resolve, 500));

          // Get the current session
          const { data: { session } } = await supabase.auth.getSession();

          if (session) {
            // Clear pending verification
            localStorage.removeItem('pending_email_verification');

            // Clean up the URL hash
            window.history.replaceState({}, document.title, '/');

            // Redirect to home page
            navigate('/', { replace: true });
          } else {
            // No session found, redirect to login
            window.history.replaceState({}, document.title, '/');
            navigate('/login');
          }
        } catch (err) {
          console.error('Error processing auth callback:', err);
          window.history.replaceState({}, document.title, '/');
          navigate('/login?error=verification_failed');
        }
      }
    };

    // DISABLE GLOBAL HANDLER: This conflicts with the specific /auth/callback route.
    // We want the AuthCallback page to handle the verification flow exclusively.

    // if (location.pathname === '/' && window.location.hash.includes('access_token')) {
    //   handleAuthCallback();
    // }
  }, [location, navigate, user]);

  return null; // This component doesn't render anything
};

