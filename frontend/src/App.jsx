import { useState } from 'react'
import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider,useNavigate } from "react-router-dom";
import Home from './pages/Home';
import Layout from './layouts/Layout';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './AdminDashboard/Dashboard';
import Orders from './AdminDashboard/Orders';
import Products from './AdminDashboard/Products';
import Discount from './AdminDashboard/Discount';
import CategoryPage from './pages/CategoryPage';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';



const App = () => {


  const router = createBrowserRouter([
  
    {
      path: '/',
      element: <Layout />,
      children: [
        { path: '/', element: <Home /> },
        { path: 'home', element: <Home />},
        {path: 'categories/:id', element: <CategoryPage/>},
        {path: 'cart', element: <Cart></Cart>},
        {path: 'checkout', element: <Checkout></Checkout>}
      ]
    },
    {
      path: '/admin',
      element: <AdminLayout></AdminLayout>,
      children: [
        { index: true, element: <Dashboard /> },
        {path: 'dashboard', element: <Dashboard></Dashboard>},
        {path: 'orders', element: <Orders></Orders>},
        {path: 'products', element: <Products></Products>},
        {path: 'discount', element: <Discount></Discount>}
      ]
    }

  ]);

  return (
    <>
      {/* Include ToastContainer for global toasts */}
      <RouterProvider router={router} />
    </>
  );
};
  


export default () => (
    <App />
);
