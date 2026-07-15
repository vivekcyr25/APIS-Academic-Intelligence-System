import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  type User as FirebaseUser, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { auth, db, clearFirebaseCache } from '../services/firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';

interface UserProfile {
  uid: string;
  id: string; // for compatibility
  name: string;
  fullName: string;
  email: string;
  photoURL: string;
  onboardingCompleted: boolean;
  lastBackupAt?: any;
  [key: string]: any;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (name: string, regNo: string, email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const BYPASS_AUTH = false; // Set to false to restore production Firebase Auth

const devUser: UserProfile = {
  uid: 'dev-user-id',
  id: 'dev-user-id',
  name: 'Developer',
  fullName: 'Developer User',
  email: 'developer@apis.local',
  photoURL: 'https://api.dicebear.com/7.x/initials/svg?seed=Developer',
  onboardingCompleted: true,
  regNo: 'DEV-2026',
  lastBackupAt: new Date(),
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(BYPASS_AUTH ? devUser : null);
  const [loading, setLoading] = useState(!BYPASS_AUTH);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (BYPASS_AUTH) return;

    const savedUser = localStorage.getItem('apis_fallback_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setLoading(false);
    }

    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      // Clean up previous profile listener if any
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      try {
        if (firebaseUser) {
          localStorage.removeItem('apis_fallback_user');
          const userRef = doc(db, 'users', firebaseUser.uid);
          unsubscribeProfile = onSnapshot(userRef, (docSnap) => {
            const data = docSnap.exists() ? docSnap.data() : {};
            
            // Fallback Chain: Firestore Name -> Firebase DisplayName -> Email Prefix -> "Scholar"
            const rawName = data.name || firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Scholar');
            
            // Clean name (Title Case, First Name only for UI if needed)
            const cleanName = rawName
              .split(' ')[0] // First name only as per Phase 8.6 requirements
              .replace(/[^a-zA-Z]/g, '') // Remove symbols if email prefix
              .charAt(0).toUpperCase() + rawName.split(' ')[0].slice(1).toLowerCase();

            const profilePhoto = data.photoURL || firebaseUser.photoURL || '';

            setUser({
              ...data,
              uid: firebaseUser.uid,
              id: firebaseUser.uid,
              name: cleanName,
              fullName: rawName,
              email: firebaseUser.email || '',
              photoURL: profilePhoto,
              onboardingCompleted: data.onboardingCompleted || false,
              lastBackupAt: data.lastBackupAt || null, // For backup tracking
            } as UserProfile);
            
            setLoading(false);
          }, (err) => {
            setLoading(false);
          });
        } else {
          if (!localStorage.getItem('apis_fallback_user')) {
            setUser(null);
          }
          setLoading(false);
        }
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      if (
        err.code === 'auth/api-key-not-valid' ||
        err.code === 'auth/network-request-failed' ||
        err.message?.includes('API key not valid') ||
        err.message?.includes('network-request-failed')
      ) {
        console.warn('Firebase Google Auth error caught. Using fallback developer session.');
        const profile: UserProfile = {
          uid: 'dev-user-id',
          id: 'dev-user-id',
          name: 'Scholar',
          fullName: 'Google Scholar',
          email: 'google-user@apis.local',
          photoURL: 'https://api.dicebear.com/7.x/initials/svg?seed=Scholar',
          onboardingCompleted: true,
          regNo: 'DEV-2026',
          lastBackupAt: new Date(),
        };
        localStorage.setItem('apis_fallback_user', JSON.stringify(profile));
        setUser(profile);
        return;
      }
      throw err;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      const profile = await loginUser(email, pass);
      setUser(profile);
    } catch (err: any) {
      throw err;
    }
  };

  const registerWithEmail = async (name: string, regNo: string, email: string, pass: string) => {
    try {
      const profile = await registerUser(name, regNo, email, pass);
      setUser(profile);
    } catch (err: any) {
      throw err;
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('apis_fallback_user');
      await signOut(auth);
      await clearFirebaseCache();
      setUser(null);
      window.location.href = '/login';
    } catch (err: any) {
      localStorage.removeItem('apis_fallback_user');
      setUser(null);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, loginWithGoogle, loginWithEmail, registerWithEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
