import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

const Home = lazy(() => import("./pages/Home"));
const Layout = lazy(() => import("./layouts/Layout"));
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));

const Dashboard = lazy(() => import("./AdminDashboard/Dashboard"));
const Orders = lazy(() => import("./AdminDashboard/Orders"));
const Products = lazy(() => import("./AdminDashboard/Products"));
const Discount = lazy(() => import("./AdminDashboard/Discount"));

const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));

const PageLoader = () => (
  <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="h-10 w-10 rounded-full border-4 border-yellow-500 border-t-transparent animate-spin" />
  </div>
);

const withSuspense = (element) => (
  <Suspense fallback={<PageLoader />}>{element}</Suspense>
);

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

const AdminPlaceholder = ({ title }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">{title}</h1>
      <p className="text-gray-600">This admin page is not available yet.</p>
    </div>
  );
};

const App = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: withSuspense(<Layout />),
      children: [
        { index: true, element: withSuspense(<Home />) },
        { path: "home", element: withSuspense(<Home />) },
        { path: "categories/:id", element: withSuspense(<CategoryPage />) },
        { path: "cart", element: withSuspense(<Cart />) },
        { path: "checkout", element: withSuspense(<Checkout />) },
      ],
    },

    {
      path: "/dashboard",
      element: <Navigate to="/admin" replace />,
    },

    {
      path: "/admin",
      element: withSuspense(<AdminLayout />),
      children: [
        { index: true, element: withSuspense(<Dashboard />) },

        { path: "dashboard", element: withSuspense(<Dashboard />) },
        { path: "orders", element: withSuspense(<Orders />) },
        { path: "products", element: withSuspense(<Products />) },

        { path: "discount", element: withSuspense(<Discount />) },
        { path: "discounts", element: withSuspense(<Discount />) },

        { path: "categories", element: <AdminCategories /> },
        { path: "subcategories", element: <AdminSubCategories /> },
        { path: "banners", element: <AdminBanners /> },
        { path: "analytics", element: <AdminPlaceholder title="Analytics" /> },
        { path: "customers", element: <AdminPlaceholder title="Customers" /> },
        { path: "*", element: <AdminPlaceholder title="Page not found" /> },
      ],
    },

    {
      path: "*",
      element: <Navigate to="/" replace />,
    },
  ]);

  return <RouterProvider router={router} />;
};

export default App;
