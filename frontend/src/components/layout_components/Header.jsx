import { useState,useEffect } from 'react';
import { FiSearch, FiShoppingCart, FiUser, FiMenu, FiX } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  
    // Function to update cart count
    const updateCartCount = () => {
      const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
      setCartCount(cartItems.length);
    };
  
    useEffect(() => {
      updateCartCount();
  
      const handleCartUpdate = () => updateCartCount();
      window.addEventListener('cartUpdated', handleCartUpdate);
      window.addEventListener('storage', updateCartCount);
  
      return () => {
        window.removeEventListener('cartUpdated', handleCartUpdate);
        window.removeEventListener('storage', updateCartCount);
      };
    }, []);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-white/20 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          
          {/* Logo / Brand Name */}
          <div className="flex items-center">
            <a href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              The Food Park
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            
            {/* <a href="/" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
              Home
            </a> */}
            {/* <a href="/shop" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
              Shop
            </a>
            <a href="/collections" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
              Collections
            </a>
            <a href="/about" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
              About
            </a> */}
          </nav>

          {/* Search and Actions */}
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            {/* <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="Search products..."
                className="pl-10 pr-4 py-2 rounded-full bg-white/90 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent w-64"
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div> */}

            {/* Icons */}
            <div className="flex items-center space-x-3">
              {/* <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <FiUser className="text-gray-700 text-xl" />
              </button> */}
              
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors relative">
              <Link to={'/cart'}>
                <FiShoppingCart className="text-gray-700 text-xl" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
                 </Link> 
                   {/* 
                          <div className="cart-button">
                            <div className="cart-icon-container">
                            <FiShoppingCart className="text-gray-700 text-xl" />
                              {cartCount > 0 && (
                                <span className="cart-badge">{cartCount}</span>
                              )}
                            </div>
                          </div>
                       */}
              </button>

              {/* Mobile Menu Button */}
              {/* <button 
                className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
              </button> */}
            </div>
          </div>
        </div>

        {/* Mobile Menu
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-3">
            <a href="/" className="block py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors">
              Home
            </a>
            <a href="/shop" className="block py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors">
              Shop
            </a>
            <a href="/collections" className="block py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors">
              Collections
            </a>
            <a href="/about" className="block py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors">
              About
            </a>
            <div className="pt-2 border-t border-gray-200">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 rounded-full bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
        )} */}
      </div>
    </header>
  );
};

export default Navbar;