import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const FloatingBannerCarousel = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef(null);
  const apiUrl = import.meta.env.VITE_API_URL

  
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await axios.get(`${apiUrl}/banners`);
        setBanners(response.data.filter(banner => banner.active));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching banners:', err);
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  // Auto-rotate banners
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  // Parallax effect on mouse move
  useEffect(() => {
    if (!carouselRef.current || banners.length === 0) return;

    const handleMouseMove = (e) => {
      const carousel = carouselRef.current;
      const { left, top, width, height } = carousel.getBoundingClientRect();
      const x = (e.clientX - left) / width;
      const y = (e.clientY - top) / height;
      
      // Apply slight parallax movement
      carousel.style.setProperty('--x', `${(x - 0.5) * 20}px`);
      carousel.style.setProperty('--y', `${(y - 0.5) * 10}px`);
    };

    carouselRef.current.addEventListener('mousemove', handleMouseMove);
    return () => {
      if (carouselRef.current) {
        carouselRef.current.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [banners]);

  if (loading) {
    return (
      <div className="h-80 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl animate-pulse backdrop-blur-sm"></div>
    );
  }

  if (!banners.length) {
    return (
      <div className="h-80 bg-gradient-to-r from-pink-50 to-purple-50 rounded-3xl flex items-center justify-center backdrop-blur-sm">
        <p className="text-gray-400">No banners available</p>
      </div>
    );
  }

  return (
    <div 
      ref={carouselRef}
      className="relative w-full h-80 overflow-hidden rounded-3xl group"
      style={{
        transform: 'translate3d(var(--x, 0), var(--y, 0), 0)',
        transition: 'transform 0.3s ease-out',
      }}
    >
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl shadow-lg"></div>
      
      {/* Banner slides with blur-in effect */}
      <div className="relative w-full h-full flex transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
           style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
        {banners.map((banner, index) => (
          <div 
            key={banner.id}
            className="w-full h-full flex-shrink-0 relative"
          >
            <img
              src={banner.image}
              alt="Banner"
              className={`w-full h-full object-cover rounded-3xl transition-all duration-500 ${
                index === currentIndex ? 'opacity-100 blur-none' : 'opacity-0 blur-sm'
              }`}
              loading="lazy"
            />
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-3xl"></div>
          </div>
        ))}
      </div>

      {/* Navigation Dots (Floating Glass Style) */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-white w-6 backdrop-blur-sm bg-white/80' 
                  : 'bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Previous/Next Buttons (Glassmorphism) */}
      {banners.length > 1 && (
        <>
          <button
            onClick={() => setCurrentIndex(prev => (prev === 0 ? banners.length - 1 : prev - 1))}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 p-3 rounded-full backdrop-blur-sm shadow-md transition-all hover:scale-110"
            aria-label="Previous slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => setCurrentIndex(prev => (prev === banners.length - 1 ? 0 : prev + 1))}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 p-3 rounded-full backdrop-blur-sm shadow-md transition-all hover:scale-110"
            aria-label="Next slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
};

export default FloatingBannerCarousel;