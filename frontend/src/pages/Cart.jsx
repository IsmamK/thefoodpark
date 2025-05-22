import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';
import { FaTrash, FaMinus, FaPlus, FaArrowRight, FaChevronLeft } from 'react-icons/fa';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load cart items from localStorage
  useEffect(() => {
    const items = JSON.parse(localStorage.getItem('cartItems')) || [];
    setCartItems(items);
    setLoading(false);
  }, []);

  // Update quantity
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    const updatedItems = cartItems.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedItems);
    localStorage.setItem('cartItems', JSON.stringify(updatedItems));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  // Remove item
  const removeItem = (id) => {
    Swal.fire({
      title: 'Remove Item?',
      text: "Are you sure you want to remove this item from your cart?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, remove it!',
      background: '#ffffff',
      customClass: {
        popup: 'rounded-2xl shadow-2xl'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedItems = cartItems.filter(item => item.id !== id);
        setCartItems(updatedItems);
        localStorage.setItem('cartItems', JSON.stringify(updatedItems));
        window.dispatchEvent(new Event('cartUpdated'));
        Swal.fire({
          title: 'Removed!',
          text: 'Your item has been removed.',
          icon: 'success',
          confirmButtonColor: '#10b981'
        });
      }
    });
  };

  // Totals
  const subtotal = cartItems.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0).toFixed(2);
  const deliveryFee = 100.00;
  const total = (parseFloat(subtotal) + deliveryFee).toFixed(2);

  // Proceed to Checkout
  const proceedToCheckout = () => {
    const orderSummary = {
      subtotal,
      deliveryFee,
      total,
      items: cartItems,
      date: new Date().toISOString()
    };
    const existingOrders = JSON.parse(localStorage.getItem('totalCollections')) || [];
    const updatedOrders = [...existingOrders, orderSummary];
    localStorage.setItem('totalCollections', JSON.stringify(updatedOrders));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-12 w-12 rounded-full border-4 border-t-transparent border-indigo-500"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center mb-8"
        >
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-md hover:shadow-lg transition-all mr-4"
          >
            <FaChevronLeft className="text-indigo-600" />
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Your Shopping Cart</h1>
        </motion.div>

        {/* Empty Cart */}
        {cartItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
              <div className="h-40 bg-gradient-to-r from-indigo-400 via-white to-purple-500 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <div className="text-white text-7xl animate-bounce">🛒</div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Your cart feels lonely</h3>
              <p className="text-gray-500 mb-6">Add some delicious items to get started!</p>
              <Link 
                to="/"
                className="inline-block bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all hover:scale-105"
              >
                Explore Menu
              </Link>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Items */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-6 mb-8"
            >
              {cartItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  <div className="p-2 sm:p-6 flex flex-col sm:flex-row gap-4">
                    <div className="flex-shrink-0">
                      <div className="h-16 w-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg overflow-hidden flex items-center justify-center shadow-inner">
                        <img 
                          src={item.image} 
                          alt={item.title}
                          className="h-full w-full object-cover object-center transform hover:scale-110 transition-transform"
                        />
                      </div>
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">{item.title}</h3>
                          <p className="text-gray-600 text-sm line-clamp-2 text-wrap">{item.description}</p>
                        </div>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700 transition-colors transform hover:scale-110"
                        >
                          <FaTrash />
                        </button>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full hover:from-indigo-200 hover:to-purple-200 transition-all shadow-sm"
                          >
                            <FaMinus className="text-indigo-600" />
                          </button>
                          <span className="text-lg font-medium w-8 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full hover:from-indigo-200 hover:to-purple-200 transition-all shadow-sm"
                          >
                            <FaPlus className="text-indigo-600" />
                          </button>
                        </div>
                        <span className="text-lg font-bold text-indigo-600">
                          ৳{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Summary */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-2xl shadow-2xl p-6 sticky bottom-4 border border-indigo-100"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">৳{subtotal}</span>
              </div>
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="font-medium">৳{deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold mb-6">
                <span>Total</span>
                <span className="text-indigo-600">৳{total}</span>
              </div>
              <Link to="/checkout">
                <button 
                  onClick={proceedToCheckout}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center transform hover:scale-[1.01] active:scale-95"
                >
                  Address, Discounts & Checkout
                  <FaArrowRight className="ml-2 animate-pulse" />
                </button>
              </Link>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;
