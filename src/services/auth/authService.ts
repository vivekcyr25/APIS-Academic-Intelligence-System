import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config.ts';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export interface UserProfile {
  id: string;
  name: string;
  regNo: string;
  email: string;
  photoURL?: string;
  createdAt: any;
  umsConnected: boolean;
  onboardingCompleted: boolean;
}

export const registerUser = async (name: string, regNo: string, email: string, pass: string): Promise<UserProfile> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;

    const profile: UserProfile = {
      id: user.uid,
      name,
      regNo,
      email,
      createdAt: serverTimestamp(),
      umsConnected: false,
      onboardingCompleted: false,
    };

    await setDoc(doc(db, 'users', user.uid), profile);
    return profile;
  } catch (error: any) {
    if (
      error.code === 'auth/api-key-not-valid' ||
      error.code === 'auth/network-request-failed' ||
      error.message?.includes('API key not valid') ||
      error.message?.includes('network-request-failed')
    ) {
      console.warn('Firebase registration failed. Falling back to local offline session.');
      const profile: UserProfile = {
        id: 'dev-user-id',
        name,
        regNo,
        email,
        createdAt: new Date(),
        umsConnected: false,
        onboardingCompleted: false,
      };
      localStorage.setItem('apis_fallback_user', JSON.stringify(profile));
      return profile;
    }
    throw error;
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfile> => {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (!userDoc.exists()) {
    throw new Error('User profile not found in database.');
  }
  return userDoc.data() as UserProfile;
};

export const loginUser = async (email: string, pass: string): Promise<UserProfile> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    return await getUserProfile(userCredential.user.uid);
  } catch (error: any) {
    if (
      error.code === 'auth/api-key-not-valid' ||
      error.code === 'auth/network-request-failed' ||
      error.message?.includes('API key not valid') ||
      error.message?.includes('network-request-failed')
    ) {
      console.warn('Firebase login failed. Falling back to local developer session.');
      const profile: UserProfile = {
        id: 'dev-user-id',
        name: email.split('@')[0] || 'Scholar',
        regNo: 'DEV-2026',
        email,
        createdAt: new Date(),
        umsConnected: true,
        onboardingCompleted: true,
      };
      localStorage.setItem('apis_fallback_user', JSON.stringify(profile));
      return profile;
    }
    throw error;
  }
};

export const logoutUser = async () => {
  await signOut(auth);
};

export const signInWithGoogle = async (): Promise<UserProfile> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;
    
    const docRef = doc(db, 'users', firebaseUser.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }

    const profile: UserProfile = {
      id: firebaseUser.uid,
      name: firebaseUser.displayName || 'Academic User',
      regNo: '',
      email: firebaseUser.email || '',
      photoURL: firebaseUser.photoURL || '',
      createdAt: serverTimestamp(),
      umsConnected: false,
      onboardingCompleted: false,
    };
    
    await setDoc(docRef, profile);
    return profile;
  } catch (error: any) {
    console.error('Google Auth Error:', error.code, error.message);
    
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('The sign-in window was closed before completion.');
    }
    if (error.code === 'auth/popup-blocked') {
      throw new Error('Sign-in popup was blocked. Please allow popups.');
    }
    throw new Error(error.message || 'Google Sign-In failed.');
  }
};

export const handleGoogleRedirectResult = async (): Promise<UserProfile | null> => {
  try {
    const result = await getRedirectResult(auth);
    if (!result) return null;

    const firebaseUser = result.user;
    const docRef = doc(db, 'users', firebaseUser.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }

    const profile: UserProfile = {
      id: firebaseUser.uid,
      name: firebaseUser.displayName || 'Academic User',
      regNo: '',
      email: firebaseUser.email || '',
      photoURL: firebaseUser.photoURL || '',
      createdAt: serverTimestamp(),
      umsConnected: false,
      onboardingCompleted: false,
    };
    await setDoc(docRef, profile);
    return profile;
  } catch (error: any) {
    throw error;
  }
};

export const signInWithGoogleRedirect = async () => {
  await signInWithRedirect(auth, googleProvider);
};

export const subscribeToAuthChanges = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
