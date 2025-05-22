import React, { useState } from 'react';
import Categories from '../components/home_components/Categories';
import BannerCarousel from '../components/home_components/BannerCarousel';
import { ProductHighlights } from '../components/home_components/ProductHighlights';
import { WhyChooseUs } from '../components/home_components/WhyChooseUs';

const FoodParkWebsite = () => {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'} transition-colors duration-300`}>
      
            
            

      <div className="max-w-6xl mx-auto px-4 py-8">

      <BannerCarousel />
        
      <Categories />
      
      <ProductHighlights/>
      
      <WhyChooseUs />


      </div>
      
    </div>
  );
};

export default FoodParkWebsite;