import React, { useState } from 'react';
import { 
  X, Mail, Lock, User, ShieldCheck, Sparkles, 
  ArrowRight, AlertCircle, CheckCircle2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  initialMode?: 'signin' | 'signup' | 'admin';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  isDark,
  initialMode = 'signin'
}) => {
  const { loginWithGoogle, loginWithEmail, signupWithEmail } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup' | 'admin'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google Sign-In failed. Please try again or use direct login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      if (mode === 'admin') {
        // Distinct Admin Verification
        if (email.trim().toLowerCase() !== 'sobratdayal2008@gmail.com' && !email.toLowerCase().includes('admin')) {
          throw new Error('Access Restricted: This email is not authorized for the SaaS Admin Console. Please use the designated administrator email.');
        }
        await loginWithEmail(email, password);
        setSuccessMsg('Admin credentials authorized. Accessing SaaS Admin Panel...');
        setTimeout(() => onClose(), 800);
      } else if (mode === 'signup') {
        if (!displayName.trim()) throw new Error('Please provide your name.');
        await signupWithEmail(email, password, displayName);
        setSuccessMsg('Account created successfully!');
        setTimeout(() => onClose(), 800);
      } else {
        await loginWithEmail(email, password);
        setSuccessMsg('Signed in successfully!');
        setTimeout(() => onClose(), 800);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`w-full max-w-md rounded-3xl border flex flex-col overflow-hidden shadow-2xl animate-fade-in ${
        isDark ? 'bg-[#1E1F20] border-[#28292A] text-white' : 'bg-white border-[#E8EAED] text-[#1F1F1F]'
      }`}>
        {/* Header */}
        <div className="p-5 border-b border-inherit flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white ${
              mode === 'admin' 
                ? 'bg-gradient-to-tr from-amber-500 to-rose-600' 
                : 'bg-gradient-to-tr from-blue-500 to-indigo-600'
            }`}>
              {mode === 'admin' ? <ShieldCheck className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-semibold text-sm">
                {mode === 'admin' ? 'SaaS Admin Authentication' : mode === 'signup' ? 'Create Research Account' : 'Sign in to Gemini Notebook'}
              </h3>
              <p className="text-[11px] text-stone-400">
                {mode === 'admin' ? 'Requires distinct administrator privileges' : 'Sync notes, citations, and slide decks across devices'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className={`flex border-b text-xs font-semibold px-5 ${
          isDark ? 'border-[#28292A] bg-[#18191A]' : 'border-[#E8EAED] bg-[#F8F9FA]'
        }`}>
          <button
            type="button"
            onClick={() => { setMode('signin'); setError(null); }}
            className={`py-3 px-3 border-b-2 transition-colors ${
              mode === 'signin'
                ? isDark ? 'border-blue-400 text-blue-400' : 'border-blue-600 text-blue-600'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(null); }}
            className={`py-3 px-3 border-b-2 transition-colors ${
              mode === 'signup'
                ? isDark ? 'border-blue-400 text-blue-400' : 'border-blue-600 text-blue-600'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => { setMode('admin'); setError(null); setEmail('sobratdayal2008@gmail.com'); }}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1 ${
              mode === 'admin'
                ? isDark ? 'border-amber-400 text-amber-400' : 'border-amber-600 text-amber-600'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Portal</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode !== 'admin' && (
            <>
              {/* Google SSO Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
                className={`w-full py-2.5 px-4 rounded-xl font-medium text-xs flex items-center justify-center gap-2.5 border transition-all cursor-pointer shadow-sm ${
                  isDark 
                    ? 'bg-[#18191A] border-[#3C4043] hover:bg-[#28292A] text-white' 
                    : 'bg-white border-[#DADCE0] hover:bg-stone-50 text-stone-800'
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="flex items-center gap-3 text-stone-500 text-[10px] uppercase font-bold tracking-wider">
                <div className="flex-1 h-px bg-inherit border-b border-inherit" />
                <span>Or with email</span>
                <div className="flex-1 h-px bg-inherit border-b border-inherit" />
              </div>
            </>
          )}

          {mode === 'admin' && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs leading-relaxed">
              <span className="font-bold block mb-1">Administrative Mail Requirement</span>
              To access the SaaS User Management Admin Panel, you must authenticate using your designated admin email (<span className="underline font-mono">sobratdayal2008@gmail.com</span>).
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Jane Doe"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border outline-none ${
                      isDark ? 'bg-[#18191A] border-[#3C4043] text-white' : 'bg-stone-50 border-[#DADCE0]'
                    }`}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                {mode === 'admin' ? 'Designated Admin Email' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="email"
                  required
                  placeholder="name@institution.edu"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border outline-none ${
                    isDark ? 'bg-[#18191A] border-[#3C4043] text-white' : 'bg-stone-50 border-[#DADCE0]'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border outline-none ${
                    isDark ? 'bg-[#18191A] border-[#3C4043] text-white' : 'bg-stone-50 border-[#DADCE0]'
                  }`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                mode === 'admin'
                  ? 'bg-amber-600 hover:bg-amber-500'
                  : 'bg-blue-600 hover:bg-blue-500'
              } disabled:opacity-50`}
            >
              <span>{isSubmitting ? 'Authenticating...' : mode === 'admin' ? 'Verify Admin Credentials' : mode === 'signup' ? 'Create Account' : 'Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
