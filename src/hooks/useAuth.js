import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, getRedirectResult, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { fetchTeamMembers } from '../lib/googleSheets';

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

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
    } else {
      await signOut(auth);
      setUser(null);
      setIsAdmin(false);
      setAccessDenied(true);
    }
  };

  useEffect(() => {
    // Zpracuj výsledek redirect přihlášení
    getRedirectResult(auth).then(async (result) => {
      if (result?.user) {
        await checkMember(result.user);
      }
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
      if (isMobile) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        await signInWithPopup(auth, googleProvider);
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setAccessDenied(false);
  };

  return { user, loading, accessDenied, isAdmin, login, logout };
}
