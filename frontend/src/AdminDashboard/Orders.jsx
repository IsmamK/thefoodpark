import React,{ useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiRefreshCw, FiChevronDown, FiChevronUp, FiPackage, 
  FiCheckCircle, FiTruck, FiShoppingBag, FiXCircle, 
  FiCopy, FiEdit2, FiArchive, FiTruck as FiShipping, 
  FiCheck, FiDollarSign, FiBox, FiList,
  FiBarChart2,
  FiTrendingUp,
  FiUser
} from 'react-icons/fi';
import Swal from 'sweetalert2';
import { a } from 'framer-motion/client';

const Orders = () => {
  const [activeTab, setActiveTab] = useState('placed');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [copiedData, setCopiedData] = useState('');
  const [showCopyToast, setShowCopyToast] = useState(false);


  const apiUrl = import.meta.env.VITE_API_URL;     

  const statusCategories = [
    { id: 'placed', label: 'Placed', icon: <FiRefreshCw className="mr-1" />, color: 'bg-yellow-100 text-yellow-800' },
    { id: 'checkout', label: 'Checked Out', icon: <FiShoppingBag className="mr-1" />, color: 'bg-blue-100 text-blue-800' },
    { id: 'shipped', label: 'Shipped', icon: <FiTruck className="mr-1" />, color: 'bg-indigo-100 text-indigo-800' },
    { id: 'delivered', label: 'Delivered', icon: <FiCheckCircle className="mr-1" />, color: 'bg-green-100 text-green-800' },
    { id: 'cancelled', label: 'Cancelled', icon: <FiXCircle className="mr-1" />, color: 'bg-red-100 text-red-800' }
  ];

  useEffect(() => {
    fetchOrders(activeTab);
    setSelectedOrders([]);
    setSelectAll(false);
  }, [activeTab]);

  const fetchOrders = async (status) => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/orders/?status=${status}&expand=order_items.product`);
      const data = await response.json();
      const sortedOrders = data.sort((a, b) => 
        new Date(b.order_time.replace(',', '')) - new Date(a.order_time.replace(',', '')))
      setOrders(sortedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const filteredOrders = orders.filter(order => 
    order.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.id.toString().includes(searchQuery) ||
    order.phone_number.includes(searchQuery)
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const statusMap = {
      placed: 'bg-yellow-100 text-yellow-800',
      checkout: 'bg-blue-100 text-blue-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const result = await Swal.fire({
        title: 'Confirm Status Update',
        text: `Are you sure you want to change this order to ${newStatus}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, update it!'
      });

      if (result.isConfirmed) {
        const response = await fetch(`${apiUrl}/orders/${orderId}/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
          await Swal.fire(
            'Updated!',
            `Order status has been changed to ${newStatus}.`,
            'success'
          );
          setOrders(orders.filter(order => order.id !== orderId));
          setSelectedOrders(selectedOrders.filter(id => id !== orderId));
        } else {
          throw new Error('Failed to update status');
        }
      }
    } catch (error) {
      Swal.fire(
        'Error!',
        'There was an error updating the order status.',
        'error'
      );
      console.error('Error updating order status:', error);
    }
  };

  const bulkUpdateStatus = async (newStatus) => {
    try {
      if (selectedOrders.length === 0) {
        Swal.fire('No orders selected', 'Please select orders to update', 'warning');
        return;
      }

      const result = await Swal.fire({
        title: 'Confirm Bulk Update',
        text: `Are you sure you want to change ${selectedOrders.length} orders to ${newStatus}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, update all!'
      });

      if (result.isConfirmed) {
        const responses = await Promise.all(
          selectedOrders.map(orderId => 
            fetch(`${apiUrl}/orders/${orderId}/`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ status: newStatus })
            })
          )
        );

        const allSuccess = responses.every(response => response.ok);
        
        if (allSuccess) {
          await Swal.fire(
            'Updated!',
            `${selectedOrders.length} orders have been changed to ${newStatus}.`,
            'success'
          );
          setOrders(orders.filter(order => !selectedOrders.includes(order.id)));
          setSelectedOrders([]);
          setSelectAll(false);
        } else {
          throw new Error('Some updates failed');
        }
      }
    } catch (error) {
      Swal.fire(
        'Error!',
        'There was an error updating some order statuses.',
        'error'
      );
      console.error('Error in bulk update:', error);
    }
  };

  const getNextStatusAction = (currentStatus) => {
    switch(currentStatus) {
      case 'placed':
        return { label: 'Mark as Checked Out', nextStatus: 'checkout' };
      case 'checkout':
        return { label: 'Mark as Shipped', nextStatus: 'shipped' };
      case 'shipped':
        return { label: 'Mark as Delivered', nextStatus: 'delivered' };
      default:
        return null;
    }
  };

  const toggleSelectOrder = (orderId) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId) 
        : [...prev, orderId]
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(order => order.id));
    }
    setSelectAll(!selectAll);
  };

  const copySelectedOrdersData = () => {
    if (selectedOrders.length === 0) {
      Swal.fire('No orders selected', 'Please select orders to copy', 'warning');
      return;
    }
  
    const selectedOrdersData = orders.filter(order => selectedOrders.includes(order.id));
  
    let formattedText = '';
    selectedOrdersData.forEach((order, index) => {
      formattedText += `${index + 1})\n\nCustomer Name: ${order.name}\nPhone No: ${order.phone_number}\nAddress: ${order.shipping_address}\n\nOrder Items: ${order.order_items.map(item => `${item.product} (x${item.quantity})`).join(', ')}\n\nGrandtotal: BDT ${parseFloat(order.grandtotal).toFixed(2)}\nDelivery Charge: BDT 100\n\nTotal Bill: BDT ${(parseFloat(order.grandtotal) + 100).toFixed(2)}\n\n\n\n`;
    });
  
    navigator.clipboard.writeText(formattedText)
      .then(() => {
        setCopiedData(formattedText);
        setShowCopyToast(true);
        setTimeout(() => setShowCopyToast(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        Swal.fire('Copy Failed', 'Could not copy to clipboard.', 'error');
      });
  };
  
  

  // Calculate order summary statistics
  const calculateOrderSummary = () => {
    const itemDetails = {};
    let totalValue = 0;
  
    filteredOrders.forEach(order => {
      totalValue += parseFloat(order.grandtotal);
      order.order_items.forEach(item => {
        const itemName = `Product ID: ${item.product}`; // Fallback to product ID if title is missing
        if (!itemDetails[itemName]) {
          itemDetails[itemName] = {
            quantity: 0,
            total: 0
          };
        }
        itemDetails[itemName].quantity += item.quantity;
        // Use order's subtotal divided by items if individual prices aren't available
        itemDetails[itemName].total += item.quantity * (item.price || (parseFloat(order.subtotal) / order.order_items.length));
      });
    });
  
    return {
      totalOrders: filteredOrders.length,
      totalValue,
      itemDetails
    };
  };
  

  const orderSummary = calculateOrderSummary();

  // Bulk action buttons data with proper labels
  const bulkActions = [
    { 
      label: 'Mark as Placed', 
      icon: <FiShoppingBag className="mr-1" />,
      action: () => bulkUpdateStatus('placed'),
      color: 'bg-blue-100 hover:bg-blue-200 text-blue-800',
      description: 'Move to Checked Out'
    },
    { 
      label: 'Mark as Checked Out', 
      icon: <FiShoppingBag className="mr-1" />,
      action: () => bulkUpdateStatus('checkout'),
      color: 'bg-blue-100 hover:bg-blue-200 text-blue-800',
      description: 'Move to Checked Out'
    },
    { 
      label: 'Mark as Shipped', 
      icon: <FiShipping className="mr-1" />,
      action: () => bulkUpdateStatus('shipped'),
      color: 'bg-indigo-100 hover:bg-indigo-200 text-indigo-800',
      description: 'Mark as Shipped'
    },
    { 
      label: 'Mark as Delivered', 
      icon: <FiCheck className="mr-1" />,
      action: () => bulkUpdateStatus('delivered'),
      color: 'bg-green-100 hover:bg-green-200 text-green-800',
      description: 'Mark as Delivered'
    },
    { 
      label: 'Mark as Cancelled', 
      icon: <FiXCircle className="mr-1" />,
      action: () => bulkUpdateStatus('cancelled'),
      color: 'bg-red-100 hover:bg-red-200 text-red-800',
      description: 'Cancel Orders'
    },
    { 
      label: 'Copy Data', 
      icon: <FiCopy className="mr-1" />,
      action: copySelectedOrdersData,
      color: 'bg-gray-100 hover:bg-gray-200 text-gray-800',
      description: 'Copy Order Details'
    }
  ];

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">Order Management</h1>
        <p className="text-sm sm:text-base text-gray-600">View and manage customer orders</p>
      </div>

      {/* Status Tabs */}
      <div className="mb-4 overflow-x-auto">
        <div className="flex space-x-1 sm:space-x-2 pb-1">
          {statusCategories.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-2 sm:px-4 py-1 sm:py-2 rounded-lg transition-all text-xs sm:text-sm ${activeTab === tab.id ? `${tab.color} shadow-md` : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              {React.cloneElement(tab.icon, { className: "text-xs sm:text-sm mr-1" })}
              <span className="whitespace-nowrap">{tab.label}</span>
              {activeTab === tab.id && (
                <motion.span
                  layoutId="activeTabIndicator"
                  className="ml-1 sm:ml-2 px-1 sm:px-2 py-0.5 text-xs rounded-full bg-white bg-opacity-30"
                >
                  {filteredOrders.length}
                </motion.span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Enhanced Order Summary */}
<div className="bg-white rounded-xl shadow-sm p-5 mb-6 border border-gray-100">
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-lg font-semibold text-gray-800 flex items-center">
      <FiBarChart2 className="mr-2 text-indigo-600" />
      Order Summary ({activeTab})
    </h2>
    <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
      {filteredOrders.length} orders
    </span>
  </div>
  
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    {/* Total Orders Card */}
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-blue-600 font-medium">Total Orders</p>
          <p className="text-2xl font-bold text-blue-800 mt-1">{orderSummary.totalOrders}</p>
        </div>
        <FiShoppingBag className="h-8 w-8 text-blue-400 opacity-70" />
      </div>
    </div>
    
    {/* Total Value Card */}
    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-green-600 font-medium">Total Value</p>
          <p className="text-2xl font-bold text-green-800 mt-1">{formatCurrency(orderSummary.totalValue)}</p>
        </div>
        <FiDollarSign className="h-8 w-8 text-green-400 opacity-70" />
      </div>
    </div>
    
    {/* Average Order Value Card */}
    <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-purple-600 font-medium">Avg. Order Value</p>
          <p className="text-2xl font-bold text-purple-800 mt-1">
            {orderSummary.totalOrders > 0 
              ? formatCurrency(orderSummary.totalValue / orderSummary.totalOrders)
              : formatCurrency(0)}
          </p>
        </div>
        <FiTrendingUp className="h-8 w-8 text-purple-400 opacity-70" />
      </div>
    </div>
  </div>
  
  {/* Items Breakdown */}
  <div>
    <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
      <FiPackage className="mr-1" /> Products Summary
    </h3>
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 max-h-64 overflow-y-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-gray-50">
          <tr className="border-b border-gray-200">
            <th className="text-left pb-2 text-gray-600 font-medium">Product</th>
            <th className="text-right pb-2 text-gray-600 font-medium">Quantity</th>
            <th className="text-right pb-2 text-gray-600 font-medium">Total Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(orderSummary.itemDetails).map(([itemName, details]) => (
            <tr key={itemName} className="border-b border-gray-100 last:border-0 hover:bg-gray-100 transition-colors">
              <td className="py-2 text-gray-800">{itemName}</td>
              <td className="py-2 text-right font-medium">{details.quantity}</td>
              <td className="py-2 text-right">{formatCurrency(details.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
</div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search orders..."
            className="w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg
            className="absolute left-2 top-2.5 h-4 w-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        
        <div className="flex items-center space-x-2 w-full sm:w-auto mt-2 sm:mt-0">
          <button
            onClick={() => fetchOrders(activeTab)}
            className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
          >
            <FiRefreshCw className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Bulk Actions Panel */}
      {selectedOrders.length > 0 && (
        <div className="bg-indigo-50 rounded-lg p-4 mb-4 border border-indigo-100">
          <div className="flex flex-col">
            <div className="text-sm text-indigo-800 mb-3">
              <span className="font-semibold">{selectedOrders.length}</span> order(s) selected
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {bulkActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className={`flex flex-col items-center p-2 rounded-lg transition-colors ${action.color} text-xs`}
                  title={action.description}
                >
                  <div className="flex items-center">
                    {action.icon}
                    <span>{action.label}</span>
                  </div>
                  <span className="text-xs opacity-70 mt-1 hidden sm:block">{action.description}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Orders List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No orders found</h3>
          <p className="mt-1 text-sm text-gray-500">There are currently no {activeTab} orders.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Select All Checkbox */}
          <div className="flex items-center bg-white p-2 rounded-lg shadow-sm border border-gray-100">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={toggleSelectAll}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">
              Select all {filteredOrders.length} orders
            </label>
          </div>

          {filteredOrders.map((order) => (
           <motion.div
           key={order.id}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.3 }}
           className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
         >
           <div className="px-4 py-3 flex justify-between items-center">
             <div className="flex items-center gap-3">
               <input
                 type="checkbox"
                 checked={selectedOrders.includes(order.id)}
                 onChange={() => toggleSelectOrder(order.id)}
                 onClick={(e) => e.stopPropagation()}
                 className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
               />
               <div
                 className="flex items-center gap-3 cursor-pointer"
                 onClick={() => toggleOrderExpand(order.id)}
               >
                 <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(order.status)} capitalize`}>
                   {order.status}
                 </span>
                 <div>
                   <h3 className="text-sm font-semibold text-gray-900">Order #{order.id}</h3>
                   <p className="text-xs text-gray-500">{order.order_time}</p>
                 </div>
               </div>
             </div>
             <div className="flex items-center gap-2 cursor-pointer" onClick={() => toggleOrderExpand(order.id)}>
               <div className="text-right">
                 <p className="text-sm font-semibold text-gray-800">{formatCurrency(order.grandtotal)}</p>
                 <p className="text-xs text-gray-500">{order.order_items.length} items</p>
               </div>
               {expandedOrder === order.id ? (
                 <FiChevronUp className="text-gray-400 text-sm" />
               ) : (
                 <FiChevronDown className="text-gray-400 text-sm" />
               )}
             </div>
           </div>
         
            {/* Order Details */}
              
            
              {/* EXPANDED CONTENT */}
              <AnimatePresence>
                {expandedOrder === order.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-gray-100 p-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      {/* CUSTOMER INFO */}
                      <section>
                        <h3 className="flex items-center gap-2 text-indigo-600 font-semibold mb-3 text-sm uppercase tracking-wider">
                          <FiUser className="w-5 h-5" />
                          Customer Details
                        </h3>
                        <dl className="text-gray-700 text-sm space-y-2">
                          <div>
                            <dt className="font-semibold">Name:</dt>
                            <dd>{order.name}</dd>
                          </div>
                          <div>
                            <dt className="font-semibold">Phone:</dt>
                            <dd>{order.phone_number}</dd>
                          </div>
                          <div>
                            <dt className="font-semibold">Address:</dt>
                            <dd>{order.shipping_address}</dd>
                          </div>
                        </dl>
                      </section>
            
                      {/* ORDER SUMMARY */}
                      <section>
                        <h3 className="flex items-center gap-2 text-indigo-600 font-semibold mb-3 text-sm uppercase tracking-wider">
                          <FiDollarSign className="w-5 h-5" />
                          Order Summary
                        </h3>
                        <dl className="text-gray-700 text-sm space-y-2">
                          <div className="flex justify-between">
                            <dt>Subtotal:</dt>
                            <dd>{formatCurrency(order.subtotal)}</dd>
                          </div>
                          {order.discount && (
                            <div className="flex justify-between text-red-600">
                              <dt>Discount ({order.discount.name}):</dt>
                              <dd>
                                -{order.discount.is_percentage
                                  ? `${order.discount.amount}%`
                                  : formatCurrency(order.discount.amount)}
                              </dd>
                            </div>
                          )}
                          <div className="flex justify-between font-semibold text-indigo-600 text-lg mt-2 border-t pt-2">
                            <dt>Total:</dt>
                            <dd>{formatCurrency(order.grandtotal)}</dd>
                          </div>
                        </dl>
                      </section>
            
                   
                    </div>
            
                    {/* ORDER ITEMS TABLE */}
                    <section>
                      <h3 className="flex items-center gap-2 text-indigo-600 font-semibold mb-4 text-sm uppercase tracking-wider">
                        <FiShoppingBag className="w-5 h-5" />
                        Order Items
                      </h3>
                      <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-100 text-gray-800">
                          <thead className="bg-indigo-50 text-indigo-700 text-xs uppercase tracking-wider">
                            <tr>
                              <th className="px-4 py-3 text-left">Product</th>
                              <th className="px-4 py-3 text-right">Price</th>
                              <th className="px-4 py-3 text-right">Qty</th>
                              <th className="px-4 py-3 text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {order.order_items.map((item) => {
                              const price = item.product_price || 0;
                              return (
                                <tr key={item.id} className="hover:bg-indigo-50 transition-colors">
                                  <td className="px-4 py-3 font-medium">{item.product_name || `Product #${item.product}`}</td>
                                  <td className="px-4 py-3 text-right">{formatCurrency(price)}</td>
                                  <td className="px-4 py-3 text-right">{item.quantity}</td>
                                  <td className="px-4 py-3 text-right font-semibold">
                                    {formatCurrency(price * item.quantity)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot className="bg-indigo-50 font-semibold text-indigo-700">
                            <tr>
                              <td colSpan={3} className="px-4 py-2 text-right">Subtotal:</td>
                              <td className="px-4 py-2 text-right">{formatCurrency(order.subtotal)}</td>
                            </tr>
                            {order.discount && (
                              <tr>
                                <td colSpan={3} className="px-4 py-2 text-right text-red-600">
                                  Discount ({order.discount.name}):
                                </td>
                                <td className="px-4 py-2 text-right text-red-600">
                                  -{order.discount.is_percentage ? `${order.discount.amount}%` : formatCurrency(order.discount.amount)}
                                </td>
                              </tr>
                            )}
                            <tr className="border-t border-indigo-200">
                              <td colSpan={3} className="px-4 py-3 text-right text-lg">Total:</td>
                              <td className="px-4 py-3 text-right text-lg">{formatCurrency(order.grandtotal)}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </section>
                  </motion.div>
                )}
              </AnimatePresence>
        
            
         
           
         </motion.div>
         
          ))}
        </div>
      )}
      <AnimatePresence>
  {showCopyToast && (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      className="fixed bottom-6 right-6 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50"
    >
      ✅ Order data copied to clipboard!
    </motion.div>
  )}
</AnimatePresence>

    </div>
  );
};

export default Orders;