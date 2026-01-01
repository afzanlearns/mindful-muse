import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Supabase automatically handles the hash fragments in the URL
        // We just need to get the session which will be set automatically
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          navigate('/login?error=verification_failed');
          return;
        }

        if (data.session) {
          // User is now verified and signed in
          // Clear any pending verification
          localStorage.removeItem('pending_email_verification');
          navigate('/');
        } else {
          // Wait a bit for the session to be processed from URL hash
          setTimeout(async () => {
            const { data: retryData } = await supabase.auth.getSession();
            if (retryData.session) {
              localStorage.removeItem('pending_email_verification');
              navigate('/');
            } else {
              navigate('/login');
            }
          }, 1000);
        }
      } catch (error) {
        console.error('Error handling auth callback:', error);
        navigate('/login?error=verification_failed');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <h2 className="font-serif text-xl text-foreground mb-2">
          Verifying your email...
        </h2>
        <p className="text-muted-foreground">
          Please wait while we verify your email address.
        </p>
      </motion.div>
    </div>
  );
}

