import { useState, useEffect, useCallback } from 'react';
import {
    collection, query, where, onSnapshot,
    addDoc, updateDoc, deleteDoc, doc,
    serverTimestamp, getDoc
} from 'firebase/firestore';
import { db, storage } from '../services/firebase';
import { Note, Category, Attachment } from '../types/note';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const useNotes = (userId: string | undefined) => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch Categories for current user
    useEffect(() => {
        if (!userId) return;

        const q = query(
            collection(db, 'categories'),
            where('userId', '==', userId)
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

        if (categoryId === 'all') {
            q = query(
                collection(db, 'notes'),
                where('userId', '==', userId)
            );
        } else {
            q = query(
                collection(db, 'notes'),
                where('userId', '==', userId),
                where('categoryId', '==', categoryId)
            );
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedNotes = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data({ serverTimestamps: 'estimate' }),
            })) as Note[];
            setNotes(fetchedNotes);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching notes:", error);
            setLoading(false);
        });

        return unsubscribe;
    }, [userId]);

    const getNote = async (id: string): Promise<Note | null> => {
        if (!userId) return null;
        const docRef = doc(db, 'notes', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data() as Note;
            // Security check: ensure user owns the note
            if (data.userId === userId) {
                return { ...data, id: docSnap.id } as Note;
            }
        }
        return null;
    };

    const addNote = async (categoryId: string) => {
        if (!userId) throw new Error("User must be logged in to add a note");

        const newNote = {
            title: 'New Note',
            content: '<p></p>',
            categoryId: categoryId === 'all' ? '' : categoryId,
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
        await deleteDoc(doc(db, 'notes', id));
    };

    const addCategory = async (name: string) => {
        if (!userId) return;
        await addDoc(collection(db, 'categories'), {
            name,
            count: 0,
            userId, // Anchor to user
            createdAt: serverTimestamp(),
        });
    };

    const uploadFile = async (noteId: string, file: File): Promise<Attachment> => {
        if (!userId) throw new Error("User must be logged in");

        // Store in user-specific folder for security
        const storageRef = ref(storage, `users/${userId}/notes/${noteId}/${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);

        const attachment: Attachment = {
            name: file.name,
            url,
            type: file.type,
            size: file.size,
        };

        return attachment;
    };

    return {
        notes,
        categories,
        loading,
        fetchNotes,
        getNote,
        addNote,
        updateNote,
        deleteNote,
        addCategory,
        uploadFile,
    };
};
