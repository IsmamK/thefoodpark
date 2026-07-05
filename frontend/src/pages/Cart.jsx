// Updated Cart.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';
import { FaTrash, FaMinus, FaPlus, FaArrowRight, FaChevronLeft } from 'react-icons/fa';
import { Snowflake } from 'lucide-react';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const items = JSON.parse(localStorage.getItem('cartItems')) || [];
      const validItems = items.filter(item => item.id && item.price && item.quantity);
      setCartItems(validItems);
      setLoading(false);
    } catch (error) {
      console.error("Error loading cart:", error);
      setCartItems([]);
      setLoading(false);
    }
  }, []);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    const updatedItems = cartItems.map(item =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedItems);
    localStorage.setItem('cartItems', JSON.stringify(updatedItems));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeItem = (id) => {
    Swal.fire({
      title: 'Remove Item?',
      text: "Are you sure you want to remove this item from your cart?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#eab308',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, remove it!',
      background: '#fff',
      customClass: {
        popup: 'rounded-3xl shadow-lg',
        title: 'text-yellow-600 font-bold',
        content: 'text-gray-700',
        confirmButton: 'bg-yellow-500 hover:bg-yellow-600',
        cancelButton: 'bg-gray-600 hover:bg-gray-700'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedItems = cartItems.filter(item => item.id !== id);
        setCartItems(updatedItems);
        localStorage.setItem('cartItems', JSON.stringify(updatedItems));
        window.dispatchEvent(new Event('cartUpdated'));
        Swal.fire({
          title: 'Removed!',
          text: 'Item removed from cart.',
          icon: 'success',
          confirmButtonColor: '#22c55e',
        });
      }
    });
  };

  const subtotal = cartItems.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0).toFixed(2);
  const deliveryFee = 100.00;
  const total = (parseFloat(subtotal) + deliveryFee).toFixed(2);

  const proceedToCheckout = () => {
    if (cartItems.length === 0) {
      Swal.fire({
        title: 'Empty Cart',
        text: 'Please add items before proceeding.',
        icon: 'info',
        confirmButtonColor: '#eab308',
      });
      return;
    }

    const orderSummary = {
      subtotal,
      deliveryFee,
      total,
      items: cartItems,
      date: new Date().toISOString()
    };

    localStorage.setItem('currentOrder', JSON.stringify(orderSummary));
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-12 w-12 border-4 border-yellow-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  
  return (
    <div className="min-h-screen bg-gradient-to-r from-yellow-50 to-amber-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white bg-opacity-80 backdrop-blur-sm border-b border-gray-200 py-4 px-4">
        <div className="max-w-2xl mx-auto flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-all mr-3 text-yellow-600"
            aria-label="Go back"
          >
            <FaChevronLeft size={16} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">
            <span className="text-yellow-500">Your Cart</span>
          </h1>
          <div className="ml-auto bg-yellow-100 px-3 py-1 rounded-full text-xs font-medium text-yellow-800 flex items-center">
            <Snowflake className="w-3 h-3 mr-1" />
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 pb-24 pt-4 px-4">
        <div className="max-w-2xl mx-auto">
          {cartItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center h-[60vh] text-center"
            >
              <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
                <Snowflake className="w-10 h-10 text-yellow-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-600 mb-6 max-w-xs">Add some delicious frozen items to get started</p>
              <Link
                to="/"
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg font-medium transition-all"
              >
                Browse Menu
              </Link>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              {cartItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-100"
                >
                  <div className="p-3 flex items-center gap-3">
                    <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-yellow-50 to-amber-100 rounded-lg overflow-hidden flex items-center justify-center">
                      <img
                        src={item.image}
                        alt={item.title}
                        loading="lazy"
                        decoding="async"
                        width="64"
                        height="64"
                        className="h-full w-full object-cover object-center"
                      />
                    </div>

                    <div className="flex-grow min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">
                            {item.title}
                          </h3>
                          <p className="text-xs text-gray-500 line-clamp-1">
                            {item.description}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-amber-500 hover:text-amber-600 transition-colors ml-2"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                          >
                            <FaMinus size={10} />
                          </button>
                          <span className="text-sm font-medium text-gray-900 w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                          >
                            <FaPlus size={10} />
                          </button>
                        </div>

                        <p className="text-sm font-bold text-gray-900">
                          ৳{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>

      {/* Sticky Footer - Only shown when cart has items */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-4 shadow-lg">
          <div className="max-w-2xl mx-auto flex justify-between items-center">
            <div>
              <div className="text-xs text-gray-500">Total</div>
              <div className="text-lg font-bold text-yellow-600">
                ৳{total}
              </div>
            </div>
            <button
              onClick={proceedToCheckout}
              className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-6 py-3 rounded-lg font-semibold text-sm shadow-sm hover:shadow-md transition flex items-center"
            >
              Checkout
              <FaArrowRight className="ml-2" size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
