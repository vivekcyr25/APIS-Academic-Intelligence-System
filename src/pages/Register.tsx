import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button.tsx';
import { Input } from '../components/ui/Input.tsx';
import { Card } from '../components/ui/Card.tsx';
import { ArrowRight, UserPlus, Mail, Lock, User, Hash } from 'lucide-react';

// Google SVG icon
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const Register = () => {
  const { loginWithGoogle, registerWithEmail } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    regNo: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      await loginWithGoogle(); // popup flow
      navigate('/dashboard');
    } catch (err: any) {
      const technicalMsg = err.code ? ` (${err.code})` : '';
      setError(`${err.message}${technicalMsg}` || 'Google Sign-In failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  // No-op for compatibility with popup flow
  useEffect(() => {}, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Security keys do not match.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await registerWithEmail(
        formData.name,
        formData.regNo,
        formData.email,
        formData.password
      );
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Identity initialization failed. Registration error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-6 bg-background overflow-hidden py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[500px] relative z-10"
      >
        <Card className="p-10 border-white/10 shadow-[0_0_50px_rgba(139,92,246,0.15)] bg-card/80 backdrop-blur-xl">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(139,92,246,0.4)] neural-glow">
              <UserPlus className="text-white w-10 h-10" />
            </div>
            <h1 className="text-4xl font-black font-heading tracking-tight mb-2">Initialize Profile</h1>
            <p className="text-muted-foreground font-medium">Create your academic intelligence identity</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                name="name"
                label="Full Name"
                placeholder="John Doe"
                icon={<User className="w-5 h-5" />}
                value={formData.name}
                onChange={handleChange}
                required
              />
              <Input
                name="regNo"
                label="Registration No"
                placeholder="1221XXXX"
                icon={<Hash className="w-5 h-5" />}
                value={formData.regNo}
                onChange={handleChange}
                required
              />
            </div>

            <Input
              name="email"
              label="Academic Email"
              type="email"
              placeholder="name@university.edu"
              icon={<Mail className="w-5 h-5" />}
              value={formData.email}
              onChange={handleChange}
              required
            />
            
            <Input
              name="password"
              label="Security Password"
              type="password"
              placeholder="••••••••"
              icon={<Lock className="w-5 h-5" />}
              value={formData.password}
              onChange={handleChange}
              required
            />

            <Input
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              icon={<Lock className="w-5 h-5" />}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              error={error}
            />

            <Button
              type="submit"
              className="w-full h-14 text-lg mt-4"
              isLoading={loading}
            >
              Explore the Creator Portfolio <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          {/* Google Sign-In */}
          <motion.button
            whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.07)' }}
            whileTap={{ scale: 0.99 }}
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/4 backdrop-blur-sm text-sm font-bold transition-all duration-200 hover:border-white/20 py-3.5 disabled:opacity-60"
          >
            {googleLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            <span>Continue with Google</span>
          </motion.button>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-sm text-muted-foreground">
              Existing academic identity?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline underline-offset-4">
                Access Platform
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Register;
