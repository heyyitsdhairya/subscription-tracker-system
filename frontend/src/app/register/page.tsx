import Link from 'next/link';
import { Mail, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 transition-colors duration-300">
      <div className="w-full max-w-md bg-card backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden text-foreground">
        <div className="p-8 text-center space-y-6">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
              <Mail className="w-10 h-10 text-emerald-500" />
            </div>
          </div>
          
          <h2 className="text-3xl font-black">Passwordless Registration</h2>
          <p className="text-muted font-medium">
            We've upgraded to a secure, passwordless authentication system. You no longer need to remember passwords!
          </p>
          
          <p className="text-sm font-medium border border-border bg-background p-4 rounded-xl shadow-inner">
            Simply enter your email on the login page. If you don't have an account, we will automatically create one for you.
          </p>

          <Link href="/login" className="inline-block w-full">
            <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 group mt-4">
              Continue to Login
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
