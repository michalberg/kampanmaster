import { useState, useEffect } from 'react';
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, query
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useProjects(user) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'projects'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
      setProjects(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const addProject = async (name, description, links) => {
    const maxOrder = projects.length > 0 ? Math.max(...projects.map(p => p.order || 0)) : 0;
    await addDoc(collection(db, 'projects'), {
      name,
      description: description || '',
      links: links || [],
      order: maxOrder + 1,
      createdAt: serverTimestamp(),
      createdBy: user.email,
      createdByName: user.displayName,
      updatedAt: serverTimestamp(),
      updatedBy: user.email,
      updatedByName: user.displayName,
    });
  };

  const updateProject = async (projectId, updates) => {
    await updateDoc(doc(db, 'projects', projectId), {
      ...updates,
      updatedAt: serverTimestamp(),
      updatedBy: user.email,
      updatedByName: user.displayName,
    });
  };

  const deleteProject = async (projectId) => {
    await deleteDoc(doc(db, 'projects', projectId));
  };

  const reorderProjects = async (reorderedProjects) => {
    const updates = reorderedProjects.map((project, index) =>
      updateDoc(doc(db, 'projects', project.id), { order: index + 1 })
    );
    await Promise.all(updates);
  };

  return { projects, loading, addProject, updateProject, deleteProject, reorderProjects };
}
