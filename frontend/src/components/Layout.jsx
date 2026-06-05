import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  LayoutDashboard, FileText, BookTemplate, PenSquare, ClipboardCheck,
  Briefcase, HardHat, ShoppingCart, BarChart3, Users, LogOut, Building2, ChevronRight
} from 'lucide-react';

const navGroups = [
  {
    label: 'Contratos & Assinaturas',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/contratos', icon: FileText, label: 'Contratos' },
      { to: '/templates', icon: BookTemplate, label: 'Templates' },
      { to: '/contratos/novo', icon: PenSquare, label: 'Novo Contrato' },
      { to: '/assinaturas', icon: ClipboardCheck, label: 'Assinaturas' },
      { to: '/gerenciador', icon: Briefcase, label: 'Gerenciador' },
    ],
  },
  {
    label: 'Obras & Configurações',
    items: [
      { to: '/obras', icon: HardHat, label: 'Obras' },
      { to: '/ordens-compra', icon: ShoppingCart, label: 'Ordens de Compra' },
      { to: '/relatorios', icon: BarChart3, label: 'Relatórios' },
      { to: '/usuarios', icon: Users, label: 'Gestão de Usuários' },
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
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Building2 className="text-blue-400" size={22} />
            <div>
              <p className="text-white font-semibold text-sm leading-tight truncate">{company?.name || 'Sistema'}</p>
              <p className="text-slate-400 text-xs">Contratos & Obras</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider px-2 mb-2">{group.label}</p>
              <ul className="space-y-0.5">
                {group.items.map(({ to, icon: Icon, label }) => (
                  <li key={to}>
                    <NavLink
                      to={to}
                      end={to === '/contratos/novo' ? false : true}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`
                      }
                    >
                      <Icon size={16} />
                      {label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.name}</p>
              <p className="text-slate-400 text-xs">{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 text-slate-400 hover:text-white text-sm px-2 py-1.5 rounded hover:bg-slate-800 transition-colors">
            <LogOut size={15} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
