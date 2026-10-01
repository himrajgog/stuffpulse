// Firebase Initialization & Services Module
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Get config from environment variables or custom local storage key
export const getStoredFirebaseConfig = () => {
  try {
    const saved = localStorage.getItem('workpulse_firebase_config');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // Ignore parse error
  }
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  };
};

let firebaseApp = null;
let firestoreDb = null;
let firebaseAuth = null;
let firebaseStorage = null;
let isConfigured = false;

export const initFirebase = (customConfig = null) => {
  const config = customConfig || getStoredFirebaseConfig();
  
  if (config.apiKey && config.projectId && config.apiKey !== 'your-api-key') {
    try {
      if (!getApps().length) {
        firebaseApp = initializeApp(config);
      } else {
        firebaseApp = getApp();
      }
      firestoreDb = getFirestore(firebaseApp);
      firebaseAuth = getAuth(firebaseApp);
      firebaseStorage = getStorage(firebaseApp);
      isConfigured = true;
      console.log('Firebase initialized successfully with project:', config.projectId);
      return { success: true, app: firebaseApp, db: firestoreDb, auth: firebaseAuth, storage: firebaseStorage };
    } catch (err) {
      console.warn('Firebase initialization failed (operating in Local-First fallback mode):', err.message);
      isConfigured = false;
      return { success: false, error: err.message };
    }
  } else {
    isConfigured = false;
    return { success: false, reason: 'Firebase credentials not supplied' };
  }
};

// Initialize once on load
initFirebase();

export const isFirebaseActive = () => isConfigured;

export { firestoreDb as db, firebaseAuth as auth, firebaseStorage as storage };

/**
 * Firestore helper methods with automatic error fallback
 */
export const firestoreService = {
  async getCollection(collectionName) {
    if (!isConfigured || !firestoreDb) return null;
    try {
      const colRef = collection(firestoreDb, collectionName);
      const snapshot = await getDocs(colRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.error(`Error reading ${collectionName} from Firestore:`, err);
      return null;
    }
  },

  subscribeToCollection(collectionName, callback) {
    if (!isConfigured || !firestoreDb) return () => {};
    try {
      const colRef = collection(firestoreDb, collectionName);
      return onSnapshot(colRef, (snapshot) => {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(docs);
      }, (err) => {
        console.warn(`Firestore subscription warning on ${collectionName}:`, err.message);
      });
    } catch (err) {
      console.warn(`Failed to subscribe to ${collectionName}:`, err.message);
      return () => {};
    }
  },

  async addDocument(collectionName, data) {
    if (!isConfigured || !firestoreDb) return null;
    try {
      const colRef = collection(firestoreDb, collectionName);
      const docRef = await addDoc(colRef, {
        ...data,
        createdAt: new Date().toISOString(),
      });
      return docRef.id;
    } catch (err) {
      console.error(`Error adding to ${collectionName}:`, err);
      return null;
    }
  },

  async setDocumentWithId(collectionName, docId, data) {
    if (!isConfigured || !firestoreDb) return false;
    try {
      const docRef = doc(firestoreDb, collectionName, docId);
      await setDoc(docRef, data, { merge: true });
      return true;
    } catch (err) {
      console.error(`Error saving document ${docId}:`, err);
      return false;
    }
  },

  async updateDocument(collectionName, docId, data) {
    if (!isConfigured || !firestoreDb) return false;
    try {
      const docRef = doc(firestoreDb, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString(),
      });
      return true;
    } catch (err) {
      console.error(`Error updating document ${docId}:`, err);
      return false;
    }
  },

  async deleteDocument(collectionName, docId) {
    if (!isConfigured || !firestoreDb) return false;
    try {
      const docRef = doc(firestoreDb, collectionName, docId);
      await deleteDoc(docRef);
      return true;
    } catch (err) {
      console.error(`Error deleting document ${docId}:`, err);
      return false;
    }
  },

  async uploadReceipt(file, path = 'receipts') {
    if (!isConfigured || !firebaseStorage) {
      // In local mode, return a Data URL or placeholder
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    }
    try {
      const filename = `${path}/${Date.now()}_${file.name}`;
      const storageRef = ref(firebaseStorage, filename);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl;
    } catch (err) {
      console.error('Storage upload failed:', err);
      return null;
    }
  }
};

/**
 * Authentication service with fallback for offline/demo mode
 */
export const firebaseAuthService = {
  async login(email, password) {
    if (isConfigured && firebaseAuth) {
      try {
        const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
        return { success: true, user: userCredential.user };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }
    // Fallback: local simulated auth
    return { success: true, simulated: true };
  },

  async register(email, password) {
    if (isConfigured && firebaseAuth) {
      try {
        const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
        return { success: true, user: userCredential.user };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }
    return { success: true, simulated: true };
  },

  async logout() {
    if (isConfigured && firebaseAuth) {
      try {
        await signOut(firebaseAuth);
        return { success: true };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }
    return { success: true };
  }
};

