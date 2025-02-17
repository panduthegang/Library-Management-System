import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Library, LogOut, Menu, X } from 'lucide-react';
import { getCurrentUser } from '../utils/auth';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = getCurrentUser();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  if (!currentUser) return null;

  const menuItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      show: true,
    },
    {
      label: 'Admin Dashboard',
      path: '/admin',
      show: currentUser.role === 'admin',
    },
  ];

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Library className="h-8 w-8 text-blue-600" />
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 text-transparent bg-clip-text">
              Library System
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems
              .filter(item => item.show)
              .map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative text-gray-700 hover:text-blue-600 transition-colors ${
                    location.pathname === item.path ? 'text-blue-600' : ''
                  }`}
                >
                  {item.label}
                  {location.pathname === item.path && (
                    <motion.div
                      layoutId="underline"
                      className="absolute left-0 right-0 h-0.5 bg-blue-600 bottom-[-4px]"
                    />
                  )}
                </Link>
              ))}
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Welcome, {currentUser.name}
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </motion.button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100"
          >
            <div className="container mx-auto px-4 py-4 space-y-4">
              {menuItems
                .filter(item => item.show)
                .map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block text-gray-700 hover:text-blue-600 transition-colors ${
                      location.pathname === item.path ? 'text-blue-600' : ''
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              <div className="pt-4 border-t border-gray-100">
                <span className="block text-gray-700 mb-2">
                  Welcome, {currentUser.name}
                </span>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;