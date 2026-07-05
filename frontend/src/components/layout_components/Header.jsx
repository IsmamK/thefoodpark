import { useState, useEffect } from "react";
import { FiShoppingCart } from "react-icons/fi";
import { Link } from "react-router-dom";
import { readJsonStorage } from "../../utils/storage";

const Navbar = () => {
  const [cartCount, setCartCount] = useState(0);

  // Update cart count from localStorage
  const updateCartCount = () => {
    const cartItems = readJsonStorage("cartItems", []);
    setCartCount(Array.isArray(cartItems) ? cartItems.length : 0);
  };

  useEffect(() => {
    updateCartCount();

    const handleCartUpdate = () => updateCartCount();
    window.addEventListener("cartUpdated", handleCartUpdate);
    window.addEventListener("storage", updateCartCount);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
      window.removeEventListener("storage", updateCartCount);
    };
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo + Name */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm select-none">FP</span>
            </div>
            <a href="/" className="text-gray-900 hover:text-yellow-500 transition">
            <h1 className="text-xl font-black text-gray-900 select-none">The Food Park</h1>
            </a>
          </div>

          {/* Cart Button */}
          <Link
            to="/cart"
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all"
          >
            <FiShoppingCart className="w-4 h-4" />
            <span>Cart{cartCount > 0 ? ` (${cartCount})` : ""}</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
