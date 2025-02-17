import React, { useState, useEffect } from 'react';
import { Book, BorrowRecord } from '../types';
import { getBooks, borrowBook, returnBook, getBorrowedBooks } from '../utils/books';
import { getCurrentUser } from '../utils/auth';
import { Search, BookOpen, Clock, CheckCircle, Library, BookMarked, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const UserDashboard = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const currentUser = getCurrentUser();

  const { ref: headerRef, inView: headerInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (currentUser) {
        try {
          setLoading(true);
          const [booksData, borrowedBooksData] = await Promise.all([
            getBooks(),
            getBorrowedBooks(currentUser.id)
          ]);
          setBooks(booksData);
          setBorrowedBooks(borrowedBooksData || []);
        } catch (error) {
          console.error('Error fetching data:', error);
          toast.error('Failed to load library data');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [currentUser?.id]);

  const handleBorrow = async (bookId: string) => {
    if (currentUser) {
      try {
        await borrowBook(bookId, currentUser.id);
        const [updatedBooks, updatedBorrowedBooks] = await Promise.all([
          getBooks(),
          getBorrowedBooks(currentUser.id)
        ]);
        setBooks(updatedBooks);
        setBorrowedBooks(updatedBorrowedBooks);
        setSelectedBook(null);
        toast.success('Book borrowed successfully!', {
          icon: '📚',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        });
      } catch (error) {
        console.error('Error borrowing book:', error);
        toast.error('Failed to borrow book');
      }
    }
  };

  const handleReturn = async (bookId: string) => {
    if (currentUser) {
      try {
        await returnBook(bookId, currentUser.id);
        const [updatedBooks, updatedBorrowedBooks] = await Promise.all([
          getBooks(),
          getBorrowedBooks(currentUser.id)
        ]);
        setBooks(updatedBooks);
        setBorrowedBooks(updatedBorrowedBooks);
        toast.success('Book returned successfully!', {
          icon: '✨',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        });
      } catch (error) {
        console.error('Error returning book:', error);
        toast.error('Failed to return book');
      }
    }
  };

  const getDaysRemaining = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading library data...</p>
        </div>
      </div>
    );
  }

  const borrowedBookIds = borrowedBooks?.map((record) => record.bookId) || [];

  const filteredBooks = books
    .filter((book) => !borrowedBookIds.includes(book.id))
    .filter(book => 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.isbn.includes(searchQuery)
    );

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        ref={headerRef}
        initial={{ opacity: 0, y: -20 }}
        animate={headerInView ? { opacity: 1, y: 0 } : {}}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 md:p-12"
      >
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to Your Library</h1>
          <p className="text-lg text-blue-100 max-w-2xl">
            Discover a world of knowledge through our carefully curated collection of books
          </p>
          <div className="mt-6 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
            <BookMarked className="h-5 w-5" />
            <span className="font-medium">
              {borrowedBooks.length} Book{borrowedBooks.length !== 1 ? 's' : ''} Borrowed
            </span>
          </div>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-blue-500/20 to-transparent transform skew-x-12" />
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative"
      >
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Search books by title, author, or ISBN..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-colors"
        />
      </motion.div>

      {/* Borrowed Books Section */}
      {borrowedBooks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg overflow-hidden border border-amber-100/50"
        >
          <div className="p-6 border-b border-amber-100/50">
            <h2 className="text-2xl font-bold text-amber-900">Currently Reading</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {books
              .filter((book) => borrowedBookIds.includes(book.id))
              .map((book, index) => {
                const borrowRecord = borrowedBooks.find((record) => record.bookId === book.id);
                const daysRemaining = borrowRecord ? getDaysRemaining(borrowRecord.dueDate) : 0;

                return (
                  <motion.div
                    key={book.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                  >
                    <div className="relative h-48">
                      <img
                        src={book.imageUrl}
                        alt={book.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute bottom-4 left-4 right-4 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <h3 className="text-lg font-bold text-white mb-1">{book.title}</h3>
                        <p className="text-gray-200">By {book.author}</p>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Clock className="h-4 w-4 text-amber-500" />
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            daysRemaining > 2
                              ? 'bg-green-100 text-green-800'
                              : daysRemaining > 0
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {daysRemaining > 0
                            ? `${daysRemaining} days remaining`
                            : 'Overdue'}
                        </span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleReturn(book.id)}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2.5 rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Return Book
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
          </div>
        </motion.div>
      )}

      {/* Available Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredBooks.map((book, index) => (
          <motion.div
            key={book.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`group relative bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
              selectedBook?.id === book.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedBook(selectedBook?.id === book.id ? null : book)}
          >
            <div className="relative h-72">
              <img
                src={book.imageUrl}
                alt={book.title}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-2xl font-bold text-white mb-2">{book.title}</h3>
                <p className="text-lg text-gray-200 mb-2">By {book.author}</p>
                <p className="text-sm text-gray-300">ISBN: {book.isbn}</p>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-700 line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
                  {book.description}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <span
                  className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                    book.availableQuantity > 0
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {book.availableQuantity} of {book.quantity} available
                </span>
                {book.availableQuantity > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBorrow(book.id);
                    }}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-blue-500/20"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>Borrow</span>
                    <ArrowRight className="h-4 w-4" />
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Library className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No books found matching your search.</p>
        </motion.div>
      )}
    </div>
  );
};

export default UserDashboard;