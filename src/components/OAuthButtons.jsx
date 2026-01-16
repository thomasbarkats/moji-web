import { useGoogleLogin } from '@react-oauth/google';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getDeviceInfo } from '../utils/deviceHelper';


export const OAuthButtons = ({ onSuccess, theme }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { loginWithGoogle, loginWithApple } = useAuth();

  // Google OAuth hook
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        setError(null);

        // Send access_token to backend (backend supports both id_token and access_token)
        await loginWithGoogle(tokenResponse.access_token, getDeviceInfo());
        onSuccess?.();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google login failed:', error);
      setError('Google login failed. Please try again.');
      setLoading(false);
    },
    flow: 'implicit', // Use implicit flow to get access_token directly
  });

  const handleGoogleLogin = () => {
    setLoading(true);
    setError(null);
    googleLogin();
  };

  const handleAppleLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      // Initialize Apple Sign In if not already loaded
      if (!window.AppleID) {
        throw new Error('Apple Sign In SDK not loaded. Please add the Apple JS SDK to your HTML.');
      }

      // Configure and trigger Apple Sign In
      const data = await window.AppleID.auth.signIn();

      if (data.authorization && data.authorization.id_token) {
        await loginWithApple(data.authorization.id_token, getDeviceInfo());
        onSuccess?.();
      } else {
        throw new Error('No authorization token received from Apple');
      }
    } catch (err) {
      console.error('Apple login failed:', err);
      setError(err.message || 'Apple login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme?.darkMode || theme === 'dark';
  const buttonClass = isDark
    ? 'bg-white text-gray-900 hover:bg-gray-100'
    : 'bg-gray-900 text-white hover:bg-gray-800';

  return (
    <div className="space-y-3">
      {error && (
        <div className={`p-3 text-sm rounded-lg ${theme?.feedbackError?.bg || (isDark ? 'bg-red-900/20' : 'bg-red-100')} ${theme?.feedbackError?.text || (isDark ? 'text-red-400' : 'text-red-600')}`}>
          {error}
        </div>
      )}

      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className={`w-full flex items-center justify-center gap-3 py-3 px-6 rounded-lg font-semibold transition-all cursor-pointer ${buttonClass} disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl`}
      >
        {loading ? (
          <Loader2 className="animate-spin" size={20} />
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        )}
        <span>Sign in with Google</span>
      </button>

      {/* Apple OAuth temporarily disabled - requires paid Apple Developer account ($129/year)
      <button
        onClick={handleAppleLogin}
        disabled={loading}
        className={`w-full flex items-center justify-center gap-3 py-3 px-6 rounded-lg font-semibold transition-colors cursor-pointer ${buttonClass} disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? (
          <Loader2 className="animate-spin" size={20} />
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.09l-.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
        )}
        <span>Sign in with Apple</span>
      </button>
      */}
    </div>
  );
};
