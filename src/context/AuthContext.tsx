import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  googleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser
} from '../lib/firebase';

export interface DbUser {
  id: number;
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  status: 'active' | 'suspended' | 'deleted';
  subscriptionTier: 'Free' | 'Pro' | 'Enterprise';
  createdAt: string;
  lastLogin: string;
  avatarUrl?: string;
}

interface AuthContextType {
  currentUser: FirebaseUser | null;
  dbUser: DbUser | null;
  isAdmin: boolean;
  isViewer: boolean;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshDbUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Designated Admin emails
const ADMIN_EMAILS = ['sobratdayal2008@gmail.com', 'admin@gemininotebook.ai'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync with PostgreSQL backend
  const syncWithPostgres = async (user: FirebaseUser) => {
    try {
      const res = await fetch('/api/auth/sync-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          name: user.displayName || user.email?.split('@')[0] || 'Researcher',
          avatarUrl: user.photoURL || undefined
        })
      });

      if (res.ok) {
        const data = await res.json();
        setDbUser(data.user);
      }
    } catch (err) {
      console.warn('Failed to sync user with PostgreSQL database:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user && user.email) {
        await syncWithPostgres(user);
      } else {
        // Fallback default admin user for instant testing if not logged in
        setDbUser({
          id: 1,
          uid: 'admin_sobrat',
          name: 'Sobrat Dayal (Lead Admin)',
          email: 'sobratdayal2008@gmail.com',
          role: 'admin',
          status: 'active',
          subscriptionTier: 'Enterprise',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'
        });
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      if (result.user) {
        await syncWithPostgres(result.user);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      if (cred.user) {
        await syncWithPostgres(cred.user);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signupWithEmail = async (email: string, pass: string, name: string) => {
    setIsLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (cred.user) {
        await updateProfile(cred.user, { displayName: name });
        await syncWithPostgres(cred.user);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await firebaseSignOut(auth);
    setCurrentUser(null);
    setDbUser(null);
  };

  const refreshDbUser = async () => {
    if (currentUser) {
      await syncWithPostgres(currentUser);
    }
  };

  const userEmail = currentUser?.email || dbUser?.email || '';
  const isAdmin = ADMIN_EMAILS.includes(userEmail.toLowerCase()) || dbUser?.role === 'admin';
  const isViewer = dbUser?.role === 'viewer';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        dbUser,
        isAdmin,
        isViewer,
        isLoading,
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
        logout,
        refreshDbUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
