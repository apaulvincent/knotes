import {
  addDoc,
  collection,
  deleteDoc, doc,
  getDoc, limit,
  onSnapshot, orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where
} from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { deleteFile } from '../services/storage';
import { Category, Note } from '../types/note';

export const useNotes = (userId: string | undefined) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noteLimit, setNoteLimit] = useState(15);
  const [hasMore, setHasMore] = useState(true);

  const PAGE_SIZE = 15;

  // Fetch Categories for current user
  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, 'categories'),
      where('userId', '==', userId),
      orderBy('name', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[];
      setCategories(cats);
    });
    return () => unsubscribe();
  }, [userId]);

  // Fetch Notes for current user & specific category
  const fetchNotes = useCallback((categoryId: string) => {
    if (!userId) return () => { };

    setLoading(true);
    let q;

    if (categoryId === 'all' || categoryId === 'archived') {
      q = query(
        collection(db, 'notes'),
        where('userId', '==', userId),
        orderBy('isPinned', 'desc'),
        orderBy('updatedAt', 'desc'),
        limit(noteLimit)
      );
    } else {
      q = query(
        collection(db, 'notes'),
        where('userId', '==', userId),
        where('categoryIds', 'array-contains', categoryId),
        orderBy('isPinned', 'desc'),
        orderBy('updatedAt', 'desc'),
        limit(noteLimit)
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedNotes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data({ serverTimestamps: 'estimate' }),
      })) as Note[];
      setNotes(fetchedNotes);
      // If the number of documents returned is less than the limit we requested,
      // we know there are no more documents to load.
      setHasMore(snapshot.docs.length === noteLimit);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error("Error fetching notes:", err);
      setError(err.message);
      setLoading(false);
      setHasMore(false); // Stop trying to load more if there's an error
    });

    return unsubscribe;
  }, [userId, noteLimit]);

  const loadMoreNotes = useCallback(() => {
    if (hasMore && !loading) {
      setLoading(true);
      setNoteLimit(prev => prev + PAGE_SIZE);
    }
  }, [hasMore, loading]);

  const resetNoteLimit = useCallback(() => {
    setNoteLimit(PAGE_SIZE);
    setHasMore(true);
    setError(null);
  }, []);

  const getNote = async (id: string): Promise<Note | null> => {
    if (!userId) return null;
    const docRef = doc(db, 'notes', id);
    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as Note;
        // Security check: ensure user owns the note
        if (data.userId === userId) {
          return { ...data, id: docSnap.id } as Note;
        }
      }
    } catch (err: any) {
      console.error("Error getting note:", err);
    }
    return null;
  };

  const addNote = async (categoryId: string) => {
    if (!userId) throw new Error("User must be logged in to add a note");

    const newNote = {
      title: 'New Note',
      content: '<p></p>',
      categoryIds: categoryId === 'all' ? [] : [categoryId],
      tags: [],
      isPinned: false,
      userId, // Anchor to user
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, 'notes'), newNote);
    return docRef.id;
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    if (!userId) return;
    const noteRef = doc(db, 'notes', id);
    await updateDoc(noteRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  };

  const deleteNote = async (id: string) => {
    if (!userId) return;

    try {
      // 1. Get the note content to find images
      const noteRef = doc(db, 'notes', id);
      const docSnap = await getDoc(noteRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const content = data.content || '';

        // 2. Extract Supabase image URLs
        const docHtml = new DOMParser().parseFromString(content, 'text/html');
        const imgs = Array.from(docHtml.querySelectorAll('img'));
        const supabaseUrls = imgs
          .map(img => img.src)
          .filter(src => src.includes('supabase.co/storage/v1/object/public/'));

        // 3. Delete each image from storage
        if (supabaseUrls.length > 0) {
          await Promise.all(supabaseUrls.map(url => deleteFile(url)));
        }
      }

      // 4. Finally delete the note document
      await deleteDoc(doc(db, 'notes', id));
    } catch (err) {
      console.error("Error deleting note and its assets:", err);
      // Still try to delete the doc if something failed
      await deleteDoc(doc(db, 'notes', id));
    }
  };

  const addCategory = async (name: string) => {
    if (!userId) return;
    const docRef = await addDoc(collection(db, 'categories'), {
      name,
      count: 0,
      userId, // Anchor to user
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  };

  const updateCategory = async (id: string, name: string) => {
    if (!userId) return;
    const catRef = doc(db, 'categories', id);
    await updateDoc(catRef, { name });
  };

  const deleteCategory = async (id: string) => {
    if (!userId) return;
    await deleteDoc(doc(db, 'categories', id));
  };

  const duplicateNote = async (id: string) => {
    if (!userId) throw new Error("User must be logged in to duplicate a note");
    const noteRef = doc(db, 'notes', id);
    const docSnap = await getDoc(noteRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const newNote = {
        ...data,
        title: `${data.title} (Copy)`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      const newDocRef = await addDoc(collection(db, 'notes'), newNote);
      return newDocRef.id;
    }
    return null;
  };

  return {
    notes,
    categories,
    loading,
    error,
    hasMore,
    fetchNotes,
    loadMoreNotes,
    resetNoteLimit,
    getNote,
    addNote,
    updateNote,
    deleteNote,
    duplicateNote,
    addCategory,
    updateCategory,
    deleteCategory
  };
};
