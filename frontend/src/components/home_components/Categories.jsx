import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Add this import

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiUrl = import.meta.env.VITE_API_URL;     
  const navigate = useNavigate(); // Add this hook


  useEffect(() => {
    axios.get(`${apiUrl}/categories/`)
      .then(res => {
        const activeCategories = res.data
          .filter(cat => cat.is_active)
          .sort((a, b) => a.priority - b.priority);
        setCategories(activeCategories);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-60 bg-gray-100/30 rounded-2xl backdrop-blur-sm animate-pulse"></div>
      ))}
    </div>
  );


  return (
    <section className="relative py-8 overflow-hidden">
      {/* Background elements (simplified for mobile) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-20 top-1/4 w-64 h-64 bg-purple-500/10 rounded-full filter blur-xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3">
            <span className="bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
              Our Categories
            </span>
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto my-3 rounded-full"></div>


          <p className="text-gray-600 font-bold  max-w-md mx-auto">
            Premium frozen delights at your fingertips
          </p>
        </div>

        {/* 2-Column Grid for Mobile */}
        <div className="grid grid-cols-2 gap-4">
          {categories.map((category) => (
            <div 
              key={category.id}
              className="relative group"
              onClick={() => navigate(`/categories/${category.id}`)} // Add this click handler
              style={{ cursor: 'pointer' }}
            >
              {/* Simplified Card for Mobile */}
              <div className="relative h-full bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-4 shadow-md overflow-hidden">
                {/* Product Image (centered) */}
                <div className="relative h-32 mb-3 flex items-center justify-center">
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="max-h-full w-auto transition-transform duration-300 group-hover:scale-105"
                    style={{ filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.1))' }}
                  />
                </div>
                
                {/* Category Info (simplified) */}
                <div className="text-center">
                  <h3 className="font-bold text-gray-800 mb-1 text-sm line-clamp-1">{category.name}</h3>
                  <p className="text-gray-600 text-xs line-clamp-2 mb-2">{category.description}</p>
                  
                  {/* Compact Button */}
                    <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-xs shadow">
                  View
                </div>
                </div>

                {/* Mobile-optimized Label */}
                {category.feature_label && (
                  <div className="absolute top-2 right-2 bg-white/90 px-2 py-0.5 rounded-full text-[10px] font-bold text-purple-600 shadow-sm">
                    {category.feature_label}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;