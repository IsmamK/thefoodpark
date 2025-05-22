import { motion } from 'framer-motion';
import { 
  FaShoppingBag, 
  FaBoxOpen, 
  FaTags, 
  FaArrowRight,
  FaChartLine,
  FaUsers
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const dashboardCards = [
    {
      title: "Orders",
      description: "View and manage all customer orders from this section.",
      icon: <FaShoppingBag className="text-3xl" />,
      action: "Go to Orders",
      gradient: "from-blue-500 to-cyan-400",
      route: "/admin/orders"
    },
    {
      title: "Products",
      description: "Add, edit, or remove products from your store.",
      icon: <FaBoxOpen className="text-3xl" />,
      action: "Go to Products",
      gradient: "from-purple-500 to-pink-500",
      route: "/admin/products"
    },
    {
      title: "Discounts",
      description: "Set up and apply discounts for your products.",
      icon: <FaTags className="text-3xl" />,
      action: "Go to Discounts",
      gradient: "from-amber-500 to-orange-500",
      route: "/admin/discount"
    },
    {
      title: "Analytics",
      description: "View sales reports and business performance metrics.",
      icon: <FaChartLine className="text-3xl" />,
      action: "View Analytics",
      gradient: "from-emerald-500 to-teal-400",
      route: "/admin/analytics"
    },
    {
      title: "Customers",
      description: "Manage customer accounts and view purchase history.",
      icon: <FaUsers className="text-3xl" />,
      action: "Manage Customers",
      gradient: "from-indigo-500 to-violet-500",
      route: "/admin/customers"
    }
  ];

  return (
    <div className="p-6">
      {/* Dashboard Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your store today.</p>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500"
        >
          <h3 className="text-gray-500 text-sm font-medium">TODAY'S ORDERS</h3>
          <p className="text-2xl font-bold text-gray-800">24</p>
          <div className="h-2 bg-blue-100 rounded-full mt-2">
            <div className="h-2 bg-blue-500 rounded-full w-3/4"></div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500"
        >
          <h3 className="text-gray-500 text-sm font-medium">WEEKLY REVENUE</h3>
          <p className="text-2xl font-bold text-gray-800">৳42,500</p>
          <div className="h-2 bg-green-100 rounded-full mt-2">
            <div className="h-2 bg-green-500 rounded-full w-2/3"></div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500"
        >
          <h3 className="text-gray-500 text-sm font-medium">NEW CUSTOMERS</h3>
          <p className="text-2xl font-bold text-gray-800">8</p>
          <div className="h-2 bg-purple-100 rounded-full mt-2">
            <div className="h-2 bg-purple-500 rounded-full w-1/2"></div>
          </div>
        </motion.div>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardCards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.03 }}
            className={`bg-gradient-to-r ${card.gradient} rounded-xl shadow-lg overflow-hidden text-white`}
          >
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold mb-2">{card.title}</h2>
                  <p className="text-white/90 mb-6">{card.description}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-lg">
                  {card.icon}
                </div>
              </div>
              <button
                onClick={() => navigate(card.route)}
                className="flex items-center bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all"
              >
                {card.action}
                <FaArrowRight className="ml-2" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white rounded-xl shadow-md p-6 mt-8"
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[
            { id: 1, action: "New order #1254 placed", time: "2 minutes ago", user: "Rahim Khan" },
            { id: 2, action: "Product 'Cheesy Dumplings' updated", time: "25 minutes ago", user: "You" },
            { id: 3, action: "New discount code added", time: "1 hour ago", user: "You" },
            { id: 4, action: "Order #1253 shipped", time: "3 hours ago", user: "Shipment Team" }
          ].map((activity) => (
            <div key={activity.id} className="flex items-start pb-4 border-b border-gray-100 last:border-0">
              <div className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-4">
                <FaShoppingBag />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">{activity.action}</p>
                <p className="text-sm text-gray-500">{activity.time} • {activity.user}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;