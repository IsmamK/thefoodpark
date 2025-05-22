import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTruck, FaMapMarkerAlt, FaPhone, FaUser, FaTag, FaArrowRight, FaChevronLeft, FaArrowDown } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Checkout = () => {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderSummary, setOrderSummary] = useState({
    subtotal: '0.00',
    deliveryFee: '100.00',
    total: '100.00',
    discountAmount: '0.00',
    grandTotal: '100.00'
  });
  const [cartItems, setCartItems] = useState([]);
  const [orderId, setOrderId] = useState(null);

  // Load cart items and calculate initial order summary
// In the useEffect where you load cart items:
useEffect(() => {
  const items = JSON.parse(localStorage.getItem('cartItems') || '[]');
  setCartItems(Array.isArray(items) ? items : []);
  
  if (items.length > 0) {
    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    const deliveryFee = 100.00;
    const total = subtotal + deliveryFee;
    
    setOrderSummary({
      subtotal: subtotal.toFixed(2),
      deliveryFee: deliveryFee.toFixed(2),
      total: total.toFixed(2),
      discountAmount: '0.00',
      grandTotal: total.toFixed(2)
    });
  }
}, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Prepare the order data with nested order items
      
      const orderData = {
        name: formData.name,
        phone_number: formData.phone,
        shipping_address: formData.address,
        subtotal: orderSummary.subtotal,
        grandtotal: orderSummary.total,
        status: 'checkout',
        order_items: cartItems.map(item => ({
          product: item.id,  // Make sure this is just the ID, not the whole product object
          quantity: item.quantity
        }))
      };
  
      const response = await axios.post(`${apiUrl}/orders/`, orderData);
      setOrderId(response.data.id);
      setShowDiscountModal(true);
      
    } catch (error) {
      console.error('Error creating order:', error.response?.data);
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.non_field_errors?.[0] || 'Failed to proceed to checkout',
        icon: 'error',
        timer: 2000,
        showConfirmButton: false
      });
    }
  };

// Modify applyDiscount to update the existing order
const applyDiscount = async () => {
  if (!discountCode || !orderId) return;
  
  setIsApplyingDiscount(true);
  try {
    const response = await axios.post(`${apiUrl}/apply_discount/`, {
      discount_code: discountCode,
      cart_items: cartItems.map(item => ({
        id: item.id,
        price: parseFloat(item.price),
        quantity: item.quantity
      }))
    });

    const discountAmount = parseFloat(response.data.discount_amount || 0);
    const newTotal = parseFloat(orderSummary.total) - discountAmount;
    
    setOrderSummary(prev => ({
      ...prev,
      discountAmount: discountAmount.toFixed(2),
      grandTotal: newTotal.toFixed(2)
    }));

    // Update the order with discount code and new total
    await axios.patch(`${apiUrl}/orders/${orderId}/`, {
      discount_code: discountCode,
      grandtotal: newTotal.toFixed(2),
      subtotal: (newTotal - parseFloat(orderSummary.deliveryFee)).toFixed(2)
    });

    Swal.fire({
      title: 'Discount Applied!',
      text: `Discount of ৳${discountAmount.toFixed(2)} has been applied`,
      icon: 'success',
      timer: 750,
      showConfirmButton: false
    });
  } catch (error) {
    console.error('Error applying discount:', error);
    Swal.fire({
      title: 'Discount Error',
      text: error.response?.data?.error || 'Failed to apply discount code',
      icon: 'error',
      timer: 2000,
      showConfirmButton: false
    });
  } finally {
    setIsApplyingDiscount(false);
  }
};

