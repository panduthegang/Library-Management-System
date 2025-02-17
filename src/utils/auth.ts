import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User } from '../types';

export const login = async (email: string, password: string): Promise<User | null> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    
    if (!userDoc.exists()) {
      throw new Error('User data not found');
    }
    
    const userData = userDoc.data() as Omit<User, 'id'>;
    const user: User = {
      id: userCredential.user.uid,
      ...userData
    };
    
    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const register = async (userData: Omit<User, 'id'>): Promise<User> => {
  const { email, password, ...rest } = userData;
  
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user: User = {
      id: userCredential.user.uid,
      email,
      ...rest
    };

    await setDoc(doc(db, 'users', user.id), {
      email: user.email,
      name: user.name,
      role: user.role
    });

    return user;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
    localStorage.removeItem('currentUser');
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem('currentUser');
  return userJson ? JSON.parse(userJson) : null;
};