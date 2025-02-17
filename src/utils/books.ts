import { 
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
  orderBy
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Book, BorrowRecord, BorrowedBookDetails } from '../types';

export const addBook = async (book: Omit<Book, 'id' | 'available' | 'quantity' | 'availableQuantity'>): Promise<Book> => {
  try {
    const newBook = {
      ...book,
      available: true,
      quantity: 1,
      availableQuantity: 1,
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'books'), newBook);
    return {
      id: docRef.id,
      ...newBook
    } as Book;
  } catch (error) {
    console.error('Error adding book:', error);
    throw error;
  }
};

export const getBooks = async (): Promise<Book[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'books'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Book[];
  } catch (error) {
    console.error('Error getting books:', error);
    throw error;
  }
};

export const updateBook = async (book: Book): Promise<void> => {
  try {
    const bookRef = doc(db, 'books', book.id);
    await updateDoc(bookRef, { ...book });
  } catch (error) {
    console.error('Error updating book:', error);
    throw error;
  }
};

export const updateBookQuantity = async (bookId: string, quantity: number): Promise<void> => {
  try {
    const borrowedCount = await getBorrowedCount(bookId);
    const bookRef = doc(db, 'books', bookId);
    await updateDoc(bookRef, {
      quantity,
      availableQuantity: quantity - borrowedCount,
      available: (quantity - borrowedCount) > 0
    });
  } catch (error) {
    console.error('Error updating book quantity:', error);
    throw error;
  }
};

const getBorrowedCount = async (bookId: string): Promise<number> => {
  try {
    const q = query(
      collection(db, 'borrowRecords'),
      where('bookId', '==', bookId),
      where('returnDate', '==', null)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting borrowed count:', error);
    throw error;
  }
};

export const borrowBook = async (bookId: string, userId: string): Promise<void> => {
  try {
    const bookRef = doc(db, 'books', bookId);
    const book = (await getDoc(bookRef)).data() as Book;

    if (book && book.availableQuantity > 0) {
      await updateDoc(bookRef, {
        availableQuantity: book.availableQuantity - 1,
        available: (book.availableQuantity - 1) > 0
      });

      const borrowDate = new Date();
      const dueDate = new Date(borrowDate);
      dueDate.setDate(dueDate.getDate() + 7);

      await addDoc(collection(db, 'borrowRecords'), {
        bookId,
        userId,
        borrowDate: Timestamp.fromDate(borrowDate),
        dueDate: Timestamp.fromDate(dueDate),
        returnDate: null
      });
    }
  } catch (error) {
    console.error('Error borrowing book:', error);
    throw error;
  }
};

export const returnBook = async (bookId: string, userId: string): Promise<void> => {
  try {
    const bookRef = doc(db, 'books', bookId);
    const book = (await getDoc(bookRef)).data() as Book;

    if (book) {
      await updateDoc(bookRef, {
        availableQuantity: book.availableQuantity + 1,
        available: true
      });

      const q = query(
        collection(db, 'borrowRecords'),
        where('bookId', '==', bookId),
        where('userId', '==', userId),
        where('returnDate', '==', null)
      );

      const querySnapshot = await getDocs(q);
      const borrowRecord = querySnapshot.docs[0];

      if (borrowRecord) {
        await updateDoc(doc(db, 'borrowRecords', borrowRecord.id), {
          returnDate: serverTimestamp()
        });
      }
    }
  } catch (error) {
    console.error('Error returning book:', error);
    throw error;
  }
};

export const getBorrowedBooks = async (userId: string): Promise<BorrowRecord[]> => {
  try {
    const q = query(
      collection(db, 'borrowRecords'),
      where('userId', '==', userId),
      where('returnDate', '==', null)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        borrowDate: data.borrowDate.toDate().toISOString(),
        dueDate: data.dueDate.toDate().toISOString(),
        returnDate: data.returnDate ? data.returnDate.toDate().toISOString() : null
      };
    }) as BorrowRecord[];
  } catch (error) {
    console.error('Error getting borrowed books:', error);
    throw error;
  }
};

export const getAllBorrowedBooks = async (): Promise<BorrowedBookDetails[]> => {
  try {
    const [books, usersSnapshot] = await Promise.all([
      getBooks(),
      getDocs(collection(db, 'users'))
    ]);

    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const borrowRecordsQuery = query(
      collection(db, 'borrowRecords'),
      orderBy('borrowDate', 'desc')
    );
    
    const borrowRecordsSnapshot = await getDocs(borrowRecordsQuery);
    
    const borrowRecords = await Promise.all(
      borrowRecordsSnapshot.docs.map(async (doc) => {
        const data = doc.data();
        const book = books.find(b => b.id === data.bookId);
        const user = users.find(u => u.id === data.userId);

        if (!book || !user) {
          console.warn(`Missing book or user data for borrow record ${doc.id}`);
          return null;
        }

        return {
          id: doc.id,
          bookId: data.bookId,
          userId: data.userId,
          borrowDate: data.borrowDate.toDate().toISOString(),
          dueDate: data.dueDate.toDate().toISOString(),
          returnDate: data.returnDate ? data.returnDate.toDate().toISOString() : null,
          book,
          user
        };
      })
    );

    return borrowRecords.filter((record): record is BorrowedBookDetails => record !== null);
  } catch (error) {
    console.error('Error getting all borrowed books:', error);
    throw error;
  }
};