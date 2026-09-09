import type { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Bookmark, LogOut, Radar } from 'lucide-react';

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Discover', path: '/', icon: <Radar size={20} /> },
    { name: 'Applications', path: '/applications', icon: <Briefcase size={20} /> },
    { name: 'Saved', path: '/saved', icon: <Bookmark size={20} /> },
  ];

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]"><div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0f]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#2a2a3a] bg-[#111118] flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-[#2a2a3a]">
          <Radar className="text-indigo-500 mr-2" size={24} />
          <h1 className="text-xl font-bold gradient-text tracking-wider">JOBRADAR</h1>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#1d1d28]'
                }`}
              >
                {item.icon}
                <span className="ml-3 font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#2a2a3a]">
          <div className="flex items-center mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#0a0a0f] relative">
        <div className="absolute top-0 left-0 right-0 h-64 bg-indigo-500/5 blur-[100px] -z-10 pointer-events-none rounded-full transform -translate-y-1/2"></div>
        {children}
      </main>
    </div>
  );
}
