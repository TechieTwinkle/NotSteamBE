import { useEffect, useRef } from "react";

/**
 * GoogleAuthButton
 *
 * Uses the GSI (Google Identity Services) script already loaded in index.html.
 * Fixes the race condition where window.google wasn't ready yet when the
 * component mounted — now polls until the SDK is available.
 *
 * Props:
 *   onCredentialResponse(googleToken: string) — called with the raw ID token.
 *   The parent (LoginPage / SignupPage) posts it to POST /api/auth/google.
 */
const GoogleAuthButton = ({ onCredentialResponse }) => {
  const buttonRef = useRef(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;

    let cancelled = false;

    const initGoogle = () => {
      if (cancelled || !buttonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: ({ credential }) => onCredentialResponse?.(credential),
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        width: buttonRef.current.offsetWidth || 400,
        text: "continue_with",
      });
    };

    // If the GSI script is already loaded, initialize immediately.
    // Otherwise poll every 100 ms until window.google appears (async defer).
    if (window.google?.accounts?.id) {
      initGoogle();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          initGoogle();
        }
      }, 100);

      return () => {
        cancelled = true;
        clearInterval(interval);
      };
    }

    return () => {
      cancelled = true;
    };
  }, [clientId, onCredentialResponse]);

  if (!clientId) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
        Or continue with
      </p>
      <div
        ref={buttonRef}
        className="min-h-10 overflow-hidden rounded-lg bg-zinc-100"
      />
    </div>
  );
};

export default GoogleAuthButton;