import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

const CategoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  const [category, setCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartItems, setCartItems] = useState([]);

  // Load cart items from localStorage
  useEffect(() => {
    const items = JSON.parse(localStorage.getItem('cartItems')) || [];
    setCartItems(items);
    
    const handleCartUpdate = () => {
      const updatedItems = JSON.parse(localStorage.getItem('cartItems')) || [];
      setCartItems(updatedItems);
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoryRes, subcategoriesRes] = await Promise.all([
          axios.get(`${apiUrl}/categories/${id}/`),
          axios.get(`${apiUrl}/subcategories/?parent_category=${id}`)
        ]);

        setCategory(categoryRes.data);
        setSubcategories(subcategoriesRes.data.filter(sub => sub.is_active));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const updateCart = (updatedCart) => {
    localStorage.setItem('cartItems', JSON.stringify(updatedCart));
    setCartItems(updatedCart);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleCartAction = (product, action = 'add') => {
    try {
      const existingItemIndex = cartItems.findIndex(item => item.id === product.id);
      let updatedCart = [...cartItems];

      if (action === 'add') {
        if (existingItemIndex >= 0) {
          // Increase quantity
          updatedCart[existingItemIndex].quantity += 1;
        } else {
          // Add new item
          updatedCart.push({
            id: product.id,
            title: product.title,
            description: product.description,
            image: product.image,
            price: product.price,
            quantity: 1
          });
        }
        
        // Show success toast
        Swal.fire({
          title: "Added!",
          text: `${product.title} quantity updated`,
          icon: "success",
          timer: 1000,
          showConfirmButton: false,
          background: 'rgba(255, 255, 255, 0.99)',
          toast: true,
          position: 'top-end'
        });
      } else if (action === 'remove') {
        if (existingItemIndex >= 0) {
          if (updatedCart[existingItemIndex].quantity > 1) {
            // Decrease quantity
            updatedCart[existingItemIndex].quantity -= 1;
          } else {
            // Remove item
            updatedCart = updatedCart.filter(item => item.id !== product.id);
          }
        }
      }

      updateCart(updatedCart);
    } catch (error) {
      console.error("Error updating cart:", error);
    }
  };

  const getProductQuantity = (productId) => {
    const item = cartItems.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-pink-50 animate-pulse">
        <div className="h-72 bg-gray-100/30 rounded-b-3xl mb-6"></div>
        <div className="max-w-6xl mx-auto px-6">
          <div className="h-6 w-1/3 bg-gray-200/40 rounded-full mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200/40 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-100">
        <div className="bg-white p-6 rounded-xl shadow-xl text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Category not found</h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:shadow-lg transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-pink-50 relative">
      {/* Floating Blurs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-purple-200 opacity-20 rounded-full filter blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-pink-200 opacity-20 rounded-full filter blur-3xl -z-10"></div>

      {/* Hero */}
      <div className="max-w-6xl mt-10 relative h-80 mx-auto rounded-3xl overflow-hidden shadow-md">
        <img
          src={category.cover}
          alt={category.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent flex items-end p-6">
          <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow">
            <h1 className="text-3xl md:text-4xl font-bold text-white">{category.name}</h1>
            <p className="text-white/80">{category.description}</p>
          </div>
        </div>
      </div>

      {/* All Subcategories */}
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-12">
        {subcategories.map(subcategory => (
          <section key={subcategory.id} className="scroll-mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {subcategory.name}
              </h2>
              {subcategory.feature_label && (
                <span className="bg-purple-100 text-purple-600 text-xs font-bold px-3 py-1 rounded-full">
                  {subcategory.feature_label}
                </span>
              )}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {subcategory.products?.filter(p => p.is_active).map(product => {
                const quantity = getProductQuantity(product.id);
                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all overflow-hidden flex flex-col"
                  >
                    <div
                      className="relative h-40 bg-gray-50 flex items-center justify-center cursor-pointer"
                      onClick={() => setSelectedProduct(product)}
                    >
                      <img
                        src={product.image}
                        alt={product.title}
                        className="object-cover h-full w-full object-center transition-transform duration-300 hover:scale-105"
                      />
                      {product.is_bestseller && (
                        <span className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-[11px] px-2 py-0.5 rounded-full font-semibold shadow-md">
                          ⭐ Bestseller
                        </span>
                      )}
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div
                        className="cursor-pointer"
                        onClick={() => setSelectedProduct(product)}
                      >
                        <h3 className="text-sm font-semibold text-gray-800 line-clamp-1">
                          {product.title}
                        </h3>
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {product.description}
                        </p>
                      </div>
                      <div className="mt-3 flex justify-between items-center">
                        <span className="text-sm font-bold text-purple-600">{product.price}</span>
                        <div className="flex items-center gap-2">
                          {quantity > 0 ? (
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCartAction(product, 'remove');
                                }}
                                className="w-6 h-6 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center hover:bg-gray-300 transition"
                              >
                                -
                              </button>
                              <span className="text-sm font-medium text-gray-700 min-w-[20px] text-center">
                                {quantity}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCartAction(product, 'add');
                                }}
                                className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center hover:shadow-md transition"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCartAction(product, 'add');
                              }}
                              className="px-3 py-1 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:shadow-md transition"
                            >
                              Add
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Product Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl overflow-hidden">
            <div className="relative h-56 bg-gray-100">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.title}
                className="object-cover w-full h-full"
              />
              {selectedProduct.is_bestseller && (
                <span className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold shadow-md">
                  ⭐ Bestseller
                </span>
              )}
            </div>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800">{selectedProduct.title}</h2>
              <p className="text-sm text-gray-600 mt-2">{selectedProduct.description}</p>
              <p className="mt-4 text-purple-600 font-bold text-lg">{selectedProduct.price}</p>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  className="px-4 py-2 text-sm bg-gray-200 rounded-full hover:bg-gray-300 transition"
                  onClick={() => setSelectedProduct(null)}
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleCartAction(selectedProduct, 'add');
                    setSelectedProduct(null);
                  }}
                  className="px-4 py-2 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:shadow-lg transition"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;