'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { 
  Mail, 
  CheckCircle2, 
  ArrowRight, 
  AlertCircle, 
  ShieldCheck,
  Loader2
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/send-otp', { email });
      setStep('otp');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Failed to send OTP. Please check the email.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/verify-otp', { email, otp });
      login(data.token, data);
      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 transition-colors duration-300">
      <div className="w-full max-w-md space-y-8 animate-in text-foreground">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/10 text-blue-500 rounded-2xl mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">MySubscriptions</h1>
          <p className="text-muted font-medium">Track. Manage. Save.</p>
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 text-red-500 rounded-2xl flex items-center gap-3 text-sm font-medium border border-red-500/20">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {step === 'otp' && (
            <div className="mb-6 p-4 bg-muted/10 text-muted rounded-2xl border border-border animate-in text-center">
              <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-80">Verification Required</p>
              <p className="text-sm font-medium">Please enter the 6-digit code sent to your email.</p>
            </div>
          )}

          {step === 'email' ? (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-background border border-border rounded-2xl py-4 pl-12 pr-4 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-foreground dark:bg-white text-background dark:text-slate-900 hover:opacity-90 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue'}
                {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted uppercase tracking-widest ml-1">Enter OTP</label>
                <div className="relative">
                  <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full bg-background border border-border rounded-2xl py-4 pl-12 pr-4 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold tracking-[0.5em] text-center"
                    placeholder="000000"
                  />
                </div>
                <p className="text-[10px] text-muted text-center mt-2">OTP sent to {email}</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/10 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>
              
              <button 
                type="button"
                onClick={() => setStep('email')}
                className="w-full text-muted text-sm font-bold hover:text-foreground transition-colors"
                disabled={loading}
              >
                Change Email
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-muted text-xs font-medium">
          Secure, passwordless, and privacy-focused.
        </p>
      </div>
    </div>
  );
}
