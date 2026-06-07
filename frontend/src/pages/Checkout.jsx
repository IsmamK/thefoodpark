import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTruck, FaMapMarkerAlt, FaPhone, FaUser, FaArrowRight, FaChevronLeft, FaEnvelope, FaTag, FaInfoCircle, FaCheckCircle, FaTimes, FaEdit, FaShoppingCart } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Checkout = () => {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;
  const [showDiscountInput, setShowDiscountInput] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    email: ''
  });

  const [orderSummary, setOrderSummary] = useState({
    subtotal: '0.00',
    deliveryFee: '100.00',
    total: '100.00',
    discountAmount: '0.00',
    grandTotal: '100.00',
  });

  const [cartItems, setCartItems] = useState([]);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [showOrderReview, setShowOrderReview] = useState(false);
  const [orderId, setOrderId] = useState(null);

  // Track checkout initiation
  const trackCheckout = async () => {
    try {
      await axios.post(`${apiUrl}/track/checkout/`, {
        checkout: {
          items: cartItems.map(item => ({
            id: item.id,
            title: item.title,
            price: parseFloat(item.price),
            quantity: item.quantity
          })),
          value: parseFloat(orderSummary.total),
          currency: 'BDT',
          user_email: formData.email || null,
          user_phone: formData.phone || null
        }
      });
    } catch (err) {
      console.error('Error tracking checkout:', err);
    }
  };

  // Track purchase completion
  const trackPurchase = async (orderId) => {
    try {
      await axios.post(`${apiUrl}/track/purchase/`, {
        purchase: {
          order_id: orderId.toString(),
          items: cartItems.map(item => ({
            id: item.id,
            title: item.title,
            price: parseFloat(item.price),
            quantity: item.quantity
          })),
          value: parseFloat(orderSummary.grandTotal),
          currency: 'BDT',
          user_email: formData.email || null,
          user_phone: formData.phone || null
        }
      });
    } catch (err) {
      console.error('Error tracking purchase:', err);
    }
  };

  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      console.log('Mobile browser detected - applying mobile optimizations');
    }
  }, []);

  useEffect(() => {
    const loadCartData = () => {
      const orderData = JSON.parse(localStorage.getItem('currentOrder')) || {};
      setCartItems(orderData.items || []);
      setOrderSummary({
        subtotal: orderData.subtotal || '0.00',
        deliveryFee: orderData.deliveryFee || '100.00',
        total: orderData.total || '100.00',
        discountAmount: '0.00',
        grandTotal: orderData.total || '100.00',
      });
    };

    loadCartData();
    window.addEventListener('cartUpdated', loadCartData);
    return () => window.removeEventListener('cartUpdated', loadCartData);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const applyDiscount = async () => {
    if (!discountCode || !orderId) return;

    setIsApplyingDiscount(true);
    try {
      // 1. Apply discount to calculate amounts
      const applyResponse = await axios.post(`${apiUrl}/apply_discount/`, {
        discount_code: discountCode,
        cart_items: cartItems.map(item => ({
          id: item.id,
          price: parseFloat(item.price),
          quantity: item.quantity,
        })),
      });

      const discountAmount = parseFloat(applyResponse.data.discount_amount || 0);
      const newTotal = parseFloat(orderSummary.total) - discountAmount;

      // 2. Get discount details
      const discountResponse = await axios.get(`${apiUrl}/discounts/?code=${discountCode}`);
      if (discountResponse.data.length === 0) {
        throw new Error('Discount not found');
      }
      const discountId = discountResponse.data[0].id;

      // 3. Update order with discount
      await axios.patch(`${apiUrl}/orders/${orderId}/`, {
        discount: discountId,
        grandtotal: newTotal.toFixed(2),
        subtotal: (newTotal - parseFloat(orderSummary.deliveryFee)).toFixed(2),
      });

      // Update local state
      setOrderSummary(prev => ({
        ...prev,
        discountAmount: discountAmount.toFixed(2),
        grandTotal: newTotal.toFixed(2),
      }));

      Swal.fire({
        title: 'Discount Applied!',
        text: `You saved ৳${discountAmount.toFixed(2)}`,
        icon: 'success',
        timer: 1000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Discount error:', error);
      Swal.fire({
        title: 'Discount Error',
        text: error.response?.data?.error || 'Invalid discount code',
        icon: 'error',
        timer: 2000,
        showConfirmButton: false,
      });
    } finally {
      setIsApplyingDiscount(false);
    }
  };


const saveCustomerInfo = async () => {
  try {
    // Ensure all prices are numbers
    const subtotalNum = parseFloat(orderSummary.subtotal);
    const grandtotalNum = parseFloat(orderSummary.total);
    
    const orderData = {
      name: formData.name,
      phone_number: formData.phone,
      shipping_address: formData.address,
      email: formData.email || '',
      subtotal: subtotalNum,
      grandtotal: grandtotalNum,
      status: 'checkout',
      order_items: cartItems.map(item => ({
        product: item.id,  // Can be null for custom items
        product_name: item.title,  // Always provide a name
        price: parseFloat(item.price),
        quantity: item.quantity
      })),
    };

    console.log('Sending order data:', JSON.stringify(orderData, null, 2));

    const response = await axios.post(`${apiUrl}/orders/`, orderData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 15000, // 15 second timeout
    });
    
    console.log('Order created successfully:', response.data);
    setOrderId(response.data.id);
    
    // Track checkout event after saving customer info
    await trackCheckout();
    
    return true;
  } catch (error) {
    console.error('Order creation error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      data: error.response?.data
    });
    
    // Show detailed error message
    let errorMessage = 'Failed to save your information.';
    if (error.response?.data?.details) {
      errorMessage = `Validation error: ${JSON.stringify(error.response.data.details)}`;
    } else if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    }
    
    Swal.fire({
      title: 'Connection Issue',
      html: `
        <div class="text-center">
          <p class="mb-2">${errorMessage}</p>
          <p class="text-sm text-gray-600">Please check your information and try again.</p>
          ${error.response?.data?.details ? 
            `<p class="text-xs text-red-600 mt-2">${JSON.stringify(error.response.data.details)}</p>` 
            : ''}
        </div>
      `,
      icon: 'error',
      confirmButtonColor: '#eab308',
    });
    return false;
  }
};

  const placeOrder = async () => {
    setIsPlacingOrder(true);
    
    try {
      // Mobile-friendly order placement with timeout
      const response = await Promise.race([
        axios.patch(`${apiUrl}/orders/${orderId}/`, {
          status: 'placed',
          grandtotal: orderSummary.grandTotal,
          name: formData.name,
          phone_number: formData.phone,
          shipping_address: formData.address,
          email: formData.email || '',
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Order placement timeout')), 10000)
        )
      ]);

      // Clear cart and show success
      localStorage.removeItem('cartItems');
      localStorage.removeItem('currentOrder');
      window.dispatchEvent(new Event('cartUpdated'));

      // Track purchase event after successful order placement
      await trackPurchase(response.data.id);
      
      showSuccessModal(response.data.id);
      
    } catch (error) {
      console.error('Order placement error:', error);
      Swal.fire({
        title: 'Order Issue',
        html: `
          <div class="text-center">
            <p class="mb-2">${error.message.includes('timeout') ? 
              'Request took too long' : 'Failed to complete order'}.</p>
            <p class="text-sm text-gray-600">Please check your connection and try again.</p>
            ${/Android|iPhone/i.test(navigator.userAgent) ? 
              '<p class="text-xs mt-2">Tip: Try switching from mobile data to WiFi</p>' : ''}
          </div>
        `,
        icon: 'error',
        confirmButtonColor: '#eab308',
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

const SUPPORT_PHONE_DISPLAY = '01867064955';
const SUPPORT_PHONE_CALL = '+8801867064955';
const SUPPORT_PHONE_WHATSAPP = '8801867064955';

const escapeHtml = (value = '') =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const getOrderItemsText = () =>
  cartItems
    .map((item, index) => {
      const itemTotal = (parseFloat(item.price || 0) * item.quantity).toFixed(2);
      return `${index + 1}. ${item.title}\n   Qty: ${item.quantity}\n   Unit Price: ৳${item.price}\n   Item Total: ৳${itemTotal}`;
    })
    .join('\n\n');

const getOrderItemsHtml = () =>
  cartItems
    .map((item) => {
      const itemTotal = (parseFloat(item.price || 0) * item.quantity).toFixed(2);

      return `
        <div class="border-b border-gray-100 pb-2 mb-2 last:border-b-0 last:mb-0 last:pb-0">
          <div class="flex justify-between gap-3">
            <div>
              <p class="font-semibold text-gray-900">${escapeHtml(item.title)}</p>
              <p class="text-xs text-gray-500">Qty: ${item.quantity} × ৳${item.price}</p>
            </div>
            <p class="font-semibold text-gray-900 whitespace-nowrap">৳${itemTotal}</p>
          </div>
        </div>
      `;
    })
    .join('');

const getSupportWhatsAppMessage = (orderId) =>
  encodeURIComponent(
    `Hello, I need help with my order.\n\n` +
    `Order Details:\n` +
    `Order ID: ${orderId}\n` +
    `Name: ${formData.name}\n` +
    `Phone: ${formData.phone}\n` +
    `Email: ${formData.email || 'Not provided'}\n` +
    `Delivery Address: ${formData.address}\n\n` +
    `Items:\n${getOrderItemsText()}\n\n` +
    `Payment Summary:\n` +
    `Subtotal: ৳${orderSummary.subtotal}\n` +
    `Discount: ৳${orderSummary.discountAmount}\n` +
    `Delivery Fee: ৳${orderSummary.deliveryFee}\n` +
    `Grand Total: ৳${orderSummary.grandTotal}`
  );

const showSuccessModal = (orderId) => {
  Swal.fire({
    title: `
      <div class="flex flex-col items-center">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg class="text-green-500 w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15 5.293 11.879a1 1 0 111.414-1.414L8.414 12.172l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </div>
        <h3 class="text-xl sm:text-2xl font-bold text-gray-900">Order Confirmed!</h3>
      </div>
    `,
    html: `
      <div class="text-left mt-2">
        <p class="text-gray-700 mb-4 text-sm sm:text-base text-center">
          Thanks <strong>${escapeHtml(formData.name)}</strong>! Your order was placed successfully.
        </p>

        <div class="bg-yellow-50 rounded-xl p-3 sm:p-4 mb-4 border border-yellow-200">
          <h4 class="font-bold text-gray-900 mb-3 text-sm sm:text-base">Order Details</h4>

          <div class="space-y-2 text-xs sm:text-sm">
            <div class="flex justify-between gap-3">
              <span class="text-gray-600">Order ID:</span>
              <span class="font-semibold text-gray-900">#${orderId}</span>
            </div>

            <div class="flex justify-between gap-3">
              <span class="text-gray-600">Name:</span>
              <span class="font-semibold text-gray-900 text-right">${escapeHtml(formData.name)}</span>
            </div>

            <div class="flex justify-between gap-3">
              <span class="text-gray-600">Phone:</span>
              <span class="font-semibold text-gray-900 text-right">${escapeHtml(formData.phone)}</span>
            </div>

            ${
              formData.email
                ? `
                  <div class="flex justify-between gap-3">
                    <span class="text-gray-600">Email:</span>
                    <span class="font-semibold text-gray-900 text-right">${escapeHtml(formData.email)}</span>
                  </div>
                `
                : ''
            }

            <div class="flex justify-between gap-3">
              <span class="text-gray-600">Delivery:</span>
              <span class="font-semibold text-gray-900 text-right max-w-[180px]">${escapeHtml(formData.address)}</span>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl p-3 sm:p-4 mb-4 border border-gray-200">
          <h4 class="font-bold text-gray-900 mb-3 text-sm sm:text-base">Items Ordered</h4>
          <div class="max-h-52 overflow-y-auto pr-1 text-xs sm:text-sm">
            ${getOrderItemsHtml()}
          </div>
        </div>

        <div class="bg-gray-50 rounded-xl p-3 sm:p-4 mb-4 border border-gray-200">
          <h4 class="font-bold text-gray-900 mb-3 text-sm sm:text-base">Payment Summary</h4>

          <div class="space-y-2 text-xs sm:text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Subtotal</span>
              <span class="font-medium">৳${orderSummary.subtotal}</span>
            </div>

            ${
              parseFloat(orderSummary.discountAmount) > 0
                ? `
                  <div class="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span class="font-medium">-৳${orderSummary.discountAmount}</span>
                  </div>
                `
                : ''
            }

            <div class="flex justify-between">
              <span class="text-gray-600">Delivery Fee</span>
              <span class="font-medium">৳${orderSummary.deliveryFee}</span>
            </div>

            <div class="border-t border-gray-200 pt-2 mt-2 flex justify-between">
              <span class="font-bold text-gray-900">Grand Total</span>
              <span class="font-bold text-yellow-600">৳${orderSummary.grandTotal}</span>
            </div>
          </div>
        </div>

        <div class="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
          <p class="text-xs sm:text-sm text-green-700">
            We will contact you at <strong>${escapeHtml(formData.phone)}</strong> to confirm delivery.
          </p>
        </div>
      </div>
    `,
    showCancelButton: true,
showDenyButton: true,

confirmButtonText: `WhatsApp Us`,
denyButtonText: `Call Us`,
cancelButtonText: `Continue Shopping`,

confirmButtonColor: '#22c55e',
denyButtonColor: '#facc15',
cancelButtonColor: '#e5e7eb',
    focusConfirm: false,
    customClass: {
      popup: 'rounded-2xl shadow-xl px-4 sm:px-6 pt-3 sm:pt-4 pb-4 sm:pb-6 max-w-[94vw] sm:max-w-lg',
confirmButton: 'bg-green-500 text-white font-medium hover:bg-green-600 px-3 sm:px-4 mr-2 py-2 rounded-lg text-sm sm:text-base',
denyButton: 'bg-yellow-400 text-gray-900 font-medium hover:bg-yellow-500 px-3 sm:px-4 mx-2 py-2 rounded-lg text-sm sm:text-base',
cancelButton: 'bg-gray-200 text-gray-800 hover:bg-gray-300 px-3 sm:px-4 py-2 ml-2 rounded-lg text-sm sm:text-base',
      title: 'px-0',
      htmlContainer: 'mx-0',
    },
    buttonsStyling: false,
    showCloseButton: true,
 }).then((result) => {
  if (result.isConfirmed) {
    window.open(
      `https://wa.me/${SUPPORT_PHONE_WHATSAPP}?text=${getSupportWhatsAppMessage(orderId)}`,
      '_blank'
    );
  } else if (result.isDenied) {
    window.location.href = `tel:${SUPPORT_PHONE_CALL}`;
  } else if (result.isDismissed) {
    navigate('/');
  }
});
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.address) {
      Swal.fire({
        title: 'Missing Information',
        text: 'Please fill in all required fields',
        icon: 'warning',
        confirmButtonColor: '#eab308',
      });
      return;
    }

    setIsPlacingOrder(true);
    const saved = await saveCustomerInfo();
    setIsPlacingOrder(false);

    if (saved) {
      setShowOrderReview(true);
    }
  };

  const editCart = () => {
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-amber-50 py-6 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-yellow-100 transition mr-3 text-yellow-600"
          >
            <FaChevronLeft size={16} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            <span className="text-yellow-500">Checkout</span>
          </h1>
        </div>

        {/* Delivery Notice */}
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-3 rounded-lg mb-6 flex items-start">
          <FaInfoCircle className="text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <p className="font-semibold text-yellow-800">Delivery Area</p>
            <p className="text-sm text-yellow-700">Currently serving <span className="font-bold">Dhaka city only</span>. Orders outside Dhaka cannot be fulfilled.</p>
          </div>
        </div>

        {/* Order Items - Always Visible */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-gray-900 flex items-center">
              <FaShoppingCart className="text-yellow-500 mr-2" />
              Your Order ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
            </h3>
            <button 
              onClick={editCart}
              className="text-sm text-yellow-600 hover:text-yellow-700 flex items-center"
            >
              <FaEdit className="mr-1" /> Edit
            </button>
          </div>
          
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {cartItems.length > 0 ? (
              cartItems.map((item, index) => (
                <div key={index} className="flex justify-between items-start border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <div className="flex-1">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-medium ml-4">৳{(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Your cart is empty</p>
            )}
          </div>
        </div>

        {/* Customer Info Form - shown when not in review mode */}
        {!showOrderReview ? (
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FaUser className="mr-2 text-yellow-600" /> Name
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FaPhone className="mr-2 text-yellow-600" /> Phone
              </label>
              <input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="01XXXXXXXXX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FaEnvelope className="mr-2 text-yellow-600" /> Email (Optional)
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FaMapMarkerAlt className="mr-2 text-yellow-600" /> Delivery Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="Full address in Dhaka (House/Flat #, Road #, Area)"
              />
              <p className="text-xs text-gray-500 mt-1">Please include all details for accurate delivery</p>
            </div>

            <button
              type="submit"
              disabled={isPlacingOrder || cartItems.length === 0}
              className={`w-full py-3 rounded-xl font-bold text-white shadow-md transition
                ${isPlacingOrder || cartItems.length === 0
                  ? 'bg-yellow-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:shadow-lg'
                } flex items-center justify-center`}
            >
              {isPlacingOrder ? 'Saving...' : 'Review Order'}
              <FaArrowRight className="ml-2" />
            </button>
          </form>
        ) : (
          /* Order Review Section */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                <span className="text-yellow-500">Review Your Order</span>
              </h2>
              <button 
                onClick={() => setShowOrderReview(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition text-gray-500"
              >
                <FaTimes size={16} />
              </button>
            </div>

            {/* Customer Info Review */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-4 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-3">Contact Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name</span>
                  <span className="font-medium">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone</span>
                  <span className="font-medium">{formData.phone}</span>
                </div>
                {formData.email && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email</span>
                    <span className="font-medium">{formData.email}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Address</span>
                  <span className="text-right font-medium">{formData.address}</span>
                </div>
              </div>
            </div>

            {/* Discount Section */}
            {!showDiscountInput ? (
              <button
                type="button"
                onClick={() => setShowDiscountInput(true)}
                className="w-full bg-white rounded-xl shadow-sm p-4 mb-4 border border-gray-200 hover:bg-gray-50 transition flex items-center justify-between"
              >
                <div className="flex items-center">
                  <FaTag className="text-yellow-500 mr-2" />
                  <span className="font-medium text-gray-700">Have a discount code?</span>
                </div>
                <FaArrowRight className="text-yellow-500" />
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-xl shadow-sm p-4 mb-4 border border-gray-200"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-gray-900 flex items-center">
                    <FaTag className="text-yellow-500 mr-2" />
                    Apply Discount
                  </h3>
                  <button 
                    onClick={() => setShowDiscountInput(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes />
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder="Enter discount code"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                  <button
                    onClick={applyDiscount}
                    disabled={isApplyingDiscount || !discountCode.trim()}
                    className={`px-3 py-2 rounded-lg font-medium ${
                      isApplyingDiscount || !discountCode.trim()
                        ? 'bg-gray-200 text-gray-500'
                        : 'bg-yellow-500 text-white hover:bg-yellow-600'
                    }`}
                  >
                    {isApplyingDiscount ? 'Applying...' : 'Apply'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                <FaTruck className="text-yellow-500 mr-2" />
                Order Summary
              </h3>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>৳{orderSummary.subtotal}</span>
                </div>
                {parseFloat(orderSummary.discountAmount) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-৳{orderSummary.discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>
                  <span>৳{orderSummary.deliveryFee}</span>
                </div>
                <div className="border-t border-gray-200 my-2"></div>
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-yellow-600">৳{orderSummary.grandTotal}</span>
                </div>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              onClick={placeOrder}
              disabled={isPlacingOrder}
              className={`w-full py-3 rounded-xl font-bold text-white shadow-md transition
                ${isPlacingOrder 
                  ? 'bg-yellow-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:shadow-lg'
                } flex items-center justify-center`}
            >
              {isPlacingOrder ? 'Placing Order...' : 'Confirm & Place Order'}
              <FaArrowRight className="ml-2" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Checkout;