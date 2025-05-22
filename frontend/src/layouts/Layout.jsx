import React from 'react';
import { Outlet } from 'react-router-dom';
import Footer from '../components/layout_components/Footer';
import Header from '../components/layout_components/Header';


const Layout = () => {
  return (
    <>
         <Header />
      <Outlet />
 
      {/* Footer will be hidden on lg (1024px) and larger screens */}
      <div className="sticky bottom-0 lg:hidden z-10 mt-20">
        <Footer />
      </div>
    </>
  );
};

export default Layout;