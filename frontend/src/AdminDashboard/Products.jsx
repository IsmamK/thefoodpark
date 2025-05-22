import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight, FiChevronUp, FiChevronDown, FiLayers, FiPackage, FiShoppingBag, FiArrowLeft } from 'react-icons/fi';
import Swal from 'sweetalert2';

const Products = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedItem, setExpandedItem] = useState(null);
  const [viewMode, setViewMode] = useState('categories');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const apiUrl = import.meta.env.VITE_API_URL;     


  // Fetch data based on view mode
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (viewMode === 'categories') {
          const response = await fetch(`${apiUrl}/categories/`);
          if (!response.ok) throw new Error('Failed to fetch categories');
          const data = await response.json();
          setCategories(data.sort((a, b) => a.priority - b.priority));
        } else if (viewMode === 'subcategories') {
          const response = await fetch(`${apiUrl}/subcategories/`);
          if (!response.ok) throw new Error('Failed to fetch subcategories');
          const data = await response.json();
          setSubcategories(data.sort((a, b) => a.priority - b.priority));
        }
      } catch (error) {
        console.error(`Error fetching ${viewMode}:`, error);
        Swal.fire('Error!', `Failed to load ${viewMode}.`, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [viewMode]);

  // Fetch subcategories for a specific category
  const fetchSubcategories = async (categoryId) => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/subcategories/?parent_category=${categoryId}`);
      if (!response.ok) throw new Error('Failed to fetch subcategories');
      const data = await response.json();
      setSubcategories(data.sort((a, b) => a.priority - b.priority));
      setSelectedCategory(categories.find(c => c.id === categoryId));
      setBreadcrumbs([{ id: categoryId, name: categories.find(c => c.id === categoryId).name, type: 'category' }]);
      setViewMode('products-subcategories');
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      Swal.fire('Error!', 'Failed to load subcategories.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch products for a specific subcategory
  const fetchProducts = async (subcategoryId) => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/subcategories/${subcategoryId}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data.products || []);
      setSelectedSubcategory(subcategories.find(s => s.id === subcategoryId));
      setBreadcrumbs([
        { id: selectedCategory.id, name: selectedCategory.name, type: 'category' },
        { id: subcategoryId, name: subcategories.find(s => s.id === subcategoryId).name, type: 'subcategory' }
      ]);
      setViewMode('products-list');
    } catch (error) {
      console.error('Error fetching products:', error);
      Swal.fire('Error!', 'Failed to load products.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Toggle active status
  const toggleActiveStatus = async (id, currentStatus, isCategory = true) => {
    try {
      const result = await Swal.fire({
        title: 'Confirm Status Change',
        text: `Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this ${isCategory ? 'category' : 'subcategory'}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: `Yes, ${currentStatus ? 'Deactivate' : 'Activate'}`
      });

      if (result.isConfirmed) {
        const endpoint = isCategory 
          ? `${apiUrl}/categories/${id}/`
          : `${apiUrl}/subcategories/${id}`;
        
        const response = await fetch(endpoint, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ is_active: !currentStatus })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Failed to update status');
        }

        if (isCategory) {
          setCategories(categories.map(item => 
            item.id === id ? { ...item, is_active: !currentStatus } : item
          ));
        } else {
          setSubcategories(subcategories.map(item => 
            item.id === id ? { ...item, is_active: !currentStatus } : item
          ));
        }
        Swal.fire(
          'Updated!',
          `${isCategory ? 'Category' : 'Subcategory'} has been ${currentStatus ? 'deactivated' : 'activated'}.`,
          'success'
        );
      }
    } catch (error) {
      Swal.fire(
        'Error!',
        error.message || `There was an error updating the ${isCategory ? 'category' : 'subcategory'} status.`,
        'error'
      );
      console.error(`Error updating status:`, error);
    }
  };

  // Delete item
  const deleteItem = async (id, isCategory = true) => {
    try {
      const result = await Swal.fire({
        title: `Delete ${isCategory ? 'Category' : 'Subcategory'}?`,
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        const endpoint = isCategory 
          ? `${apiUrl}/categories/${id}/`
          : `${apiUrl}/subcategories/${id}`;
        
        const response = await fetch(endpoint, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
          }
        });

        if (!response.ok) {
          if (response.status === 204) {
            if (isCategory) {
              setCategories(categories.filter(item => item.id !== id));
            } else {
              setSubcategories(subcategories.filter(item => item.id !== id));
            }
            Swal.fire(
              'Deleted!',
              `${isCategory ? 'Category' : 'Subcategory'} has been deleted.`,
              'success'
            );
            return;
          }
          
          const errorText = await response.text();
          throw new Error(errorText || 'Failed to delete item');
        }

        if (isCategory) {
          setCategories(categories.filter(item => item.id !== id));
        } else {
          setSubcategories(subcategories.filter(item => item.id !== id));
        }
        Swal.fire(
          'Deleted!',
          `${isCategory ? 'Category' : 'Subcategory'} has been deleted.`,
          'success'
        );
      }
    } catch (error) {
      Swal.fire(
        'Error!',
        error.message || `There was an error deleting the ${isCategory ? 'category' : 'subcategory'}.`,
        'error'
      );
      console.error(`Error deleting item:`, error);
    }
  };

  // Update item
  const updateItem = async (id, currentData, isCategory = true) => {
    const { value: formValues } = await Swal.fire({
      title: `Edit ${isCategory ? 'Category' : 'Subcategory'}`,
      html:
        `<input id="swal-input1" class="swal2-input" placeholder="Name" value="${currentData.name}" maxlength="255" required>` +
        `<input id="swal-input2" class="swal2-input" placeholder="Priority" type="number" value="${currentData.priority}" required>` +
        (!isCategory ? `<select id="swal-input3" class="swal2-input">
          ${categories.map(cat => `<option value="${cat.id}" ${cat.id === currentData.parent_category ? 'selected' : ''}>${cat.name}</option>`)}
        </select>` : ''),
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Update',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        const name = document.getElementById('swal-input1').value;
        const priority = document.getElementById('swal-input2').value;
        const parentCategory = !isCategory ? document.getElementById('swal-input3').value : null;
        
        if (!name || name.trim().length < 1) {
          Swal.showValidationMessage('Name must be at least 1 character');
          return false;
        }
        
        if (!priority || isNaN(priority)) {
          Swal.showValidationMessage('Priority must be a number');
          return false;
        }
        
        return { name, priority: parseInt(priority), ...(!isCategory && { parent_category: parseInt(parentCategory) }) };
      }
    });

    if (formValues) {
      try {
        const endpoint = isCategory 
          ? `${apiUrl}/categories/${id}/`
          : `${apiUrl}/subcategories/${id}`;
        
        const response = await fetch(endpoint, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formValues)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Failed to update item');
        }

        const updatedItem = await response.json();
        if (isCategory) {
          setCategories(categories.map(item => 
            item.id === id ? { ...item, ...updatedItem } : item
          ).sort((a, b) => a.priority - b.priority));
        } else {
          setSubcategories(subcategories.map(item => 
            item.id === id ? { ...item, ...updatedItem } : item
          ).sort((a, b) => a.priority - b.priority));
        }
        Swal.fire(
          'Updated!',
          `${isCategory ? 'Category' : 'Subcategory'} details have been updated.`,
          'success'
        );
      } catch (error) {
        Swal.fire(
          'Error!',
          error.message || `There was an error updating the ${isCategory ? 'category' : 'subcategory'}.`,
          'error'
        );
        console.error(`Error updating item:`, error);
      }
    }
  };

  // Add new item
  const addNewItem = async (isCategory) => {
    try {
      const { value: formValues } = await Swal.fire({
        title: `Add New ${isCategory ? 'Category' : 'Subcategory'}`,
        html:
          `<input id="swal-input1" class="swal2-input" placeholder="Name" maxlength="255" required>` +
          `<input id="swal-input2" class="swal2-input" placeholder="Priority" type="number" required>` +
          (!isCategory ? `<select id="swal-input3" class="swal2-input" required>
            <option value="">Select Parent Category</option>
            ${categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`)}
          </select>` : ''),
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: `Add ${isCategory ? 'Category' : 'Subcategory'}`,
        cancelButtonText: 'Cancel',
        preConfirm: () => {
          const name = document.getElementById('swal-input1').value;
          const priority = document.getElementById('swal-input2').value;
          const parentCategory = !isCategory ? document.getElementById('swal-input3').value : null;
          
          if (!name || name.trim().length < 1) {
            Swal.showValidationMessage('Name must be at least 1 character');
            return false;
          }
          
          if (!priority || isNaN(priority)) {
            Swal.showValidationMessage('Priority must be a number');
            return false;
          }
          
          if (!isCategory && !parentCategory) {
            Swal.showValidationMessage('Parent category is required');
            return false;
          }
          
          return { 
            name, 
            priority: parseInt(priority), 
            ...(!isCategory && { parent_category: parseInt(parentCategory) }),
            is_active: true 
          };
        }
      });

      if (formValues) {
        const endpoint = isCategory 
          ? `${apiUrl}/categories/`
          : `${apiUrl}/subcategories/`;
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formValues)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Failed to add item');
        }

        const newItem = await response.json();
        if (isCategory) {
          setCategories([...categories, newItem].sort((a, b) => a.priority - b.priority));
        } else {
          setSubcategories([...subcategories, newItem].sort((a, b) => a.priority - b.priority));
        }
        Swal.fire(
          'Success!',
          `New ${isCategory ? 'category' : 'subcategory'} has been added.`,
          'success'
        );
      }
    } catch (error) {
      Swal.fire(
        'Error!',
        error.message || `There was an error adding the ${isCategory ? 'category' : 'subcategory'}.`,
        'error'
      );
      console.error(`Error adding item:`, error);
    }
  };

  const renderItem = (item, isCategory = true) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div 
        className="p-4 cursor-pointer flex justify-between items-center"
        onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
      >
        <div className="flex items-center space-x-4">
          {item.image && (
            <div className="relative">
              <img 
                src={item.image} 
                alt={item.name} 
                className="w-16 h-16 rounded-lg object-cover"
              />
              {!item.is_active && (
                <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">INACTIVE</span>
                </div>
              )}
            </div>
          )}
          <div>
            <h3 className="font-medium text-gray-900">{item.name}</h3>
            <p className="text-sm text-gray-500">Priority: {item.priority}</p>
            {!isCategory && (
              <p className="text-sm text-gray-500">
                Parent: {categories.find(c => c.id === item.parent_category)?.name || 'N/A'}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              toggleActiveStatus(item.id, item.is_active, isCategory);
            }}
            className={`p-2 rounded-full ${item.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}
          >
            {item.is_active ? <FiToggleRight size={20} /> : <FiToggleLeft size={20} />}
          </button>
          {expandedItem === item.id ? (
            <FiChevronUp className="text-gray-400" />
          ) : (
            <FiChevronDown className="text-gray-400" />
          )}
        </div>
      </div>

      <AnimatePresence>
        {expandedItem === item.id && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-100"
          >
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Details</h4>
                  <div className="space-y-2 text-sm">
                    {item.feature_label && (
                      <p><span className="text-gray-500">Feature Label:</span> {item.feature_label}</p>
                    )}
                    <p><span className="text-gray-500">Status:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${item.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {item.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </p>
                  </div>
                </div>

                {item.description && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                )}

                {item.cover && (
                  <div>
                    <img 
                      src={item.cover} 
                      alt={item.name} 
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              <div className="mt-4 flex space-x-3">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    updateItem(item.id, item, isCategory);
                  }}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                >
                  <FiEdit2 className="mr-2" />
                  Edit
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteItem(item.id, isCategory);
                  }}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  <FiTrash2 className="mr-2" />
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  const renderProductItem = (product) => (
    <motion.div
      key={product.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div className="p-4">
        <div className="flex items-start space-x-4">
          {product.image && (
            <div className="relative flex-shrink-0">
              <img 
                src={product.image} 
                alt={product.title} 
                className="w-20 h-20 rounded-lg object-cover"
              />
              {!product.is_active && (
                <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">INACTIVE</span>
                </div>
              )}
            </div>
          )}
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-900">{product.title}</h3>
                <p className="text-lg font-semibold text-indigo-600">৳{product.price}</p>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {product.is_active ? 'Active' : 'Inactive'}
              </div>
            </div>
            {product.description && (
              <p className="mt-2 text-sm text-gray-600 line-clamp-2">{product.description}</p>
            )}
          </div>
        </div>

        <div className="mt-4 flex space-x-3">
          <button 
            onClick={() => {
              // Add edit functionality here
              Swal.fire('Info', 'Product edit functionality will be implemented here', 'info');
            }}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
          >
            <FiEdit2 className="mr-2" />
            Edit
          </button>
          <button 
            onClick={() => {
              // Add delete functionality here
              Swal.fire('Info', 'Product delete functionality will be implemented here', 'info');
            }}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            <FiTrash2 className="mr-2" />
            Delete
          </button>
          <button 
            onClick={() => {
              // Add toggle status functionality here
              Swal.fire('Info', 'Product status toggle functionality will be implemented here', 'info');
            }}
            className={`flex items-center px-4 py-2 rounded-lg text-sm ${product.is_active ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}
          >
            {product.is_active ? (
              <>
                <FiToggleRight className="mr-2" />
                Deactivate
              </>
            ) : (
              <>
                <FiToggleLeft className="mr-2" />
                Activate
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );

  const navigateBack = () => {
    if (viewMode === 'products-list') {
      setViewMode('products-subcategories');
      setBreadcrumbs([{ id: selectedCategory.id, name: selectedCategory.name, type: 'category' }]);
    } else if (viewMode === 'products-subcategories') {
      setViewMode('products');
      setBreadcrumbs([]);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Product Management</h1>
        <p className="text-gray-600">Manage your product {viewMode.replace('-', ' ')}</p>
      </div>

      {/* Breadcrumbs */}
      {(viewMode === 'products-subcategories' || viewMode === 'products-list') && (
        <div className="flex items-center mb-6">
          <button
            onClick={navigateBack}
            className="flex items-center text-indigo-600 hover:text-indigo-800 mr-4"
          >
            <FiArrowLeft className="mr-1" />
            Back
          </button>
          <div className="flex items-center text-sm text-gray-600">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.id} className="flex items-center">
                {index > 0 && <span className="mx-2">/</span>}
                <span 
                  className={`${index === breadcrumbs.length - 1 ? 'font-medium text-gray-900' : 'text-indigo-600 hover:text-indigo-800 cursor-pointer'}`}
                  onClick={() => {
                    if (index === 0 && viewMode === 'products-list') {
                      setViewMode('products-subcategories');
                      setBreadcrumbs([breadcrumbs[0]]);
                    }
                  }}
                >
                  {crumb.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setViewMode('categories')}
            className={`px-4 py-2 rounded-lg ${viewMode === 'categories' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Categories
          </button>
          <button
            onClick={() => setViewMode('subcategories')}
            className={`px-4 py-2 rounded-lg ${viewMode === 'subcategories' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Subcategories
          </button>
          <button
            onClick={() => setViewMode('products')}
            className={`px-4 py-2 rounded-lg ${viewMode.startsWith('products') ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Products
          </button>
        </div>
        {!viewMode.startsWith('products') && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => addNewItem(viewMode === 'categories')}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <FiPlus className="mr-2" />
            Add {viewMode === 'categories' ? 'Category' : 'Subcategory'}
          </motion.button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : viewMode === 'categories' ? (
        categories.length === 0 ? (
          <div className="text-center py-12">
            <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No categories found</h3>
            <p className="mt-1 text-gray-500">Add your first category to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {categories.map(category => renderItem(category, true))}
          </div>
        )
      ) : viewMode === 'subcategories' ? (
        subcategories.length === 0 ? (
          <div className="text-center py-12">
            <FiLayers className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No subcategories found</h3>
            <p className="mt-1 text-gray-500">Add your first subcategory to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {subcategories.map(subcategory => renderItem(subcategory, false))}
          </div>
        )
      ) : viewMode === 'products' ? (
        categories.length === 0 ? (
          <div className="text-center py-12">
            <FiShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No categories found</h3>
            <p className="mt-1 text-gray-500">Add categories first to manage products</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map(category => (
              <motion.div
                key={category.id}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => fetchSubcategories(category.id)}
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 cursor-pointer hover:shadow-lg transition-all"
              >
                <div className="p-6">
                  <div className="flex items-center space-x-4">
                    {category.image && (
                      <img 
                        src={category.image} 
                        alt={category.name} 
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <h3 className="font-medium text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${category.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {category.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-sm text-gray-500">Priority: {category.priority}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )
      ) : viewMode === 'products-subcategories' ? (
        subcategories.length === 0 ? (
          <div className="text-center py-12">
            <FiLayers className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No subcategories found</h3>
            <p className="mt-1 text-gray-500">This category doesn't have any subcategories yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subcategories.map(subcategory => (
              <motion.div
                key={subcategory.id}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => fetchProducts(subcategory.id)}
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 cursor-pointer hover:shadow-lg transition-all"
              >
                <div className="p-6">
                  <div className="flex items-center space-x-4">
                    {subcategory.image && (
                      <img 
                        src={subcategory.image} 
                        alt={subcategory.name} 
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <h3 className="font-medium text-gray-900">{subcategory.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {subcategory.products?.length || 0} products
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${subcategory.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {subcategory.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-sm text-gray-500">Priority: {subcategory.priority}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )
      ) : viewMode === 'products-list' ? (
        products.length === 0 ? (
          <div className="text-center py-12">
            <FiShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No products found</h3>
            <p className="mt-1 text-gray-500">This subcategory doesn't have any products yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map(product => renderProductItem(product))}
          </div>
        )
      ) : null}
    </div>
  );
};

export default Products;