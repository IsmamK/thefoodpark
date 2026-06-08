import { Route, createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

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

    // This makes https://thefoodpark.xyz/dashboard work
    {
      path: "/dashboard",
      element: <Dashboard />,
    },

    {
      path: "/admin",
      element: <AdminLayout />,
      children: [
        // This makes https://thefoodpark.xyz/admin open dashboard
        { index: true, element: <Dashboard /> },

        // This makes https://thefoodpark.xyz/admin/dashboard work
        { path: "dashboard", element: <Dashboard /> },

        { path: "orders", element: <Orders /> },
        { path: "products", element: <Products /> },
        { path: "discount", element: <Discount /> },
      ],
    },

    // Optional fallback for wrong routes
    {
      path: "*",
      element: <Navigate to="/" replace />,
    },
  ]);

  return <RouterProvider router={router} />;
};

export default App;