import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import {
  LayoutDashboard, FileText, BookOpen, FilePlus, PenSquare,
  ClipboardCheck, Briefcase, HardHat, ShoppingCart, BarChart3,
  Users, LogOut, Building2, Sun, Moon,
} from 'lucide-react';

const navGroups = [
  {
    label: 'Contratos',
    items: [
      { to: '/dashboard',      icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/contratos',      icon: FileText,        label: 'Contratos',      exact: true },
      { to: '/templates',      icon: BookOpen,        label: 'Templates' },
      { to: '/contratos/novo', icon: FilePlus,        label: 'Novo Contrato' },
      { to: '/assinaturas',    icon: PenSquare,       label: 'Assinaturas' },
      { to: '/gerenciador',    icon: Briefcase,       label: 'Gerenciador' },
    ],
  },
  {
    label: 'Obras',
    items: [
      { to: '/obras',         icon: HardHat,      label: 'Obras' },
      { to: '/ordens-compra', icon: ShoppingCart, label: 'Ordens de Compra' },
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
  const { dark, toggle } = useThemeStore();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-app)' }}>

      {/* ── Sidebar ── */}
      <aside className="w-60 flex flex-col flex-shrink-0 border-r" style={{ background: 'var(--bg-sidebar)', borderColor: 'rgba(255,255,255,0.06)' }}>

        {/* Logo */}
        <div className="px-4 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg flex-shrink-0">
              <Building2 size={16} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate leading-tight">{company?.name || 'Sistema'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">ERP · Contratos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-5">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest px-3 mb-1.5">{group.label}</p>
              <ul className="space-y-0.5">
                {group.items.map(({ to, icon: Icon, label }) => (
                  <li key={to}>
                    <NavLink
                      to={to}
                      end={to !== '/contratos/novo'}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-100 group ${
                          isActive
                            ? 'bg-blue-600/20 text-blue-400'
                            : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
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

        {/* Footer */}
        <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="w-full flex items-center gap-2 text-gray-500 hover:text-gray-300 hover:bg-white/5 text-xs px-3 py-2 rounded-lg transition-all mb-1"
          >
            {dark ? <Sun size={13} /> : <Moon size={13} />}
            {dark ? 'Modo Claro' : 'Modo Escuro'}
          </button>

          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg mb-1">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-300 truncate">{user?.name}</p>
              <p className="text-[10px] text-gray-600">{user?.role}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-gray-600 hover:text-gray-300 hover:bg-white/5 text-xs px-3 py-2 rounded-lg transition-all"
          >
            <LogOut size={13} />
            Sair da conta
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
