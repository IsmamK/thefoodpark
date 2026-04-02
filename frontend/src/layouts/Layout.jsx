import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Footer from '../components/layout_components/Footer';
import Navbar from '../components/layout_components/Header';


const Layout = () => {
  const location = useLocation();
const showFooter = !['/cart', '/checkout'].includes(location.pathname);
  return (
    <>
         <Navbar />
      <Outlet />
 
      {/* Footer will be hidden on lg (1024px) and larger screens */}
      <div className="sticky bottom-0 lg:hidden z-10 mt-20">
    {showFooter && <Footer />}
          </div>
    </>
  );
};

export default Layout;