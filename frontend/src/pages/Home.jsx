import { useState, useEffect } from 'react';
import { ShoppingCart, Clock, ChefHat, Phone, Mail, MapPin, Facebook, Instagram, Twitter, ArrowRight, Snowflake } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
export default function FoodParkWebsite() {
  const [categories, setCategories] = useState([]);
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  // Add this function to navigate using slug
const navigateToCategory = (slug) => {
  navigate(`/categories/${slug}`);
};

  // Your actual categories data
  useEffect(() => {
    const controller = new AbortController();

    fetch(`${apiUrl}/categories/`, { signal: controller.signal })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        const categoryData = Array.isArray(data) ? data : data?.results || [];
        const activeCategories = categoryData
          .filter(cat => cat.is_active)
          .sort((a, b) => a.priority - b.priority);
        setCategories(activeCategories);
      })
      .catch(err => {
        if (err.name === 'AbortError') return;
        console.error(err);
      });

    return () => controller.abort();
  }, [apiUrl]);

  return (
    <div className="min-h-screen bg-white">
      
      {/* Minimalist Navigation */}
     

      {/* Minimal Hero Section */}
      <section className="py-12 lg:py-20 bg-gradient-to-r from-yellow-50 to-amber-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            
            <div className="inline-flex items-center bg-yellow-100 text-yellow-800 rounded-full px-4 py-2 mb-6">
              <Snowflake className="w-4 h-4 mr-2" />
              <span className="text-sm font-semibold">Premium Frozen Foods</span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">
              Restaurant Quality
              <span className="text-yellow-500"> Frozen Foods</span>
            </h1>

            <p className="text-lg lg:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              From Korean corndogs to creamy pasta, discover premium frozen meals that taste like they're made fresh in your kitchen.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <a href="#categories" className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Shop Now
              </a>
            
            </div>

            {/* Clean Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-2xl font-black text-yellow-500 mb-1">{categories.length}</div>
                <div className="text-sm text-gray-500">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-yellow-500 mb-1">5min</div>
                <div className="text-sm text-gray-500">Ready Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-yellow-500 mb-1">100%</div>
                <div className="text-sm text-gray-500">Quality</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sleek Categories Section */}
      <section id="categories" className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4">
              Our <span className="text-yellow-500">Categories</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Premium frozen foods crafted with care. Each category represents our commitment to quality and taste.
            </p>
          </div>
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
  {categories.map((category) => (
    <div
      key={category.id}
      className="group relative flex flex-col items-center text-center cursor-pointer px-2 pt-3 pb-3 rounded-xl border border-yellow-400 hover:border-yellow-300 shadow-sm hover:shadow-md transition-all duration-300 bg-white hover:-translate-y-1"
    >
      {/* Premium Badge with Ribbon Effect */}
      {category.feature_label && (
        <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm z-10 transform  group-hover:rotate-3 transition-transform">
          <div className="absolute -left-1 top-0 bottom-0 w-1 bg-yellow-600"></div>
          {category.feature_label}
        </div>
      )}

      {/* Image Container with Floating Effect */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-4"
        onClick={() => navigateToCategory(category.id)}  // Use category.slug instead of category.id

      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <img
          src={category.image}
          alt={category.name}
          loading="lazy"
          decoding="async"
          width="96"
          height="96"
          className="relative z-10 w-full h-full object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-lg"
          onError={(e) => {
            e.target.src = '/api/placeholder/200/200';
          }}
        />
      </div>

      {/* Title with Gradient Text Effect */}
      <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-yellow-500 group-hover:to-yellow-600 transition-all duration-300">
        {category.name}
      </h3>

      {/* Enhanced CTA Button */}
    <button
  onClick={() => navigateToCategory(category.id)}  // Use category.slug instead of category.id
  className="w-full text-xs sm:text-sm px-2 py-2 mt-auto bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white rounded-lg font-medium flex items-center justify-center gap-1 transition-all duration-300 shadow-sm hover:shadow-md group-hover:shadow-yellow-200"
>
  <span>Explore</span>
  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1 group-hover:scale-125" />
</button>

      {/* Subtle Hover Overlay */}
      <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-yellow-200 pointer-events-none transition-all duration-300"></div>
    </div>
  ))}
</div>




        </div>
      </section>

      {/* Minimal Features Section */}
      <section className="py-16 bg-gradient-to-r from-yellow-50 to-amber-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-6">
                Why Choose <span className="text-yellow-500">The Food Park?</span>
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                We believe great food shouldn't be complicated. Our premium frozen meals deliver restaurant quality taste with the convenience of home cooking.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-yellow-100 rounded-lg p-3">
                    <Snowflake className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Flash Frozen Fresh</h4>
                    <p className="text-gray-600 text-sm">Locked in nutrition and flavor at peak freshness</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-yellow-100 rounded-lg p-3">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Ready in Minutes</h4>
                    <p className="text-gray-600 text-sm">From freezer to table in under 5 minutes</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-yellow-100 rounded-lg p-3">
                    <ChefHat className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Chef Crafted</h4>
                    <p className="text-gray-600 text-sm">Developed by culinary experts for authentic taste</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
  <h4 className="font-bold text-gray-800 mb-4 text-center">From Freezer to Table</h4>
  <div className="flex justify-between items-center">
    {['Freezer', 'Pan/Microwave', 'Plate'].map((step, i) => (
      <div key={i} className="flex flex-col items-center text-center">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center 
          ${i === 1 ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
          {i+1}
        </div>
        <span className="text-xs mt-2 text-gray-600">{step}</span>
        {i < 2 && <div className="flex-1 h-px bg-gray-200 mx-2"></div>}
      </div>
    ))}
  </div>
  <p className="text-center text-sm text-yellow-600 mt-4 font-medium">Ready in under 5 minutes</p>
</div>
          </div>
        </div>
      </section>

      {/* Clean Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            
            {/* Company Info */}
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-black text-sm">FP</span>
                </div>
                <h3 className="text-lg font-black">The Food Park</h3>
              </div>
              <p className="text-gray-400 mb-6 text-sm leading-relaxed">Premium frozen foods delivered fresh to your door. Quality you can taste.</p>
              <div className="flex space-x-4">
                <Facebook className="w-5 h-5 text-gray-400 hover:text-yellow-500 cursor-pointer transition-colors" />
                <Instagram className="w-5 h-5 text-gray-400 hover:text-yellow-500 cursor-pointer transition-colors" />
                <Twitter className="w-5 h-5 text-gray-400 hover:text-yellow-500 cursor-pointer transition-colors" />
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-bold mb-6 text-yellow-500 uppercase tracking-wide">Quick Links</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Home</a></li>
                <li><a href="#categories" className="text-gray-400 hover:text-white transition-colors">Categories</a></li>
                <li><a href="#about" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-sm font-bold mb-6 text-yellow-500 uppercase tracking-wide">Categories</h4>
              <ul className="space-y-3 text-sm">
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      {cat.name.replace('Frozen ', '')}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-bold mb-6 text-yellow-500 uppercase tracking-wide">Contact Us</h4>
              <div className="space-y-4 text-sm">
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-yellow-500" />
                  <span className="text-gray-400">1-800-FOOD-PARK</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-yellow-500" />
                  <span className="text-gray-400">hello@thefoodpark.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-yellow-500" />
                  <span className="text-gray-400">123 Food Street, BD</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center text-sm">
              <p className="text-gray-400 mb-4 md:mb-0">
                © 2025 The Food Park. All rights reserved.
              </p>
              <div className="flex space-x-6">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Cookies</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
