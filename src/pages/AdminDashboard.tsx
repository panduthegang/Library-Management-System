import React, { useState, useEffect } from 'react';
import { Book as BookIcon, Plus, Users, Search, X, BookOpen, Calendar, Users2 } from 'lucide-react';
import { Book, BorrowedBookDetails } from '../types';
import { addBook, getBooks, updateBook, updateBookQuantity, getAllBorrowedBooks } from '../utils/books';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const AdminDashboard = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBookDetails[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    isbn: '',
    imageUrl: '',
    description: '',
  });

  const { ref: statsRef, inView: statsInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [booksData, borrowedBooksData] = await Promise.all([
          getBooks(),
          getAllBorrowedBooks()
        ]);
        setBooks(booksData || []);
        setBorrowedBooks(borrowedBooksData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load library data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const book = await addBook(newBook);
      setBooks(prevBooks => [...prevBooks, book]);
      setShowAddForm(false);
      setNewBook({
        title: '',
        author: '',
        isbn: '',
        imageUrl: '',
        description: '',
      });
      toast.success('Book added successfully!', {
        icon: '📚',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
    } catch (error) {
      console.error('Error adding book:', error);
      toast.error('Failed to add book');
    }
  };

  const handleUpdateQuantity = async (book: Book, newQuantity: number) => {
    if (newQuantity < 1) {
      toast.error('Quantity must be at least 1');
      return;
    }
    try {
      await updateBookQuantity(book.id, newQuantity);
      const updatedBooks = await getBooks();
      setBooks(updatedBooks);
      toast.success('Book quantity updated successfully!');
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.isbn.includes(searchQuery)
  );

  const activeBorrows = borrowedBooks.filter(record => !record.returnDate);
  const completedBorrows = borrowedBooks.filter(record => record.returnDate);

  const statsData = [
    {
      title: 'Total Books',
      value: books.length,
      icon: BookOpen,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Available Books',
      value: books.filter(book => book.availableQuantity > 0).length,
      icon: BookIcon,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Active Borrows',
      value: activeBorrows.length,
      icon: Users2,
      color: 'from-purple-500 to-purple-600'
    }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 md:p-12">
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl md:text-5xl font-bold"
            >
              Library Management
            </motion.h1>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddForm(true)}
              className="flex items-center space-x-2 bg-white text-indigo-600 px-6 py-3 rounded-xl hover:bg-indigo-50 transition-colors shadow-lg hover:shadow-xl"
            >
              <Plus className="h-5 w-5" />
              <span>Add New Book</span>
            </motion.button>
          </div>
          <p className="mt-4 text-lg text-indigo-100 max-w-2xl">
            Manage your library's collection and monitor book circulation
          </p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-purple-500/20 to-transparent transform skew-x-12" />
      </div>

      {/* Stats Overview */}
      <motion.div
        ref={statsRef}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {statsData.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={statsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: index * 0.1 }}
            className={`bg-gradient-to-br ${stat.color} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow transform hover:-translate-y-1`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold opacity-90">{stat.title}</h3>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </div>
              <stat.icon className="h-12 w-12 opacity-20" />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Search books by title, author, or ISBN..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20 transition-colors"
        />
      </motion.div>

      {/* Borrow History Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-50 to-indigo-50 rounded-xl shadow-lg overflow-hidden border border-indigo-100/50"
      >
        <div className="p-6 border-b border-indigo-100/50">
          <h2 className="text-2xl font-bold text-gray-900">Borrow History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Borrow Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return Date</th>
              </tr>
            </thead>
            <tbody className="bg-white/30 divide-y divide-gray-200/50">
              {borrowedBooks.map((borrow) => {
                const daysRemaining = !borrow.returnDate ? getDaysRemaining(borrow.dueDate) : null;
                return (
                  <motion.tr
                    key={borrow.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="hover:bg-white/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img className="h-10 w-10 rounded-lg object-cover" src={borrow.book.imageUrl} alt="" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{borrow.book.title}</div>
                          <div className="text-sm text-gray-500">{borrow.book.author}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{borrow.user.name}</div>
                      <div className="text-sm text-gray-500">{borrow.user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(borrow.borrowDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(borrow.dueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {borrow.returnDate ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Returned
                        </span>
                      ) : (
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            daysRemaining && daysRemaining > 2
                              ? 'bg-blue-100 text-blue-800'
                              : daysRemaining && daysRemaining > 0
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {daysRemaining && daysRemaining > 0
                            ? `${daysRemaining} days remaining`
                            : 'Overdue'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {borrow.returnDate ? formatDate(borrow.returnDate) : '-'}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filteredBooks.map((book, index) => (
          <motion.div
            key={book.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`group bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 ${
              selectedBook?.id === book.id ? 'ring-2 ring-indigo-500' : ''
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
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
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

                <div className="space-y-4 mt-auto">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                        book.availableQuantity > 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {book.availableQuantity} of {book.quantity} available
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <label className="text-sm font-medium text-gray-700">Quantity:</label>
                    <input
                      type="number"
                      min="1"
                      value={book.quantity}
                      onChange={(e) => handleUpdateQuantity(book, parseInt(e.target.value))}
                      className="w-24 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Book Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Add New Book</h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleAddBook} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={newBook.title}
                    onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                  <input
                    type="text"
                    value={newBook.author}
                    onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
                  <input
                    type="text"
                    value={newBook.isbn}
                    onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input
                    type="url"
                    value={newBook.imageUrl}
                    onChange={(e) => setNewBook({ ...newBook, imageUrl: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newBook.description}
                    onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20 transition-colors min-h-[100px] resize-y"
                    required
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
                  >
                    Add Book
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;