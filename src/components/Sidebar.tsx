import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Library, 
  LogOut, 
  Menu, 
  X, 
  Home,
  BookOpen,
  Settings,
  ChevronRight,
  User as UserIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCurrentUser } from '../utils/auth';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = getCurrentUser();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  if (!currentUser) return null;

  const menuItems = [
    {
      label: 'Dashboard',
      icon: Home,
      path: '/dashboard',
      show: true,
    },
    {
      label: 'Admin Dashboard',
      icon: Settings,
      path: '/admin',
      show: currentUser.role === 'admin',
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  const sidebarVariants = {
    expanded: { width: '240px' },
    collapsed: { width: '80px' }
  };

  const mobileSidebarVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: '-100%', opacity: 0 }
  };

  const Sidebar = () => (
    <motion.div
      variants={sidebarVariants}
      initial="expanded"
      animate={isCollapsed ? 'collapsed' : 'expanded'}
      className="hidden lg:flex flex-col h-screen fixed left-0 top-0 bg-white border-r border-gray-200 shadow-lg"
    >
      {/* Logo Section */}
      <div className="p-4 flex items-center justify-between border-b border-gray-200">
        <Link to="/" className="flex items-center space-x-3">
          <Library className="h-8 w-8 text-blue-500" />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text whitespace-nowrap"
              >
                Library System
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ChevronRight className={`h-5 w-5 transform transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex flex-col"
              >
                <span className="text-gray-900 font-medium truncate">{currentUser.name}</span>
                <span className="text-gray-500 text-sm truncate">{currentUser.email}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems
          .filter(item => item.show)
          .map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-300 group ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-gray-900' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-blue-500' : 'group-hover:text-blue-500'}`} />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 w-1 h-8 bg-blue-500 rounded-r-full"
                  />
                )}
              </Link>
            );
          })}
      </nav>

      {/* Logout Section */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-300 group"
        >
          <LogOut className="h-5 w-5 group-hover:text-red-500" />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="whitespace-nowrap"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.div>
  );

  const MobileSidebar = () => (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors border border-gray-200"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            />
            <motion.div
              variants={mobileSidebarVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="lg:hidden fixed left-0 top-0 h-screen w-[280px] bg-white border-r border-gray-200 shadow-xl z-50"
            >
              <div className="p-4 flex items-center justify-between border-b border-gray-200">
                <Link to="/" className="flex items-center space-x-3">
                  <Library className="h-8 w-8 text-blue-500" />
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
                    Library System
                  </span>
                </Link>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-900 font-medium">{currentUser.name}</span>
                    <span className="text-gray-500 text-sm">{currentUser.email}</span>
                  </div>
                </div>
              </div>

              <nav className="flex-1 p-4 space-y-2">
                {menuItems
                  .filter(item => item.show)
                  .map(item => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileOpen(false)}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-300 group ${
                          isActive 
                            ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-gray-900' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <item.icon className={`h-5 w-5 ${isActive ? 'text-blue-500' : 'group-hover:text-blue-500'}`} />
                        <span>{item.label}</span>
                        {isActive && (
                          <motion.div
                            layoutId="mobileActiveIndicator"
                            className="absolute left-0 w-1 h-8 bg-blue-500 rounded-r-full"
                          />
                        )}
                      </Link>
                    );
                  })}
              </nav>

              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-300 group"
                >
                  <LogOut className="h-5 w-5 group-hover:text-red-500" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );

  return (
    <>
      <Sidebar />
      <MobileSidebar />
    </>
  );
};

export default Sidebar;