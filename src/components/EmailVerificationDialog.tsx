import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mail, Loader2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

const PENDING_VERIFICATION_KEY = 'pending_email_verification';

export const EmailVerificationDialog = () => {
  const { user } = useAuth();
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const isCallbackPage = location.pathname === '/auth/callback';

  const handleClose = () => {
    setIsOpen(false);
    // Optionally clear the pending email from localStorage
    // localStorage.removeItem(PENDING_VERIFICATION_KEY);
  };

  // Check for pending email verification on mount
  useEffect(() => {
    const storedEmail = localStorage.getItem(PENDING_VERIFICATION_KEY);
    if (storedEmail) {
      setPendingEmail(storedEmail);
    }
  }, []);

  // Check verification status
  useEffect(() => {
    const checkVerification = async () => {
      if (!pendingEmail) return;

      setIsChecking(true);
      try {
        // Refresh the session to get latest user data
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();

        // If there's an auth error (like invalid refresh token), that's expected for unverified users
        // We'll check via the user from AuthContext instead
        if (error) {
          // This is expected for unverified users - they don't have a valid session yet
          setIsChecking(false);
          return;
        }

        if (currentSession?.user) {
          const emailVerified = currentSession.user.email_confirmed_at !== null;
          setIsVerified(emailVerified);

          if (emailVerified) {
            // Clear the pending verification
            localStorage.removeItem(PENDING_VERIFICATION_KEY);
            setPendingEmail(null);
          }
        }
      } catch (error) {
        // Silently handle errors - they're expected for unverified users
        // The AuthContext will handle verification when the user clicks the email link
      } finally {
        setIsChecking(false);
      }
    };

    // Only check if we have a pending email
    if (pendingEmail) {
      // Check immediately and then periodically
      checkVerification();
      const interval = setInterval(checkVerification, 10000); // Check every 10 seconds (reduced frequency)

      return () => clearInterval(interval);
    }
  }, [pendingEmail]);

  // Also check when user/session changes - this is the primary way we detect verification
  useEffect(() => {
    if (user && pendingEmail && user.email === pendingEmail) {
      const verified = user.email_confirmed_at !== null;
      setIsVerified(verified);

      if (verified) {
        localStorage.removeItem(PENDING_VERIFICATION_KEY);
        setPendingEmail(null);
      }
    }
  }, [user, pendingEmail]);

  // Listen for auth state changes to detect when email is verified
  useEffect(() => {
    if (!pendingEmail) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const emailMatches = session.user.email === pendingEmail;
        const emailVerified = session.user.email_confirmed_at !== null;

        if (emailMatches && emailVerified) {
          setIsVerified(true);
          localStorage.removeItem(PENDING_VERIFICATION_KEY);
          setPendingEmail(null);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [pendingEmail]);

  const shouldShowDialog = pendingEmail !== null && !isVerified && isOpen && !isCallbackPage;

  return (
    <Dialog open={shouldShowDialog} onOpenChange={(open) => {
      if (!open) {
        handleClose();
      }
    }}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => {
          // Allow closing by clicking outside, but show a warning
          const target = e.target as HTMLElement;
          if (target.closest('[data-radix-dialog-overlay]')) {
            handleClose();
          }
        }}
        onEscapeKeyDown={(e) => {
          handleClose();
        }}
      >
        <DialogHeader>
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"
          >
            {isChecking ? (
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            ) : (
              <Mail className="h-8 w-8 text-primary" />
            )}
          </motion.div>
          <DialogTitle className="text-center text-2xl">
            Verify Your Email
          </DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            We've sent a verification link to
            <br />
            <span className="font-semibold text-foreground">{pendingEmail}</span>
            <br />
            <br />
            Please check your email and click the verification link to continue.
            <br />
            <br />
            This dialog will automatically close once your email is verified.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 pt-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {isChecking && (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Checking verification status...</span>
              </>
            )}
            {!isChecking && (
              <>
                <Mail className="h-4 w-4" />
                <span>Waiting for email verification...</span>
              </>
            )}
          </div>
          <Button
            variant="outline"
            onClick={handleClose}
            className="mt-2"
          >
            <X className="h-4 w-4 mr-2" />
            Close (I'll verify later)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

