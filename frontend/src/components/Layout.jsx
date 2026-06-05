import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  LayoutDashboard, FileText, BookOpen, FilePlus, PenSquare,
  ClipboardCheck, Briefcase, HardHat, ShoppingCart, BarChart3,
  Users, LogOut, Building2, ChevronRight, Settings
} from 'lucide-react';

const navGroups = [
  {
    label: 'Contratos',
    items: [
      { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/contratos',    icon: FileText,         label: 'Contratos',   exact: true },
      { to: '/templates',    icon: BookOpen,         label: 'Templates' },
      { to: '/contratos/novo', icon: FilePlus,       label: 'Novo Contrato' },
      { to: '/assinaturas',  icon: PenSquare,        label: 'Assinaturas' },
      { to: '/gerenciador',  icon: Briefcase,        label: 'Gerenciador' },
    ],
  },
  {
    label: 'Obras',
    items: [
      { to: '/obras',          icon: HardHat,      label: 'Obras' },
      { to: '/ordens-compra',  icon: ShoppingCart, label: 'Ordens de Compra' },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { to: '/relatorios', icon: BarChart3, label: 'Relatórios' },
      { to: '/usuarios',   icon: Users,    label: 'Usuários' },
    ],
  },
];

export default function Layout() {
  const { user, company, logout } = useAuthStore();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="flex h-screen bg-[#0f1117] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 flex flex-col flex-shrink-0 border-r border-white/[0.05] bg-[#0b0d13]">

        {/* Logo */}
        <div className="px-4 py-5 border-b border-white/[0.05]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/50 flex-shrink-0">
              <Building2 size={15} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-100 truncate leading-tight">{company?.name || 'Sistema'}</p>
              <p className="text-[10px] text-gray-600 uppercase tracking-wider">ERP Contratos</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-5">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="text-[10px] font-semibold text-gray-700 uppercase tracking-widest px-3 mb-1">{group.label}</p>
              <ul className="space-y-0.5">
                {group.items.map(({ to, icon: Icon, label }) => (
                  <li key={to}>
                    <NavLink
                      to={to}
                      end={to !== '/contratos/novo'}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 group ${
                          isActive
                            ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20'
                            : 'text-gray-500 hover:bg-white/[0.04] hover:text-gray-300'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon size={14} className={isActive ? 'text-blue-400' : 'text-gray-600 group-hover:text-gray-400'} />
                          {label}
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-white/[0.05]">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg mb-1">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-200 truncate">{user?.name}</p>
              <p className="text-[10px] text-gray-600">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-gray-600 hover:text-gray-300 hover:bg-white/[0.04] text-xs px-3 py-2 rounded-lg transition-all"
          >
            <LogOut size={13} />
            Sair da conta
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