// Modify placeOrder to update order status
const placeOrder = async () => {
  if (!orderId) {
    Swal.fire({
      title: 'Order Error',
      text: 'No order found to place',
      icon: 'error',
      timer: 1500,
      showConfirmButton: false
    });
    return;
  }

  setIsPlacingOrder(true);
  try {
    // Update the order status to "placed"
    const response = await axios.patch(`${apiUrl}/orders/${orderId}/`, {
      status: 'placed'
    });
    
    // Clear cart and show success
    localStorage.removeItem('cartItems');
    window.dispatchEvent(new Event('cartUpdated'));
    Swal.fire({
      title: `Order #${response.data.id} Confirmed!`,
      html: `
        <div style="text-align: left;">
          <div style="margin-bottom: 15px; font-size: 16px;">
            Thank you for your order! Here are your order details:
          </div>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <div style="font-weight: bold; margin-bottom: 10px;">Order Summary:</div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span>Order Number:</span>
              <span style="font-weight: bold;">#${response.data.id}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span>Order Date:</span>
              <span>${new Date().toLocaleDateString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span>Total Items:</span>
              <span>${cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span>Order Value:</span>
              <span style="font-weight: bold;">৳${orderSummary.grandTotal}</span>
            </div>
          </div>
    
          <div style="margin-bottom: 15px;">
            <div style="font-weight: bold; margin-bottom: 5px;">Delivery Address:</div>
            <div>${formData.address}</div>
          </div>
    
          <div style="margin-bottom: 15px; font-size: 15px; color: #28a745;">
            <i class="fas fa-check-circle"></i> Your order has been confirmed!
            <div style="font-size: 14px; margin-top: 5px;">
              Expected delivery within 2-3 business days
            </div>
          </div>
        </div>
      `,
      icon: 'success',
      showCloseButton: true,
      confirmButtonText: '<i class="fas fa-phone"></i> Call for Queries',
      cancelButtonText: '<i class="fas fa-shopping-bag"></i> Continue Shopping',
      showCancelButton: true,
      focusConfirm: false,
      customClass: {
       
        popup: 'order-confirmation-popup',
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-light'
      },
      buttonsStyling: false,
      didOpen: () => {
        // Add icons if FontAwesome is available
        if (window.FontAwesome) {
          const confirmButton = document.querySelector('.swal2-confirm');
          const cancelButton = document.querySelector('.swal2-cancel');
      
          // Add icons
          confirmButton.innerHTML = `<i class="fas fa-phone" style="margin-right: 8px;"></i> ${confirmButton.textContent}`;
          cancelButton.innerHTML = `<i class="fas fa-shopping-bag" style="margin-right: 8px;"></i> ${cancelButton.textContent}`;
        }
      
        // Style the buttons
        const confirmButton = document.querySelector('.swal2-confirm');
        const cancelButton = document.querySelector('.swal2-cancel');
        const actions = document.querySelector('.swal2-actions');
      
        if (confirmButton && cancelButton && actions) {
          // Make texts white
          confirmButton.style.color = 'white';
          cancelButton.style.color = 'white';
      
          // Add danger color to cancel button
          cancelButton.style.backgroundColor = '#d33'; // SweetAlert's danger red
          cancelButton.style.border = 'none';
      
          // Add spacing between buttons
          actions.style.display = 'flex';
          actions.style.gap = '1rem';
          actions.style.justifyContent = 'center';
        }
      }
      
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = 'tel:+8801887445596';
      } else {
        navigate('/');
      }
    });
    
  } catch (error) {
    console.error('Error placing order:', error);
    Swal.fire({
      title: 'Order Failed',
      text: error.response?.data?.error || 'Failed to place order',
      icon: 'error',
      timer: 2000,
      showConfirmButton: false
    });
  } finally {
    setIsPlacingOrder(false);
    setShowDiscountModal(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header with Back Button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex items-center"
        >
          <button 
            onClick={() => navigate(-1)}
            className="mr-4 flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-md hover:shadow-lg transition-all"
          >
            <FaChevronLeft className="text-blue-500" />
          </button>
          <div className="text-center flex-grow">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg mb-4">
              <FaTruck className="text-white text-2xl" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Shipping Details</h1>
            <p className="text-gray-600 mt-2">Enter your information to complete your order</p>
          </div>
          <div className="w-10"></div>
        </motion.div>

        {/* Shipping Form */}
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-8"
        >
          <div className="space-y-6">
            {/* Name Field */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="relative"
            >
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 py-3"
                  placeholder="John Doe"
                />
              </div>
            </motion.div>

            {/* Phone Field */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="relative"
            >
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaPhone className="text-gray-400" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 py-3"
                  placeholder="+880 1XXX XXXXXX"
                />
              </div>
            </motion.div>

            {/* Address Field */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="relative"
            >
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 pt-3 flex items-start pointer-events-none">
                  <FaMapMarkerAlt className="text-gray-400" />
                </div>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 py-3"
                  placeholder="House #123, Road #456, Sector #789, City"
                />
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center"
            >
              Discounts & Checkout
              <FaArrowRight className="ml-2" />
            </motion.button>
          </div>
        </motion.form>

        {/* Discount & Checkout Modal */}
        {showDiscountModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Summary</h2>
              
              {/* Discount Code Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Discount Code (Optional)</label>
                <div className="flex relative">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    className="flex-grow rounded-l-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 py-2 px-4"
                    placeholder="Enter promo code"
                  />
                   <FaArrowDown className={`${isApplyingDiscount || !discountCode ? `hidden` : "block"} absolute -top-5 right-4 text-gray-400 animate-bounce`} />

                  <button 
                    onClick={applyDiscount}
                    disabled={isApplyingDiscount || !discountCode}
                    className={`bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 rounded-r-lg transition-opacity ${
                      isApplyingDiscount || !discountCode ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                    }`}
                  >

                    {isApplyingDiscount ? '...' : <FaTag />}
                  </button>
                </div>
              </div>

              {/* Order Summary */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">৳{orderSummary.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium">৳{orderSummary.deliveryFee}</span>
                </div>
                {parseFloat(orderSummary.discountAmount) > 0 && (
                  <>
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span className="font-medium">-৳{orderSummary.discountAmount}</span>
                    </div>
                    <div className="border-t border-gray-200 my-2"></div>
                  </>
                )}
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-blue-600">৳{orderSummary.grandTotal}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowDiscountModal(false)}
                  className="flex-grow bg-gray-200 text-gray-800 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={placeOrder}
                  disabled={isPlacingOrder}
                  className={`flex-grow bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 rounded-lg font-medium transition-all ${
                    isPlacingOrder ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
                  }`}
                >
                  {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;