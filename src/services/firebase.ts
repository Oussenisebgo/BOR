import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  getDocFromServer,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export const BOOTSTRAP_ADMIN_EMAIL = 'oussbil22@gmail.com';

export interface AdminProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  isAdmin: boolean;
  role: 'admin' | 'user';
}

/**
 * Checks whether a given user has Administrator privileges
 */
export async function checkIsAdmin(user: FirebaseUser | null): Promise<boolean> {
  if (!user || !user.email) return false;

  // Bootstrapped master admin check
  if (user.email.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase()) {
    return true;
  }

  try {
    const userDocRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists() && userSnap.data()?.role === 'admin') {
      return true;
    }
  } catch (err) {
    console.warn('Could not read user role from Firestore:', err);
  }

  return false;
}

/**
 * Ensure user document exists in Firestore with appropriate role
 */
export async function syncUserProfile(user: FirebaseUser): Promise<AdminProfile> {
  const isAdmin = user.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();
  const role = isAdmin ? 'admin' : 'user';

  const rawName = user.displayName || user.email?.split('@')[0] || (isAdmin ? 'Admin' : 'User');
  const formattedName = rawName.includes('[BOR]') ? rawName : `[BOR] ${rawName}`;

  const profile: AdminProfile = {
    uid: user.uid,
    email: user.email,
    displayName: formattedName,
    isAdmin,
    role,
  };

  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(
      userRef,
      {
        id: user.uid,
        email: user.email,
        displayName: profile.displayName,
        role,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Failed to sync user profile to Firestore:', err);
  }

  return profile;
}

// Test Firestore connection on boot as mandated by skill
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or checking connection.');
    }
  }
}
testConnection();
