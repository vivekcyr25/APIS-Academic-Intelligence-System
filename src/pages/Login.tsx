import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { loginUser } from '../services/auth/authService.ts';
import { Button } from '../components/ui/Button.tsx';
import { Input } from '../components/ui/Input.tsx';
import { Card } from '../components/ui/Card.tsx';
import { AuthSuccessTransition } from '../components/auth/AuthSuccessTransition.tsx';
import { ArrowRight, ShieldCheck, Mail, Lock } from 'lucide-react';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const Login = () => {
  const navigate = useNavigate();
  const { user, loading, loginWithGoogle } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleAuthSuccess = useCallback(() => {
    setShowSuccess(true);
    setTimeout(() => {
      navigate('/dashboard');
    }, 2200); // Cinematic duration
  }, [navigate]);

  // ── HYDRATION & SUCCESS REDIRECT ──────────────────────────────────────────
  useEffect(() => {
    if (!loading && user && !showSuccess) {
      // For returning users (auto-login), redirect immediately or show brief transition
      // To meet "Premium" requirement, we'll trigger the transition
      handleAuthSuccess();
    }
  }, [handleAuthSuccess, loading, showSuccess, user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEmailLoading(true);
    setError('');
    try {
      await loginUser(email, password);
      // Redirect logic handled by useEffect + handleAuthSuccess
    } catch (err: any) {
      setError(err.message || 'Verification failed.');
      setIsEmailLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isGoogleLoading) return;
    setIsGoogleLoading(true);
    setError('');
    try {
      await loginWithGoogle();
      // AuthProvider handles state, useEffect triggers transition
    } catch (err: any) {
      setError(err.message || 'Google authentication failed.');
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-6 bg-background overflow-hidden">
      <AnimatePresence>
        {showSuccess && <AuthSuccessTransition key="success-overlay" />}
      </AnimatePresence>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-[440px] relative z-10"
      >
        <Card className="p-10 border-white/10 shadow-2xl">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center mb-6 shadow-xl neural-glow text-white">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h1 className="text-4xl font-black tracking-tight mb-2">Academic Intel</h1>
            <p className="text-muted-foreground font-medium">Initialize your intelligence session</p>
          </div>

          <div className="flex flex-col gap-4 mb-6">
            <Button
              variant="outline"
              onClick={handleGoogleSignIn}
              isLoading={isGoogleLoading}
              className="w-full h-14 rounded-2xl gap-3 font-bold bg-white/5 border-white/10 hover:bg-white/10"
            >
              {!isGoogleLoading && <GoogleIcon />}
              Continue with Google
            </Button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <Input
              label="Academic Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@university.edu"
              icon={<Mail className="w-5 h-5" />}
              required
            />
            <Input
              label="Security Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={<Lock className="w-5 h-5" />}
              required
              error={error}
            />

            <Button type="submit" className="w-full h-14 text-lg" isLoading={isEmailLoading}>
              Verify Identity <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground font-medium">
              New academic identity? <Link to="/register" className="text-primary font-black hover:underline">Create Account</Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
