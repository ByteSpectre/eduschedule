import { Link, useLocation, Outlet } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Calendar, 
  Settings, 
  LayoutDashboard, 
  Database, 
  BarChart3,
  Moon,
  Sun,
  Menu,
  X
} from 'lucide-react';
import { cn } from '../utils/cn';
import { useState } from 'react';

const navItems = [
  { path: '/org-admin/branches', label: 'Филиалы', icon: LayoutDashboard },
  { path: '/viewer', label: 'Просмотр', icon: Calendar },
  { path: '/admin', label: 'Редактор', icon: Calendar },
  { path: '/data', label: 'Справочники', icon: Database },
  { path: '/analytics', label: 'Аналитика', icon: BarChart3 },
  { path: '/settings', label: 'Настройки', icon: Settings },
];

export function Layout() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className={cn(
        'lg:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700',
        'fixed lg:sticky top-0 h-screen z-30 transition-transform duration-300',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-6 py-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-500 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                    EduSchedule
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Система расписания
                  </p>
                </div>
              </div>
              <button
                className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Theme Toggle */}
          <div className="px-4 py-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-5 h-5" />
                  <span className="font-medium">Темная тема</span>
                </>
              ) : (
                <>
                  <Sun className="w-5 h-5" />
                  <span className="font-medium">Светлая тема</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile menu backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {navItems.find(item => item.path === location.pathname)?.label || 'EduSchedule'}
            </h2>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

