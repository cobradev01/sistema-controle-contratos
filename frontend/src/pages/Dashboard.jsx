import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import api from '../lib/api';
import {
  FileText, HardHat, Clock, AlertTriangle, ShoppingCart,
  TrendingUp, ArrowUpRight, Activity, CheckCircle2,
} from 'lucide-react';

const PIE_COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4'];

const STATUS_PT = {
  DRAFT: 'Rascunho', PENDING_SIGNATURE: 'Ag. Assinatura', SIGNED: 'Assinado',
  ACTIVE: 'Ativo', EXPIRING: 'Vencendo', EXPIRED: 'Expirado', CANCELLED: 'Cancelado',
};
const STATUS_BADGE = {
  DRAFT: 'badge-draft', PENDING_SIGNATURE: 'badge-pending', SIGNED: 'badge-signed',
  ACTIVE: 'badge-active', EXPIRING: 'badge-pending', EXPIRED: 'badge-expired', CANCELLED: 'badge-cancelled',
};

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg px-3 py-2 text-xs shadow-xl border" style={{ background:'var(--bg-card)', borderColor:'var(--border)', color:'var(--text-secondary)' }}>
      <p className="font-semibold mb-1" style={{ color:'var(--text-primary)' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  );
};

function KPICard({ title, value, sub, icon: Icon, gradient, to }) {
  const inner = (
    <div className={`card ${gradient} rounded-xl p-5 relative overflow-hidden transition-transform duration-150 hover:scale-[1.02] ${to ? 'cursor-pointer' : ''}`}>
      {/* decorative circle */}
      <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute -bottom-6 -right-2 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />

      <div className="relative flex items-start justify-between mb-3">
        <div className="p-2.5 bg-white/20 rounded-lg backdrop-blur-sm">
          <Icon size={18} className="text-white" />
        </div>
        {to && <ArrowUpRight size={16} className="text-white/60" />}
      </div>
      <p className="relative text-2xl font-bold text-white tracking-tight leading-none">{value}</p>
      <p className="relative text-sm text-white/80 mt-1 font-medium">{title}</p>
      {sub && <p className="relative text-xs text-white/60 mt-0.5">{sub}</p>}
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
    <div className="flex items-center justify-center h-full gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
      <Activity size={16} className="animate-pulse text-blue-500" /> Carregando dados...
    </div>
  );
  if (!data) return null;

  const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);
  const contractChart = data.charts.contractsByType.map(c => ({ name: c.type, Qtd: c._count }));
  const obraChart = data.charts.obrasByStatus.map(o => ({ name: o.status, Qtd: o._count }));

  return (
    <div className="p-6 space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Visão consolidada em tempo real</p>
        </div>
        <div className="text-xs px-3 py-1.5 rounded-lg border font-medium" style={{ background:'var(--bg-card)', borderColor:'var(--border)', color:'var(--text-muted)' }}>
          {new Date().toLocaleDateString('pt-BR', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        <KPICard title="Contratos Ativos"      value={data.contracts.active}          icon={FileText}      gradient="kpi-blue"   to="/gerenciador" />
        <KPICard title="Aguard. Assinatura"    value={data.contracts.pendingSignature} icon={Clock}         gradient="kpi-amber"  to="/assinaturas" />
        <KPICard title="Vencendo em 30 dias"   value={data.contracts.expiring}        icon={AlertTriangle} gradient="kpi-red" />
        <KPICard title="Obras em Andamento"    value={data.obras.active}              icon={HardHat}       gradient="kpi-green"  to="/obras" />
        <KPICard title="Orçamento Total Obras" value={fmt(data.obras.totalBudget)}   icon={TrendingUp}    gradient="kpi-purple" />
        <KPICard title="OCs Pendentes"         value={data.purchaseOrders.pending}   icon={ShoppingCart}  gradient="kpi-teal"   to="/ordens-compra" />
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <p className="font-bold text-sm" style={{ color:'var(--text-primary)' }}>Contratos por Tipo</p>
            <Link to="/contratos" className="text-xs text-blue-600 hover:text-blue-700 font-medium">Ver todos →</Link>
          </div>
          {contractChart.length === 0
            ? <div className="flex items-center justify-center h-44 text-sm" style={{ color:'var(--text-muted)' }}>Nenhum dado ainda</div>
            : <ResponsiveContainer width="100%" height={180}>
                <BarChart data={contractChart} barSize={32}>
                  <XAxis dataKey="name" tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill:'var(--bg-elevated)' }} />
                  <Bar dataKey="Qtd" fill="#3b82f6" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
          }
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <p className="font-bold text-sm" style={{ color:'var(--text-primary)' }}>Obras por Status</p>
            <Link to="/obras" className="text-xs text-blue-600 hover:text-blue-700 font-medium">Ver todas →</Link>
          </div>
          {obraChart.length === 0
            ? <div className="flex items-center justify-center h-44 text-sm" style={{ color:'var(--text-muted)' }}>Nenhuma obra ainda</div>
            : <div className="flex items-center gap-4">
                <ResponsiveContainer width="55%" height={180}>
                  <PieChart>
                    <Pie data={obraChart} dataKey="Qtd" cx="50%" cy="50%" innerRadius={48} outerRadius={78} paddingAngle={3}>
                      {obraChart.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="transparent" />)}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <ul className="space-y-2 flex-1">
                  {obraChart.map((item, i) => (
                    <li key={item.name} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2" style={{ color:'var(--text-secondary)' }}>
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        {item.name}
                      </span>
                      <span className="font-bold" style={{ color:'var(--text-primary)' }}>{item.Qtd}</span>
                    </li>
                  ))}
                </ul>
              </div>
          }
        </div>
      </div>

      {/* ── Recent tables ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

        {/* Contratos recentes */}
        <div className="card p-0 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor:'var(--border)' }}>
            <p className="font-bold text-sm" style={{ color:'var(--text-primary)' }}>Contratos Recentes</p>
            <Link to="/contratos" className="text-xs text-blue-600 hover:text-blue-700 font-medium">Ver todos →</Link>
          </div>
          {data.recentContracts.length === 0
            ? <div className="flex flex-col items-center justify-center py-12 gap-2" style={{ color:'var(--text-muted)' }}>
                <FileText size={32} strokeWidth={1.5} />
                <p className="text-sm">Nenhum contrato ainda</p>
                <Link to="/contratos/novo" className="text-xs text-blue-600 hover:underline">Criar primeiro contrato →</Link>
              </div>
            : <ul>
                {data.recentContracts.map((c, i) => (
                  <li key={c.id} className={`flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-[var(--bg-hover)] ${i < data.recentContracts.length - 1 ? 'border-b' : ''}`} style={{ borderColor:'var(--border)' }}>
                    <div>
                      <Link to={`/contratos/${c.id}`} className="text-sm font-semibold text-blue-600 hover:text-blue-700">{c.title}</Link>
                      <p className="text-xs mt-0.5" style={{ color:'var(--text-muted)' }}>{c.relatedParty}</p>
                    </div>
                    <span className={STATUS_BADGE[c.status] || 'badge-draft'}>{STATUS_PT[c.status] || c.status}</span>
                  </li>
                ))}
              </ul>
          }
        </div>

        {/* Obras recentes */}
        <div className="card p-0 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor:'var(--border)' }}>
            <p className="font-bold text-sm" style={{ color:'var(--text-primary)' }}>Obras Recentes</p>
            <Link to="/obras" className="text-xs text-blue-600 hover:text-blue-700 font-medium">Ver todas →</Link>
          </div>
          {data.recentObras.length === 0
            ? <div className="flex flex-col items-center justify-center py-12 gap-2" style={{ color:'var(--text-muted)' }}>
                <HardHat size={32} strokeWidth={1.5} />
                <p className="text-sm">Nenhuma obra ainda</p>
                <Link to="/obras" className="text-xs text-blue-600 hover:underline">Criar primeira obra →</Link>
              </div>
            : <ul>
                {data.recentObras.map((o, i) => {
                  const pct = o.budget > 0 ? Math.round((Number(o.totalCost) / Number(o.budget)) * 100) : 0;
                  return (
                    <li key={o.id} className={`px-5 py-3.5 transition-colors hover:bg-[var(--bg-hover)] ${i < data.recentObras.length - 1 ? 'border-b' : ''}`} style={{ borderColor:'var(--border)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <Link to={`/obras/${o.id}`} className="text-sm font-semibold text-blue-600 hover:text-blue-700">{o.name}</Link>
                        <span className="text-xs font-bold" style={{ color: pct > 90 ? '#dc2626' : pct > 70 ? '#d97706' : '#059669' }}>{pct}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className={`progress-fill ${pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width:`${Math.min(pct,100)}%` }} />
                      </div>
                      <div className="flex justify-between mt-1 text-xs" style={{ color:'var(--text-muted)' }}>
                        <span>{fmt(o.totalCost)}</span>
                        <span>de {fmt(o.budget)}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
          }
        </div>

      </div>
    </div>
  );
}
