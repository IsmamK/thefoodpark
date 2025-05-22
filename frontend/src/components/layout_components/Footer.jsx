import { FaHome, FaTag, FaShoppingBag, FaPhone, FaShoppingCart } from 'react-icons/fa';
import './Footer.css';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const Footer = () => {
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
    <div className="footer-container">
      <nav className="bottom-nav">
        {/* Home */}
        <div className="nav-item active text-center ">
          <Link to={'/home'} className='flex flex-col items-center'>
            <FaHome className="nav-icon text-red-500" />
            <span className="nav-text text-red-500">Home</span>
          </Link>
        </div>

        {/* Cart Button in Middle */}
        <Link to={'/cart'}>
          <div className="cart-button">
            <div className="cart-icon-container">
              <FaShoppingCart className="cart-icon text-white" />
              {cartCount > 0 && (
                <span className="cart-badge">{cartCount}</span>
              )}
            </div>
          </div>
        </Link>

        {/* Call Button */}
        <a href="tel:+8801887445596" className="nav-item flex flex-col items-center">
          <FaPhone className="nav-icon text-red-500" />
          <span className="nav-text text-red-500">Call</span>
        </a>
      </nav>
    </div>
  );
};

export default Footer;
