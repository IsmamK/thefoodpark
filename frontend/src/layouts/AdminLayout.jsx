import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTachometerAlt, 
  FaShoppingBag, 
  FaBoxOpen, 
  FaTags, 
  FaBars, 
  FaTimes,
  FaChevronRight,
  FaSignOutAlt
} from 'react-icons/fa';
import { Outlet, useNavigate } from 'react-router-dom';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('dashboard');
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      }
    };

    handleResize(); // Check initial size
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
    { name: 'dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
    { name: 'orders', icon: <FaShoppingBag />, label: 'Orders' },
    { name: 'products', icon: <FaBoxOpen />, label: 'Products' },
    { name: 'discount', icon: <FaTags />, label: 'Discount' }
  ];

  const handleNavigation = (item) => {
    setActiveItem(item);
    if (isMobile) setIsSidebarOpen(false);
    navigate(item === 'dashboard' ? '/admin' : `/admin/${item}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {(isSidebarOpen || !isMobile) && (
          <motion.aside
            initial={{ x: isMobile ? -300 : 0 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`w-64 bg-gradient-to-b from-indigo-600 to-purple-600 text-white fixed md:relative min-h-screen z-50 shadow-xl`}
          >
            <div className="p-6 flex flex-col h-full">
              {/* Sidebar Header with Close Button (Mobile only) */}
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center">
                  <span className="bg-white text-indigo-600 p-2 rounded-lg mr-3">
                    <FaTachometerAlt />
                  </span>
                  <h1 className="text-2xl font-bold">Admin Panel</h1>
                </div>
                {isMobile && (
                  <button 
                    onClick={() => setIsSidebarOpen(false)}
                    className="text-white p-2 rounded-full hover:bg-indigo-700"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>

              {/* Navigation Items */}
              <nav className="flex-1">
                <ul className="space-y-2">
                  {navItems.map((item) => (
                    <li key={item.name}>
                      <button
                        onClick={() => handleNavigation(item.name)}
                        className={`w-full flex items-center justify-between p-4 rounded-lg transition-all ${activeItem === item.name ? 'bg-white text-indigo-600 shadow-md' : 'text-white hover:bg-indigo-700'}`}
                      >
                        <div className="flex items-center">
                          <span className="text-lg mr-3">{item.icon}</span>
                          <span className="font-medium">{item.label}</span>
                        </div>
                        <FaChevronRight className={`transition-transform ${activeItem === item.name ? 'rotate-90' : ''}`} />
                      </button>
                    </li>
                  ))}
                   {/* Logout Button */}
                   <div className='mt-10'>
              <button className="mt-20 flex items-center p-4  bg-white text-blue-900 hover:bg-gray-100 rounded-lg transition-all">
                <FaSignOutAlt className="mr-3" />
                <span className="font-medium">Logout</span>
                
              </button>
              </div>
                </ul>
              </nav>

             
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 overflow-x-hidden">
        {/* Top Bar with Mobile Menu Button */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          {isMobile && (
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="text-indigo-600 p-2 rounded-lg hover:bg-indigo-50"
            >
              <FaBars className="text-xl" />
            </button>
          )}
          <h2 className="text-xl font-bold text-gray-800 capitalize mx-auto md:mx-0">
            {activeItem.replace('-', ' ')}
          </h2>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold">
                A
              </div>
              <span className="absolute top-0 right-0 h-3 w-3 bg-green-400 rounded-full border-2 border-white"></span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;