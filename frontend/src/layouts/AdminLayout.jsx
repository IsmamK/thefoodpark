import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiShoppingBag, FiPackage, FiTag, FiMenu, FiX,
  FiLogOut, FiDollarSign, FiGrid, FiImage, FiSettings,
  FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const NAV = [
  {
    group: "Main",
    items: [
      {
        name: "dashboard",
        icon: FiGrid,
        label: "Dashboard",
        path: "/admin",
      },
      {
        name: "orders",
        icon: FiShoppingBag,
        label: "Orders",
        path: "/admin/orders",
      },
    ],
  },
  {
    group: "Catalog",
    items: [
      {
        name: "products",
        icon: FiPackage,
        label: "Products",
        path: "/admin/products",
      },
      {
        name: "discounts",
        icon: FiTag,
        label: "Discounts",
        path: "/admin/discount",
      },
    ],
  },
];

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(true);
      else setIsSidebarOpen(false);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeItem = NAV.flatMap(s => s.items).find(i =>
    i.path === '/admin'
      ? location.pathname === '/admin'
      : location.pathname.startsWith(i.path)
  );
const activeLabel = activeItem?.label ?? "Dashboard";

  const sidebarW = isMobile ? 240 : collapsed ? 64 : 220;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; background: #f9fafb; }

        .nav-link {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 10px; border-radius: 10px;
          font-size: 13px; font-weight: 600; color: #6b7280;
          text-decoration: none; cursor: pointer; border: none;
          background: transparent; width: 100%;
          transition: background 0.12s, color 0.12s;
          white-space: nowrap; overflow: hidden;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .nav-link:hover { background: #f3f4f6; color: #111827; }
        .nav-link.active { background: #111827; color: #ffffff; }
        .nav-link.active svg { color: #fff !important; }
        .nav-link svg { flex-shrink: 0; color: #9ca3af; transition: color 0.12s; }
        .nav-link:hover svg { color: #374151; }

        .group-label {
          font-size: 9.5px; font-weight: 700; color: #d1d5db;
          text-transform: uppercase; letter-spacing: 0.1em;
          padding: 0 6px; margin-bottom: 4px;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .collapse-btn {
          display: flex; align-items: center; gap: 8px;
          width: 100%; padding: 8px 10px; border-radius: 10px;
          border: 1px solid #f3f4f6; background: #f9fafb;
          color: #6b7280; font-size: 12px; font-weight: 600;
          cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
          transition: background 0.12s, color 0.12s;
          white-space: nowrap; overflow: hidden;
        }
        .collapse-btn:hover { background: #f3f4f6; color: #111827; }

        .logout-btn {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 10px; border-radius: 10px;
          border: 1px solid #fee2e2; background: #fff5f5;
          color: #ef4444; font-size: 13px; font-weight: 600;
          cursor: pointer; width: 100%;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: background 0.12s;
          white-space: nowrap; overflow: hidden;
        }
        .logout-btn:hover { background: #fee2e2; }
        .logout-btn svg { color: #ef4444 !important; flex-shrink: 0; }

        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 99px; }
        ::-webkit-scrollbar-track { background: transparent; }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

        {/* Mobile overlay */}
        <AnimatePresence>
          {isSidebarOpen && isMobile && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 40 }}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <AnimatePresence>
          {(isSidebarOpen || !isMobile) && (
            <motion.aside
              initial={{ x: isMobile ? -260 : 0 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{
                width: sidebarW,
                minHeight: '100vh',
                background: '#ffffff',
                borderRight: '1px solid #f3f4f6',
                display: 'flex',
                flexDirection: 'column',
                position: isMobile ? 'fixed' : 'sticky',
                top: 0,
                left: 0,
                height: '100vh',
                zIndex: 50,
                flexShrink: 0,
                overflow: 'hidden',
                transition: 'width 0.2s ease',
                boxShadow: isMobile ? '4px 0 24px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              {/* Logo */}
              <div style={{
                padding: collapsed && !isMobile ? '18px 0' : '18px 14px',
                borderBottom: '1px solid #f3f4f6',
                display: 'flex', alignItems: 'center',
                justifyContent: collapsed && !isMobile ? 'center' : 'space-between',
                minHeight: 64, gap: 8,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 9,
                    background: '#111827',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <FiShoppingBag size={14} color="#fff" />
                  </div>
                  {(!collapsed || isMobile) && (
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 800, color: '#111827', lineHeight: 1 }}>FoodPark</p>
                      <p style={{ fontSize: 10, color: '#9ca3af', marginTop: 2, fontWeight: 500 }}>Admin Panel</p>
                    </div>
                  )}
                </div>
                {isMobile && (
                  <button onClick={() => setIsSidebarOpen(false)}
                    style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}>
                    <FiX size={15} />
                  </button>
                )}
              </div>

              {/* Nav */}
              <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
                {NAV.map((section) => (
                  <div key={section.group} style={{ marginBottom: 18 }}>
                    {(!collapsed || isMobile) && (
                      <p className="group-label">{section.group}</p>
                    )}
                    {collapsed && !isMobile && <div style={{ height: 6 }} />}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {section.items.map(({ name, icon: Icon, label, path }) => {
                        const isActive = path === '/admin'
                          ? location.pathname === '/admin'
                          : location.pathname.startsWith(path);
                        return (
                          <button
                            key={name}
                            onClick={() => { navigate(path); if (isMobile) setIsSidebarOpen(false); }}
                            className={`nav-link${isActive ? ' active' : ''}`}
                            style={collapsed && !isMobile ? { justifyContent: 'center', padding: '8px 0' } : {}}
                            title={collapsed && !isMobile ? label : undefined}
                          >
                            <Icon size={15} />
                            {(!collapsed || isMobile) && <span>{label}</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>

              {/* Bottom */}
              <div style={{ padding: '8px 8px 14px', borderTop: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', gap: 5 }}>
                <button className="logout-btn"
                  style={collapsed && !isMobile ? { justifyContent: 'center', padding: '8px 0' } : {}}
                  title={collapsed && !isMobile ? 'Logout' : undefined}
                >
                  <FiLogOut size={14} />
                  {(!collapsed || isMobile) && <span>Logout</span>}
                </button>

                {!isMobile && (
                  <button className="collapse-btn"
                    onClick={() => setCollapsed(c => !c)}
                    style={collapsed ? { justifyContent: 'center' } : {}}
                  >
                    <FiChevronLeft size={13} style={{
                      transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                      flexShrink: 0,
                    }} />
                    {!collapsed && <span>Collapse</span>}
                  </button>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>

          {/* Topbar */}
          <header style={{
            background: '#ffffff',
            borderBottom: '1px solid #f3f4f6',
            padding: '0 24px',
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 30,
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {isMobile && (
                <button onClick={() => setIsSidebarOpen(true)}
                  style={{ background: 'none', border: 'none', color: '#374151', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}>
                  <FiMenu size={18} />
                </button>
              )}
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: '#111827', lineHeight: 1, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {activeLabel}
                </h2>
                <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 2, fontWeight: 500, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: '#111827',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 800, fontSize: 13,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>A</div>
                <span style={{
                  position: 'absolute', top: 1, right: 1,
                  width: 8, height: 8, background: '#22c55e',
                  borderRadius: '50%', border: '1.5px solid #fff',
                }} />
              </div>
            </div>
          </header>

          {/* Page content */}
          <main style={{ flex: 1, padding: 24, minWidth: 0 }}>
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminLayout;