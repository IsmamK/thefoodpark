import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

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

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 p-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-60 bg-gray-200/50 rounded-2xl backdrop-blur-sm animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <section className="relative py-8 bg-white text-black overflow-hidden">
      {/* Background Blobs (New Colorful Backdrops) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-16 -left-10 w-64 h-64 bg-red-400/10 rounded-full filter blur-2xl"></div>
        <div className="absolute bottom-0 -right-10 w-64 h-64 bg-orange-400/10 rounded-full filter blur-2xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold mb-2 text-black">
            <span className="bg-gradient-to-r from-red-500 via-orange-500 to-black text-transparent bg-clip-text">
              Our Categories
            </span>
          </h2>
          <div className="w-16 h-1 mx-auto my-3 rounded-full bg-gradient-to-r from-red-500 to-black"></div>
          <p className="text-gray-700 font-medium max-w-md mx-auto">
            Premium frozen delights at your fingertips
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="relative group"
              onClick={() => navigate(`/categories/${category.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <div className="relative h-full bg-white border border-black/10 rounded-2xl p-4 shadow hover:shadow-xl transition">
                {/* Image */}
                <div className="relative h-32 mb-3 flex items-center justify-center">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="max-h-full w-auto transition-transform duration-300 group-hover:scale-105"
                    style={{ filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.1))' }}
                  />
                </div>

                {/* Info */}
                <div className="text-center">
                  <h3 className="font-bold text-black mb-1 text-sm line-clamp-1">{category.name}</h3>
                  <p className="text-gray-600 text-xs line-clamp-2 mb-2">{category.description}</p>
                  <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-red-600 to-black text-white rounded-full text-xs shadow">
                    View
                  </div>
                </div>

                {/* Feature label */}
                {category.feature_label && (
                  <div className="absolute top-2 right-2 bg-black text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm">
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
