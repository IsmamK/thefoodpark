import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Plus, Minus, X, Star, Clock, ChefHat, Snowflake } from 'lucide-react';
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

  // Track view content when product is selected
  useEffect(() => {
    if (selectedProduct) {
      trackViewContent(selectedProduct);
    }
  }, [selectedProduct]);

  // Track add to cart events
  const trackAddToCart = (product) => {
    axios.post(`${apiUrl}/track/add_to_cart/`, {
      product: {
        id: product.id,
        title: product.title,
        price: product.price,
        currency: 'BDT'
      }
    }).catch(err => {
      console.error('Error tracking add to cart:', err);
    });
  };

  // Track view content events
  const trackViewContent = (product) => {
    axios.post(`${apiUrl}/track/view_content/`, {
      product: {
        id: product.id,
        title: product.title,
        price: product.price,
        currency: 'BDT'
      }
    }).catch(err => {
      console.error('Error tracking view content:', err);
    });
  };

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
    const existingItemIndex = cartItems.findIndex(item => item.id === product.id);
    let updatedCart = [...cartItems];

    if (action === 'add') {
      if (existingItemIndex >= 0) {
        updatedCart[existingItemIndex].quantity += 1;
      } else {
        updatedCart.push({
          id: product.id,
          title: product.title,
          description: product.description,
          image: product.image,
          price: product.price,
          quantity: 1
        });
      }
      trackAddToCart(product);
      showToast(`${product.title} added to cart`);
    } else {
      if (updatedCart[existingItemIndex].quantity > 1) {
        updatedCart[existingItemIndex].quantity -= 1;
      } else {
        updatedCart = updatedCart.filter(item => item.id !== product.id);
      }
    }
    updateCart(updatedCart);
  };

  const showToast = (message) => {
    Swal.fire({
      text: message,
      icon: "success",
      timer: 1000,
      showConfirmButton: false,
      position: 'top-end',
      background: '#fff',
      toast: true
    });
  };

  const getProductQuantity = (productId) => {
    return cartItems.find(item => item.id === productId)?.quantity || 0;
  };

  if (loading) return <LoadingSkeleton />;
  if (!category) return <ErrorState navigate={navigate} />;

  return (
    <div className="min-h-screen bg-white">

      {/* Category Header */}
      <div className="relative h-48 w-full overflow-hidden bg-gradient-to-r from-yellow-50 to-amber-50 border-b-2 border-yellow-200">
        <div className="absolute inset-0 flex items-end p-6">
          <div className="relative z-10 max-w-4xl">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-yellow-600 hover:text-yellow-700 mb-4 font-medium transition-colors duration-200 underline-offset-2 hover:underline"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              <span>Back to Menu</span>
            </button>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)] leading-tight">
              {category.name}
            </h1>
            <p className="text-gray-700 mt-2 max-w-prose leading-relaxed drop-shadow-[0_1px_1px_rgba(0,0,0,0.03)]">
              {category.description}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {subcategories.map(subcategory => (
          <section key={subcategory.id} className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                {subcategory.name}
                {subcategory.feature_label && (
                  <span className="ml-3 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {subcategory.feature_label}
                  </span>
                )}
              </h2>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subcategory.products?.filter(p => p.is_active).map(product => {
                const quantity = getProductQuantity(product.id);
                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl border border-gray-200 hover:border-yellow-300 shadow-sm hover:shadow-md transition-all overflow-hidden flex"
                  >
                    {/* Product Image */}
                    <div 
                      className="w-32 h-32 flex-shrink-0 bg-gray-50 overflow-hidden cursor-pointer"
                      onClick={() => setSelectedProduct(product)}
                    >
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                      {product.is_bestseller && (
                        <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                          Bestseller
                        </span>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-800 line-clamp-1">
                          {product.title}
                        </h3>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                          {product.description}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-base font-bold text-yellow-600">৳{product.price}</span>
                        
                        {quantity > 0 ? (
                          <div className="flex items-center gap-2 bg-yellow-50 px-2 py-1 rounded-full">
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleCartAction(product, 'remove'); }}
                              className="w-6 h-6 bg-white text-yellow-600 rounded-full flex items-center justify-center hover:bg-yellow-100 transition"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-medium">{quantity}</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleCartAction(product, 'add'); }}
                              className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center hover:bg-yellow-600 transition"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleCartAction(product, 'add'); }}
                            className="px-3 py-1.5 text-xs bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium flex items-center gap-1 transition"
                          >
                            <ShoppingCart className="w-3 h-3" />
                            <span>Add</span>
                          </button>
                        )}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl overflow-hidden">
            {/* Product Image with Close Button */}
            <div className="relative h-48 bg-gray-50 flex items-center justify-center">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.title}
                className="w-full h-full object-contain p-8"
              />
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 bg-white/90 text-gray-800 p-1.5 rounded-full shadow-sm hover:bg-white transition"
              >
                <X className="w-5 h-5" />
              </button>
              {selectedProduct.is_bestseller && (
                <span className="absolute top-4 left-4 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                  Bestseller
                </span>
              )}
            </div>
            
            {/* Product Details */}
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">{selectedProduct.title}</h2>
              <p className="text-gray-600 mb-6">{selectedProduct.description}</p>
              
              <div className="flex items-center justify-between mb-6">
                <span className="text-xl font-bold text-yellow-600">৳{selectedProduct.price}</span>
                <div className="flex items-center gap-3 bg-yellow-50 px-3 py-1.5 rounded-lg">
                  <button 
                    onClick={() => handleCartAction(selectedProduct, 'remove')}
                    className="w-8 h-8 bg-white text-yellow-600 rounded-lg flex items-center justify-center hover:bg-yellow-100 transition"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-base font-medium">{getProductQuantity(selectedProduct.id) || 0}</span>
                  <button
                    onClick={() => handleCartAction(selectedProduct, 'add')}
                    className="w-8 h-8 bg-yellow-500 text-white rounded-lg flex items-center justify-center hover:bg-yellow-600 transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <button
                onClick={() => {
                  handleCartAction(selectedProduct, 'add');
                  setSelectedProduct(null);
                }}
                className="w-full py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-lg font-bold hover:shadow-lg transition flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Loading and Error States
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-white">
    <div className="h-48 bg-gradient-to-r from-yellow-50 to-amber-50 animate-pulse"></div>
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse"></div>
      ))}
    </div>
  </div>
);

const ErrorState = ({ navigate }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-yellow-50">
    <div className="bg-white p-6 rounded-xl shadow-lg text-center border border-gray-100 max-w-xs mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Category not found</h2>
      <button
        onClick={() => navigate('/')}
        className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-lg hover:shadow-lg transition w-full"
      >
        Back to Home
      </button>
    </div>
  </div>
);

export default CategoryPage;