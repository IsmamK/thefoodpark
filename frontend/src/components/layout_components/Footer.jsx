import {
  FaHome,
  FaPhone,
  FaShoppingCart,
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const Footer = () => {
  const [cartCount, setCartCount] = useState(0);
  

  useEffect(() => {
    const updateCartCount = () => {
      const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
      setCartCount(cartItems.length);
    };

    updateCartCount();
    window.addEventListener('cartUpdated', updateCartCount);
    window.addEventListener('storage', updateCartCount);

    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
      window.removeEventListener('storage', updateCartCount);
    };
  }, []);

  return (
    <div className="fixed bg-gradient-to-r from-yellow-50 to-amber-50 bottom-0 left-0 right-0 z-40  border-t border-gray-100 shadow-md">
      <nav className="flex justify-around items-center h-16">
        {/* Home */}
        <Link to="/home" className="flex flex-col items-center text-gray-900 hover:text-yellow-500 transition">
          <FaHome className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">Home</span>
        </Link>

        {/* Cart */}
        <Link to="/cart" className="relative">
          <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center shadow-lg -mt-8 border-4 border-white">
            <FaShoppingCart className="text-white w-5 h-5" />
          </div>
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow">
              {cartCount}
            </span>
          )}
        </Link>

        {/* Call */}
        <a href="tel:+8801887445596" className="flex flex-col items-center text-gray-900 hover:text-yellow-500 transition">
          <FaPhone className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">Call</span>
        </a>
      </nav>
    </div>
  );
};

export default Footer;
