'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/libs/firebase';
import { FIRESTORE_COLLECTIONS } from '@/configs/constants';

interface AdminData {
  uid: string;
  email: string;
  displayName: string;
  role: 'super_admin' | 'staff';
}

interface AdminAuthCtx {
  user: User | null;
  adminData: AdminData | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthCtx | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const snap = await getDoc(
          doc(db, FIRESTORE_COLLECTIONS.ADMINS, firebaseUser.uid),
        );
        setAdminData(snap.exists() ? (snap.data() as AdminData) : null);
      } else {
        setAdminData(null);
      }

      setIsLoading(false);
    });

    return unsub;
  }, []);

  const login = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const snap = await getDoc(
      doc(db, FIRESTORE_COLLECTIONS.ADMINS, cred.user.uid),
    );
    if (!snap.exists()) {
      await signOut(auth);
      throw new Error('Tài khoản không có quyền truy cập dashboard');
    }
    setAdminData(snap.data() as AdminData);
  };

  const logout = async () => {
    await signOut(auth);
    setAdminData(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        adminData,
        isAdmin: !!adminData,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used inside AdminAuthProvider');
  return ctx;
}
