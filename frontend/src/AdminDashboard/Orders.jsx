import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiRefreshCw, FiChevronDown, FiChevronUp, FiPackage, 
  FiCheckCircle, FiTruck, FiShoppingBag, FiXCircle, 
  FiCopy, FiEdit2, FiArchive, FiTruck as FiShipping, 
  FiCheck, FiDollarSign, FiBox, FiList,
  FiBarChart2,
  FiTrendingUp,
  FiUser,
  FiPlus,
  FiMinus,
  FiTrash2,
  FiTag
} from 'react-icons/fi';
import Swal from 'sweetalert2';

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
  const [editingOrder, setEditingOrder] = useState(null);
  const [editingPrices, setEditingPrices] = useState({});
  const [newDiscount, setNewDiscount] = useState({ amount: '', is_percentage: false });
  const [newItem, setNewItem] = useState({ product_name: '', price: '', quantity: 1 });

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
      const response = await fetch(`${apiUrl}/orders/?status=${status}&expand=order_items.product,order_items.product_name,discount`);
      const data = await response.json();
      const sortedOrders = data.sort((a, b) => 
        new Date(b.order_time.replace(',', '')) - new Date(a.order_time.replace(',', '')));
      setOrders(sortedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      Swal.fire('Error', 'Failed to fetch orders. Please try again.', 'error');
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
          fetchOrders(activeTab);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update status');
        }
      }
    } catch (error) {
      Swal.fire(
        'Error!',
        error.message || 'There was an error updating the order status.',
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
      // Mobile-friendly sequential processing with error tracking
      const updateResults = {
        success: 0,
        failed: 0,
        failedIds: []
      };

      for (const orderId of selectedOrders) {
        try {
          let retries = 3;
          let success = false;
          
          while (retries > 0 && !success) {
            try {
              const response = await fetch(`${apiUrl}/orders/${orderId}/`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus })
              });

              if (response.ok) {
                updateResults.success++;
                success = true;
              } else {
                throw new Error(`HTTP status ${response.status}`);
              }
            } catch (error) {
              retries--;
              if (retries === 0) {
                updateResults.failed++;
                updateResults.failedIds.push(orderId);
                console.error(`Failed to update order ${orderId}:`, error);
              } else {
                await new Promise(resolve => setTimeout(resolve, 500)); // Wait before retry
              }
            }
          }
        } catch (error) {
          updateResults.failed++;
          updateResults.failedIds.push(orderId);
          console.error(`Error processing order ${orderId}:`, error);
        }
      }

      if (updateResults.failed > 0) {
        await Swal.fire({
          title: 'Partial Success',
          html: `Updated ${updateResults.success} orders successfully.<br>
                Failed to update ${updateResults.failed} orders.${updateResults.failedIds.length > 0 ? 
                 `<br><small>Failed IDs: ${updateResults.failedIds.join(', ')}</small>` : ''}`,
          icon: 'warning'
        });
      } else {
        await Swal.fire(
          'Updated!',
          `${selectedOrders.length} orders have been changed to ${newStatus}.`,
          'success'
        );
      }

      fetchOrders(activeTab);
      setSelectedOrders([]);
      setSelectAll(false);
    }
  } catch (error) {
    Swal.fire(
      'Error!',
      error.message || 'There was an error updating some order statuses.',
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
      formattedText += `${index + 1})\n\nCustomer Name: ${order.name}\nPhone No: ${order.phone_number}\nAddress: ${order.shipping_address}\n\nOrder Items: ${order.order_items.map(item => `${item.product_name || `Product ${item.product}`} (x${item.quantity})`).join(', ')}\n\nOrder Value: BDT ${parseFloat(order.grandtotal - 100).toFixed(2)}\nDelivery Charge: BDT 100\n\nTotal Bill: BDT ${parseFloat(order.grandtotal).toFixed(2)}\n\n\n\n`;
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

  const copyAllPhoneNumbers = async () => {
    try {
      if (filteredOrders.length === 0) {
        Swal.fire('No orders', 'There are no orders to copy phone numbers from', 'info');
        return;
      }

      const phoneNumbers = filteredOrders.map(order => order.phone_number).join('\n');
      
      await navigator.clipboard.writeText(phoneNumbers);
      
      Swal.fire('Success!', `${filteredOrders.length} phone numbers copied to clipboard`, 'success');
    } catch (error) {
      console.error('Error copying phone numbers:', error);
      Swal.fire('Error!', 'Failed to copy phone numbers', 'error');
    }
  };

  const copySelectedPhoneNumbers = async () => {
    try {
      if (selectedOrders.length === 0) {
        Swal.fire('No orders selected', 'Please select orders to copy phone numbers', 'warning');
        return;
      }

      const selectedOrdersData = orders.filter(order => selectedOrders.includes(order.id));
      const phoneNumbers = selectedOrdersData.map(order => order.phone_number).join('\n');
      
      await navigator.clipboard.writeText(phoneNumbers);
      
      Swal.fire('Success!', `${selectedOrders.length} phone numbers copied to clipboard`, 'success');
    } catch (error) {
      console.error('Error copying phone numbers:', error);
      Swal.fire('Error!', 'Failed to copy phone numbers', 'error');
    }
  };

  const calculateOrderSummary = () => {
    const itemDetails = {};
    let totalValue = 0;
    let totalOrders = filteredOrders.length;

    filteredOrders.forEach(order => {
      const orderValue = parseFloat(order.grandtotal) - 100;
      totalValue += orderValue > 0 ? orderValue : 0;
      
      order.order_items.forEach(item => {
        const itemName = item.product_name || `Product ID: ${item.product}`;
        if (!itemDetails[itemName]) {
          itemDetails[itemName] = {
            quantity: 0,
            total: 0
          };
        }
        itemDetails[itemName].quantity += item.quantity;
        itemDetails[itemName].total += item.quantity * (item.price || (parseFloat(order.subtotal) / order.order_items.length));
      });
    });

    return {
      totalOrders,
      totalValue,
      averageValue: totalOrders > 0 ? totalValue / totalOrders : 0,
      itemDetails
    };
  };

  const orderSummary = calculateOrderSummary();

  const startEditingPrices = (order) => {
    setEditingOrder(order.id);
    const prices = {};
    order.order_items.forEach(item => {
      prices[item.id] = item.price || (order.subtotal / order.order_items.length);
    });
    setEditingPrices(prices);
    setNewDiscount({
      amount: order.discount?.amount || '',
      is_percentage: order.discount?.is_percentage || false
    });
    setNewItem({ product_name: '', price: '', quantity: 1 });
  };

  const cancelEditing = () => {
    setEditingOrder(null);
    setEditingPrices({});
    setNewDiscount({ amount: '', is_percentage: false });
    setNewItem({ product_name: '', price: '', quantity: 1 });
  };

  const handlePriceChange = (itemId, newPrice) => {
    setEditingPrices(prev => ({
      ...prev,
      [itemId]: parseFloat(newPrice) || 0
    }));
  };

  const handleDiscountChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewDiscount(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNewItemChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'price' ? parseFloat(value) || 0 : value
    }));
  };

  const calculateNewSubtotal = (order) => {
    return Object.values(editingPrices).reduce((sum, price) => sum + price, 0);
  };

  const calculateNewGrandtotal = (order) => {
    let subtotal = calculateNewSubtotal(order);
    if (newDiscount.amount) {
      const discountAmount = newDiscount.is_percentage 
        ? subtotal * (parseFloat(newDiscount.amount) / 100)
        : parseFloat(newDiscount.amount);
      subtotal -= discountAmount;
    }
    return subtotal + 100; // Adding delivery charge
  };

  const addNewItem = async (order) => {
    if (!newItem.product_name || !newItem.price) {
      Swal.fire('Error', 'Please fill in all required fields for the new item', 'error');
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/order-items/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order: order.id,
          product_name: newItem.product_name,
          price: newItem.price,
          quantity: newItem.quantity
        })
      });

      if (response.ok) {
        await Swal.fire('Success!', 'New item added to order', 'success');
        fetchOrders(activeTab);
      } else {
        throw new Error('Failed to add new item');
      }
    } catch (error) {
      Swal.fire('Error!', 'Failed to add new item to order', 'error');
      console.error('Error adding new item:', error);
    }
  };

  const removeItem = async (itemId) => {
    try {
      const result = await Swal.fire({
        title: 'Confirm Removal',
        text: 'Are you sure you want to remove this item from the order?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, remove it!'
      });

      if (result.isConfirmed) {
        const response = await fetch(`${apiUrl}/order-items/${itemId}/`, {
          method: 'DELETE'
        });

        if (response.ok) {
          await Swal.fire('Removed!', 'Item has been removed from the order.', 'success');
          fetchOrders(activeTab);
        } else {
          throw new Error('Failed to remove item');
        }
      }
    } catch (error) {
      Swal.fire('Error!', 'Failed to remove item from order', 'error');
      console.error('Error removing item:', error);
    }
  };

  const saveOrderChanges = async (order) => {
    try {
      // Update order items
      const itemUpdates = order.order_items.map(item => ({
        id: item.id,
        price: editingPrices[item.id]
      }));

      // Prepare order update
      const orderUpdate = {
        subtotal: calculateNewSubtotal(order),
        grandtotal: calculateNewGrandtotal(order),
      };

      // Add discount if changed
      if (newDiscount.amount) {
        orderUpdate.discount = {
          name: 'Manual Adjustment',
          amount: parseFloat(newDiscount.amount),
          is_percentage: newDiscount.is_percentage
        };
      } else if (order.discount) {
        orderUpdate.discount = null; // Remove discount if amount is empty
      }

      // First update items
      await Promise.all(
        itemUpdates.map(item => 
          fetch(`${apiUrl}/order-items/${item.id}/`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ price: item.price })
          })
        )
      );

      // Then update order
      const response = await fetch(`${apiUrl}/orders/${order.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderUpdate)
      });

      if (response.ok) {
        await Swal.fire('Success!', 'Order updated successfully', 'success');
        fetchOrders(activeTab);
        cancelEditing();
      } else {
        throw new Error('Failed to update order');
      }
    } catch (error) {
      Swal.fire('Error!', error.message || 'Failed to update order', 'error');
      console.error('Error updating order:', error);
    }
  };

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
    },
    { 
      label: 'Copy Phone Numbers', 
      icon: <FiCopy className="mr-1" />,
      action: copySelectedPhoneNumbers,
      color: 'bg-green-100 hover:bg-green-200 text-green-800',
      description: 'Copy Selected Phone Numbers'
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
                <p className="text-sm text-green-600 font-medium">Total Value (excl. delivery)</p>
                <p className="text-2xl font-bold text-green-800 mt-1">{formatCurrency(orderSummary.totalValue)}</p>
                <p className="text-xs text-green-600 mt-1">+ {formatCurrency(100 * orderSummary.totalOrders)} delivery</p>
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
                  {formatCurrency(orderSummary.averageValue)}
                </p>
                <p className="text-xs text-purple-600 mt-1">excl. delivery charge</p>
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
            onClick={copyAllPhoneNumbers}
            className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            title="Copy all phone numbers"
          >
            <FiCopy className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Copy All Phones</span>
          </button>
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

                <div className="flex items-center gap-2">
                  {editingOrder === order.id ? (
                    <>
                      <button
                        onClick={() => saveOrderChanges(order)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="px-3 py-1 bg-gray-200 text-gray-800 rounded text-sm hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => startEditingPrices(order)}
                      className="flex items-center px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
                    >
                      <FiEdit2 className="mr-1" />
                      Edit Order
                    </button>
                  )}
                </div>
              </div>
            
              {/* Order Details */}
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
                            <dd>
                              {order.phone_number}
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(order.phone_number);
                                  Swal.fire('Copied!', 'Phone number copied to clipboard', 'success');
                                }}
                                className="ml-2 text-indigo-600 hover:text-indigo-800"
                                title="Copy phone number"
                              >
                                <FiCopy className="inline" />
                              </button>
                            </dd>
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
                            <dt>Original Subtotal:</dt>
                            <dd>
                              {formatCurrency(order.order_items.reduce((sum, item) => 
                                sum + (item.price * item.quantity), 0))}
                            </dd>
                          </div>
                          
                          {order.discount && (() => {
                            const originalSubtotal = order.order_items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                            const actualDiscountAmount = originalSubtotal - order.subtotal;
                            
                            return (
                              <>
                                <div className="flex justify-between text-red-600">
                                  <dt>Discount ({order.discount.name}):</dt>
                                  <dd>
                                    {order.discount.is_percentage 
                                      ? `${order.discount.amount}%`
                                      : ''} (Applied: -{formatCurrency(actualDiscountAmount)})
                                  </dd>
                                </div>
                                <div className="flex justify-between">
                                  <dt>Subtotal After Discount:</dt>
                                  <dd>{formatCurrency(order.subtotal)}</dd>
                                </div>
                              </>
                            );
                          })()}
                          
                          <div className="flex justify-between">
                            <dt>Delivery Charge:</dt>
                            <dd>{formatCurrency(100)}</dd>
                          </div>
                          
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
                              {editingOrder === order.id && <th className="px-4 py-3 text-right">Actions</th>}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {order.order_items.map((item) => {
                              const price = editingOrder === order.id 
                                ? editingPrices[item.id] 
                                : item.price || (order.subtotal / order.order_items.length);
                              
                              return (
                                <tr key={item.id} className="hover:bg-indigo-50 transition-colors">
                                  <td className="px-4 py-3 font-medium">{item.product_name || `Product #${item.product}`}</td>
                                  <td className="px-4 py-3 text-right">
                                    {editingOrder === order.id ? (
                                      <input
                                        type="number"
                                        value={price}
                                        onChange={(e) => handlePriceChange(item.id, e.target.value)}
                                        className="w-20 px-2 py-1 border rounded text-right"
                                      />
                                    ) : (
                                      formatCurrency(price)
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-right">{item.quantity}</td>
                                  <td className="px-4 py-3 text-right font-semibold">
                                    {formatCurrency(price * item.quantity)}
                                  </td>
                                  {editingOrder === order.id && (
                                    <td className="px-4 py-3 text-right">
                                      <button
                                        onClick={() => removeItem(item.id)}
                                        className="text-red-600 hover:text-red-800 p-1"
                                        title="Remove item"
                                      >
                                        <FiTrash2 />
                                      </button>
                                    </td>
                                  )}
                                </tr>
                              );
                            })}
                          </tbody>

                          {editingOrder === order.id && (
                            <tfoot className="bg-gray-50">
                              <tr>
                                <td className="px-4 py-3">
                                  <input
                                    type="text"
                                    name="product_name"
                                    value={newItem.product_name}
                                    onChange={handleNewItemChange}
                                    placeholder="Product name"
                                    className="w-full px-2 py-1 border rounded"
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  <input
                                    type="number"
                                    name="price"
                                    value={newItem.price}
                                    onChange={handleNewItemChange}
                                    placeholder="Price"
                                    className="w-full px-2 py-1 border rounded text-right"
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center justify-end">
                                    <button
                                      onClick={() => setNewItem(prev => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))}
                                      className="px-2 py-1 bg-gray-200 rounded-l"
                                    >
                                      <FiMinus />
                                    </button>
                                    <input
                                      type="number"
                                      name="quantity"
                                      value={newItem.quantity}
                                      onChange={handleNewItemChange}
                                      min="1"
                                      className="w-12 px-2 py-1 border-t border-b text-center"
                                    />
                                    <button
                                      onClick={() => setNewItem(prev => ({ ...prev, quantity: prev.quantity + 1 }))}
                                      className="px-2 py-1 bg-gray-200 rounded-r"
                                    >
                                      <FiPlus />
                                    </button>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-right font-semibold">
                                  {formatCurrency(newItem.price * newItem.quantity)}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <button
                                    onClick={() => addNewItem(order)}
                                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                                  >
                                    Add
                                  </button>
                                </td>
                              </tr>
                            </tfoot>
                          )}

                          <tfoot className="bg-indigo-50 font-semibold text-indigo-700">
                            <tr>
                              <td colSpan={3} className="px-4 py-2 text-right">Original Subtotal:</td>
                              <td className="px-4 py-2 text-right">
                                {formatCurrency(order.order_items.reduce((sum, item) => 
                                  sum + (item.price * item.quantity), 0))}
                              </td>
                              {editingOrder === order.id && <td></td>}
                            </tr>
                            {order.discount && (() => {
                              const originalSubtotal = order.order_items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                              const actualDiscountAmount = originalSubtotal - order.subtotal;
                              
                              return (
                                <tr>
                                  <td colSpan={3} className="px-4 py-2 text-right text-red-600">
                                    Discount ({order.discount.name}):
                                  </td>
                                  <td className="px-4 py-2 text-right text-red-600">
                                    {order.discount.is_percentage 
                                      ? `${order.discount.amount}%`
                                      : ''} (Applied: -{formatCurrency(actualDiscountAmount)})
                                  </td>
                                  {editingOrder === order.id && <td></td>}
                                </tr>
                              );
                            })()}
                            <tr>
                              <td colSpan={3} className="px-4 py-2 text-right">Subtotal:</td>
                              <td className="px-4 py-2 text-right">{formatCurrency(order.subtotal)}</td>
                              {editingOrder === order.id && <td></td>}
                            </tr>
                            <tr className="border-t border-indigo-200">
                              <td colSpan={3} className="px-4 py-3 text-right text-lg">Total:</td>
                              <td className="px-4 py-3 text-right text-lg">{formatCurrency(order.grandtotal)}</td>
                              {editingOrder === order.id && <td></td>}
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </section>

                    {/* Discount Editor */}
                    {editingOrder === order.id && (
                      <section className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <h3 className="flex items-center gap-2 text-yellow-700 font-semibold mb-3 text-sm uppercase tracking-wider">
                          <FiTag className="w-5 h-5" />
                          Discount Editor
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Discount Amount</label>
                            <input
                              type="number"
                              name="amount"
                              value={newDiscount.amount}
                              onChange={handleDiscountChange}
                              placeholder="Enter discount amount"
                              className="w-full px-3 py-2 border rounded"
                            />
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              name="is_percentage"
                              checked={newDiscount.is_percentage}
                              onChange={handleDiscountChange}
                              id={`discount-percentage-${order.id}`}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`discount-percentage-${order.id}`} className="ml-2 block text-sm text-gray-700">
                              Is Percentage
                            </label>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          {newDiscount.amount && (
                            <p>
                              Discount will reduce subtotal by: {newDiscount.is_percentage 
                                ? `${newDiscount.amount}% (${formatCurrency(calculateNewSubtotal(order) * (parseFloat(newDiscount.amount) / 100))})`
                                : formatCurrency(parseFloat(newDiscount.amount))}
                            </p>
                          )}
                        </div>
                      </section>
                    )}

                    {/* Status Actions */}
                    <div className="mt-6 flex flex-wrap gap-3">
                      {getNextStatusAction(order.status) && (
                        <button
                          onClick={() => updateOrderStatus(order.id, getNextStatusAction(order.status).nextStatus)}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                        >
                          {getNextStatusAction(order.status).label}
                        </button>
                      )}
                      <button
                        onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        Cancel Order
                      </button>
                    </div>
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