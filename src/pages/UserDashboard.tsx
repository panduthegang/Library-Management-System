import React, { useState, useEffect } from 'react';
import { Book, BorrowRecord } from '../types';
import { getBooks, borrowBook, returnBook, getBorrowedBooks } from '../utils/books';
import { getCurrentUser } from '../utils/auth';
import { Search, BookOpen, Clock, CheckCircle, Library, BookMarked, ArrowRight, BookOpenCheck, Bookmark } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { BookCardSkeleton, StatsSkeleton } from '../components/SkeletonLoader';
import { SuccessConfetti } from '../components/SuccessConfetti';

const UserDashboard = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
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
        setShowConfetti(true);
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
        setShowConfetti(true);
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
      <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-48 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl animate-pulse" />
        <StatsSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <BookCardSkeleton key={i} />
          ))}
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
      {showConfetti && <SuccessConfetti />}
      
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
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
              <BookMarked className="h-5 w-5" />
              <span className="font-medium">
                {borrowedBooks.length} Book{borrowedBooks.length !== 1 ? 's' : ''} Borrowed
              </span>
            </div>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
              <BookOpen className="h-5 w-5" />
              <span className="font-medium">
                {filteredBooks.length} Book{filteredBooks.length !== 1 ? 's' : ''} Available
              </span>
            </div>
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

      {/* Currently Reading Section */}
      {borrowedBooks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-2 rounded-lg">
              <BookOpenCheck className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Currently Reading</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    className="group bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-amber-100/50"
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Book Cover */}
                      <div className="relative w-full md:w-1/3">
                        <div className="aspect-[3/4] relative">
                          <img
                            src={book.imageUrl}
                            alt={book.title}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      </div>

                      {/* Book Details */}
                      <div className="flex-1 p-6">
                        <div className="mb-4">
                          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">
                            {book.title}
                          </h3>
                          <p className="text-gray-600 mb-2">By {book.author}</p>
                          <p className="text-sm text-gray-500 mb-4">ISBN: {book.isbn}</p>
                          
                          <div className="mb-4">
                            <p className="text-gray-700 line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
                              {book.description}
                            </p>
                          </div>
                        </div>
                        
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
                    </div>
                  </motion.div>
                );
              })}
          </div>
        </motion.div>
      )}

      {/* Available Books Section */}
      {filteredBooks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-lg">
              <Bookmark className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Available Books</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredBooks.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`group bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 ${
                  selectedBook?.id === book.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedBook(selectedBook?.id === book.id ? null : book)}
              >
                <div className="flex flex-col md:flex-row">
                  {/* Book Cover */}
                  <div className="relative w-full md:w-1/3">
                    <div className="aspect-[3/4] relative">
                      <img
                        src={book.imageUrl}
                        alt={book.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </div>

                  {/* Book Details */}
                  <div className="flex-1 p-6">
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-lg text-gray-600 mb-2">By {book.author}</p>
                      <p className="text-sm text-gray-500 mb-4">ISBN: {book.isbn}</p>
                      
                      <div className="mb-4">
                        <p className="text-gray-700 line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
                          {book.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-auto">
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
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {filteredBooks.length === 0 && !borrowedBooks.length && (
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