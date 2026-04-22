import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function Auth() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) throw error;
      } else {
        const { error } = await signUp(email, password, displayName);
        if (error) throw error;
        toast.success('Check your email to confirm your account ✉️');
      }
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <span className="text-5xl block mb-2">🌸</span>
          <h1 className="text-4xl text-foreground tracking-tight">
            GradeFlow
          </h1>
          <p className="text-xs text-muted-foreground italic mt-1">
            your grades, beautifully ✨
          </p>
        </div>

        <div className="rounded-3xl bg-card p-6 card-cute">
          <div className="flex mb-6 rounded-2xl bg-secondary/60 p-1">
            {(['login', 'signup'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`relative flex-1 py-2.5 text-xs font-medium rounded-xl transition-all duration-300 ${
                  mode === m
                    ? 'bg-card text-foreground card-cute'
                    : 'text-muted-foreground hover:text-foreground/70'
                }`}
              >
                {m === 'login' ? '✦ Sign in' : '✦ Sign up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <input
                    type="text"
                    placeholder="Your name 💫"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    className="w-full rounded-2xl border-0 bg-secondary/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
                    required
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-2xl border-0 bg-secondary/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-2xl border-0 bg-secondary/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
              required
              minLength={6}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? '...' : mode === 'login' ? 'Sign in →' : 'Create account →'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
