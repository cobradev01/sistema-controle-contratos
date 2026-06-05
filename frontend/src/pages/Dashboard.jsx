import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../lib/api';
import { FileText, HardHat, Clock, AlertTriangle, ShoppingCart, TrendingUp, ArrowUpRight, Activity } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const STATUS_PT = { DRAFT: 'Rascunho', PENDING_SIGNATURE: 'Ag. Assinatura', SIGNED: 'Assinado', ACTIVE: 'Ativo', EXPIRING: 'Vencendo', EXPIRED: 'Expirado', CANCELLED: 'Cancelado' };
const STATUS_BADGE = { DRAFT: 'badge-draft', PENDING_SIGNATURE: 'badge-pending', SIGNED: 'badge-signed', ACTIVE: 'badge-active', EXPIRING: 'badge-pending', EXPIRED: 'badge-expired', CANCELLED: 'badge-cancelled' };

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) return (
    <div className="bg-[#1e2130] border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color }} className="font-medium">{p.name}: {p.value}</p>)}
    </div>
  );
  return null;
};

function KPI({ title, value, sub, icon: Icon, color, to, trend }) {
  const colors = {
    blue:   { bg: 'bg-blue-500/10',   icon: 'text-blue-400',   border: 'border-blue-500/20' },
    green:  { bg: 'bg-emerald-500/10', icon: 'text-emerald-400', border: 'border-emerald-500/20' },
    amber:  { bg: 'bg-amber-500/10',   icon: 'text-amber-400',   border: 'border-amber-500/20' },
    red:    { bg: 'bg-red-500/10',     icon: 'text-red-400',     border: 'border-red-500/20' },
    purple: { bg: 'bg-purple-500/10',  icon: 'text-purple-400',  border: 'border-purple-500/20' },
  };
  const c = colors[color] || colors.blue;

  const inner = (
    <div className={`card hover:border-white/10 transition-all duration-200 group ${to ? 'cursor-pointer' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${c.bg} border ${c.border}`}>
          <Icon size={16} className={c.icon} />
        </div>
        {to && <ArrowUpRight size={14} className="text-gray-700 group-hover:text-gray-400 transition-colors" />}
      </div>
      <p className="text-2xl font-semibold text-gray-100 tracking-tight">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{title}</p>
      {sub && <p className="text-xs text-gray-700 mt-1">{sub}</p>}
    </div>
  );

  return to ? <Link to={to}>{inner}</Link> : inner;
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="flex items-center gap-2 text-gray-600 text-sm">
        <Activity size={16} className="animate-pulse" />
        Carregando dados...
      </div>
    </div>
  );
  if (!data) return null;

  const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);
  const contractChart = data.charts.contractsByType.map(c => ({ name: c.type, Contratos: c._count }));
  const obraChart = data.charts.obrasByStatus.map(o => ({ name: o.status, Obras: o._count }));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Visão geral do sistema em tempo real</p>
        </div>
        <span className="text-xs text-gray-600 bg-white/[0.03] border border-white/[0.06] px-3 py-1.5 rounded-lg">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        <KPI title="Contratos Ativos"       value={data.contracts.active}           icon={FileText}      color="blue"   to="/gerenciador" />
        <KPI title="Aguard. Assinatura"     value={data.contracts.pendingSignature}  icon={Clock}         color="amber"  to="/assinaturas" />
        <KPI title="Vencendo em 30 dias"    value={data.contracts.expiring}          icon={AlertTriangle} color="red" />
        <KPI title="Obras em Andamento"     value={data.obras.active}               icon={HardHat}       color="green"  to="/obras" />
        <KPI title="Orçamento Total Obras"  value={fmt(data.obras.totalBudget)}     icon={TrendingUp}    color="purple" />
        <KPI title="OCs Pendentes"          value={data.purchaseOrders.pending}     icon={ShoppingCart}  color="amber"  to="/ordens-compra" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="card">
          <p className="text-sm font-medium text-gray-300 mb-4">Contratos por Tipo</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={contractChart} barSize={28}>
              <XAxis dataKey="name" tick={{ fill: '#4b5563', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4b5563', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Contratos" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <p className="text-sm font-medium text-gray-300 mb-4">Obras por Status</p>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="55%" height={180}>
              <PieChart>
                <Pie data={obraChart} dataKey="Obras" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3}>
                  {obraChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <ul className="space-y-2 flex-1">
              {obraChart.map((item, i) => (
                <li key={item.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-gray-400">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    {item.name}
                  </span>
                  <span className="font-medium text-gray-200">{item.Obras}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Recent tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-300">Contratos Recentes</p>
            <Link to="/contratos" className="text-xs text-blue-500 hover:text-blue-400">Ver todos →</Link>
          </div>
          <div className="space-y-1">
            {data.recentContracts.length === 0 && <p className="text-sm text-gray-600 text-center py-4">Nenhum contrato ainda</p>}
            {data.recentContracts.map(c => (
              <Link key={c.id} to={`/contratos/${c.id}`}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-white/[0.03] transition-colors -mx-1 group">
                <div>
                  <p className="text-sm text-gray-200 group-hover:text-white transition-colors">{c.title}</p>
                  <p className="text-xs text-gray-600">{c.relatedParty}</p>
                </div>
                <span className={STATUS_BADGE[c.status] || 'badge-draft'}>{STATUS_PT[c.status] || c.status}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-300">Obras Recentes</p>
            <Link to="/obras" className="text-xs text-blue-500 hover:text-blue-400">Ver todas →</Link>
          </div>
          <div className="space-y-1">
            {data.recentObras.length === 0 && <p className="text-sm text-gray-600 text-center py-4">Nenhuma obra ainda</p>}
            {data.recentObras.map(o => {
              const pct = o.budget > 0 ? Math.round((Number(o.totalCost) / Number(o.budget)) * 100) : 0;
              return (
                <Link key={o.id} to={`/obras/${o.id}`}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-white/[0.03] transition-colors -mx-1 group">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-200 group-hover:text-white">{o.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="progress-bar flex-1">
                        <div className={`progress-fill ${pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                      </div>
                      <span className="text-[10px] text-gray-600 w-8 text-right">{pct}%</span>
                    </div>
                  </div>
                  <span className={`badge-${o.status === 'IN_PROGRESS' ? 'active' : 'draft'}`}>{o.status}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
