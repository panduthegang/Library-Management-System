export interface User {
  id: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  name: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  imageUrl: string;
  available: boolean;
  description: string;
  quantity: number;
  availableQuantity: number;
}

export interface BorrowRecord {
  id: string;
  bookId: string;
  userId: string;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
}

export interface BorrowedBookDetails extends BorrowRecord {
  book: Book;
  user: User;
}