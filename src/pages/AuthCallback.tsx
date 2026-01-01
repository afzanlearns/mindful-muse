import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [verificationState, setVerificationState] = useState<'verifying' | 'success' | 'error'>('verifying');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Supabase automatically handles the hash fragments in the URL
        // We just need to check the session
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
          setVerificationState('error');
          return;
        }

        if (data.session) {
          // User is now verified and signed in
          localStorage.removeItem('pending_email_verification');
          setVerificationState('success');
        } else {
          // Wait a bit for the session to be processed from URL hash
          setTimeout(async () => {
            const { data: retryData } = await supabase.auth.getSession();
            if (retryData.session) {
              localStorage.removeItem('pending_email_verification');
              setVerificationState('success');
            } else {
              setVerificationState('error');
            }
          }, 2000);
        }
      } catch (error) {
        console.error('Error handling auth callback:', error);
        setVerificationState('error');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md w-full p-8 bg-card rounded-xl shadow-lg border border-border"
      >
        {verificationState === 'verifying' && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-6" />
            <h2 className="font-serif text-2xl text-foreground mb-3">
              Verifying your email...
            </h2>
            <p className="text-muted-foreground">
              Please wait while we confirm your email address.
            </p>
          </>
        )}

        {verificationState === 'success' && (
          <>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="font-serif text-2xl text-foreground mb-3">
              Email Verified!
            </h2>
            <p className="text-muted-foreground mb-8">
              Your email has been successfully verified. You can now access your account.
            </p>
            <Button
              onClick={() => navigate('/')}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Continue to App
            </Button>
          </>
        )}

        {verificationState === 'error' && (
          <>
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="font-serif text-2xl text-foreground mb-3">
              Verification Failed
            </h2>
            <p className="text-muted-foreground mb-8">
              We couldn't verify your email. The link may be invalid or expired.
            </p>
            <Button
              onClick={() => navigate('/login')}
              variant="outline"
              className="w-full"
            >
              Back to Login
            </Button>
          </>
        )}
      </motion.div>
    </div>
  );
}

