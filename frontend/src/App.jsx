import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Layout from "./layouts/Layout";
import AdminLayout from "./layouts/AdminLayout";

import Dashboard from "./AdminDashboard/Dashboard";
import Orders from "./AdminDashboard/Orders";
import Products from "./AdminDashboard/Products";
import Discount from "./AdminDashboard/Discount";

import CategoryPage from "./pages/CategoryPage";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";

const AdminCategories = () => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Categories</h1>
      <p className="text-gray-600">Admin categories page is working.</p>
    </div>
  );
};

const AdminSubCategories = () => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Subcategories</h1>
      <p className="text-gray-600">Admin subcategories page is working.</p>
    </div>
  );
};

const AdminBanners = () => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Banners</h1>
      <p className="text-gray-600">Admin banners page is working.</p>
    </div>
  );
};

const App = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        { index: true, element: <Home /> },
        { path: "home", element: <Home /> },
        { path: "categories/:id", element: <CategoryPage /> },
        { path: "cart", element: <Cart /> },
        { path: "checkout", element: <Checkout /> },
      ],
    },

    {
      path: "/dashboard",
      element: <Navigate to="/admin" replace />,
    },

    {
      path: "/admin",
      element: <AdminLayout />,
      children: [
        { index: true, element: <Dashboard /> },

        { path: "dashboard", element: <Dashboard /> },
        { path: "orders", element: <Orders /> },
        { path: "products", element: <Products /> },

        { path: "discount", element: <Discount /> },
        { path: "discounts", element: <Discount /> },

        { path: "categories", element: <AdminCategories /> },
        { path: "subcategories", element: <AdminSubCategories /> },
        { path: "banners", element: <AdminBanners /> },
      ],
    },

    // {
    //   path: "*",
    //   element: <Navigate to="/" replace />,
    // },
  ]);

  return <RouterProvider router={router} />;
};

export default App;