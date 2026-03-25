import { useState, useEffect } from 'react';
import {
  onAuthStateChanged, signInWithPopup, signInWithRedirect,
  getRedirectResult, signOut, browserLocalPersistence, setPersistence
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { fetchTeamMembers } from '../lib/googleSheets';

// Nastav perzistenci na localStorage (ne sessionStorage)
setPersistence(auth, browserLocalPersistence).catch(console.error);

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkMember = async (firebaseUser) => {
    const members = await fetchTeamMembers();
    const member = members.find(m => m.email === firebaseUser.email?.toLowerCase());
    if (member) {
      setUser(firebaseUser);
      setIsAdmin(member.isAdmin);
      setAccessDenied(false);
      return true;
    } else {
      await signOut(auth);
      setUser(null);
      setIsAdmin(false);
      setAccessDenied(true);
      return false;
    }
  };

  useEffect(() => {
    // Zpracuj redirect výsledek pokud existuje
    getRedirectResult(auth).then(async (result) => {
      if (result?.user) await checkMember(result.user);
    }).catch(console.error);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await checkMember(firebaseUser);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async () => {
    setAccessDenied(false);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      // Popup blokovaný — fallback na redirect
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (e) {
          console.error('Redirect login error:', e);
        }
      } else {
        console.error('Login error:', error);
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
    setAccessDenied(false);
  };

  return { user, loading, accessDenied, isAdmin, login, logout };
}
