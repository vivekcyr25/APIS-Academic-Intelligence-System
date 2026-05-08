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
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {

          
          const userRef = doc(db, 'users', firebaseUser.uid);
          const unsubscribeProfile = onSnapshot(userRef, (docSnap) => {
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

          return () => unsubscribeProfile();
        } else {
          setUser(null);
          setLoading(false);
        }
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      await clearFirebaseCache();
      setUser(null);
      window.location.href = '/login';
    } catch (err: any) {
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, loginWithGoogle, logout }}>
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
