import { useAuth } from '../context/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, MessageSquareText, Settings, Key, Bot } from 'lucide-react';

export default function Layout({ children }) {
  const { client, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Overview', path: '/home', icon: LayoutDashboard },
    { name: 'Create Agent', path: '/setup', icon: Settings },
    { name: 'AI Tester', path: '/tester', icon: MessageSquareText },
    { name: 'Website Widget', path: '/ai-assistant', icon: Bot },
    { name: 'Open API', path: '/openapi', icon: Key },
  ];

  return (
    <div className="flex h-screen w-screen bg-[#09090b] text-slate-200 font-sans selection:bg-[#10b981] selection:text-white">
      {/* Sidebar */}
      <aside className="w-[280px] shrink-0 border-r border-[#27272a] bg-[#0c0c0e] flex flex-col justify-between">
        <div>
          {/* Brand */}
          <div className="p-6 flex items-center gap-3">
            <div className="min-w-[36px] min-h-[36px] rounded-xl bg-gradient-to-br from-[#10b981] to-[#059669] shadow-[0_4px_20px_rgba(16,185,129,0.3)] flex items-center justify-center">
              <span className="text-white font-black text-xl italic leading-none relative top-[-1px]">K</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">Kiwi RAG</h1>
          </div>

          {/* Navigation */}
          <nav className="mt-4 px-4 flex flex-col gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[rgba(16,185,129,0.1)] text-[#10b981] shadow-inner border border-[rgba(16,185,129,0.2)]'
                      : 'text-slate-400 hover:bg-[#18181b] hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-[#10b981]' : ''} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile */}
        <div className="p-4 m-4 rounded-2xl bg-[#121214] border border-[#27272a]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#27272a]">
              <img src={`https://ui-avatars.com/api/?name=${client?.businessName || 'U'}&background=10b981&color=fff`} alt="user" className="w-full h-full object-cover" />
            </div>
            <div className="overflow-hidden">
              <h3 className="font-bold text-sm text-slate-100 truncate">{client?.businessName}</h3>
              <p className="text-[11px] text-slate-500 truncate">{client?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-[rgba(239,68,68,0.1)] text-red-500 hover:bg-red-500 hover:text-white transition-colors text-sm font-semibold border border-[rgba(239,68,68,0.2)] hover:border-transparent"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-[#09090b] relative overflow-hidden flex flex-col">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#10b981]/5 blur-[120px] rounded-full pointer-events-none"></div>
        {children}
      </main>
    </div>
  );
}
