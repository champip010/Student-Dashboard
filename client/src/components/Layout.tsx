import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { path: '/', label: t('Dashboard'), icon: '📊' },
    { path: '/custom-dashboard', label: t('Custom Dashboard'), icon: '🧩' },
    { path: '/students', label: t('Students'), icon: '👨‍🎓' },
    { path: '/classes', label: t('Classes'), icon: '📚' },
    { path: '/assignments', label: t('Assignments'), icon: '📝' },
    { path: '/tests', label: t('Tests'), icon: '✍️' },
    { path: '/research', label: t('Research Progress'), icon: '🔬' },
    { path: '/analytics', label: t('Analytics'), icon: '📈' },
  ];

  const handleLogout = () => {
    logout();
  };

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'zh' : 'en';
    i18n.changeLanguage(nextLang);
  };

  return (
    <div className="min-h-screen flex">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:translate-x-0`}
      >
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold">Student Manager</h1>
          <p className="text-sm text-gray-400 mt-1">{user?.role ? t(user.role.charAt(0) + user.role.slice(1).toLowerCase()) : ''}</p>
        </div>
        <nav className="mt-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors ${
                location.pathname === item.path ? 'bg-gray-800 text-white border-l-4 border-blue-500' : ''
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-800 space-y-2">
          <button
            onClick={toggleLanguage}
            className="w-full bg-gray-700 text-white py-2 rounded-md hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
          >
            🌐 {i18n.language === 'en' ? '中文' : 'English'}
          </button>
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            {t('Logout')}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-gray-600 hover:text-gray-900"
            >
              ☰
            </button>
            <div className="text-sm text-gray-500">
              {user?.teacherProfile
                ? `${user.teacherProfile.firstName} ${user.teacherProfile.lastName}`
                : user?.studentProfile
                ? `${user.studentProfile.firstName} ${user.studentProfile.lastName}`
                : user?.email}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 bg-gray-50 overflow-auto">
          <Outlet />
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
