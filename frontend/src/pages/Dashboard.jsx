import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../lib/api';
import { FileText, HardHat, Clock, AlertTriangle, ShoppingCart, TrendingUp } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

function KPICard({ title, value, subtitle, icon: Icon, color = 'blue', to }) {
  const colors = { blue: 'bg-blue-50 text-blue-600', green: 'bg-green-50 text-green-600', yellow: 'bg-yellow-50 text-yellow-600', red: 'bg-red-50 text-red-600' };
  const card = (
    <div className="card flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`p-3 rounded-xl ${colors[color]}`}><Icon size={22} /></div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm font-medium text-gray-700">{title}</p>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );
  return to ? <Link to={to}>{card}</Link> : card;
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Carregando dashboard...</div>;
  if (!data) return null;

  const contractChartData = data.charts.contractsByType.map(c => ({ name: c.type, value: c._count }));
  const obraChartData = data.charts.obrasByStatus.map(o => ({ name: o.status, value: o._count }));

  const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm">Visão geral do sistema</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <KPICard title="Contratos Ativos" value={data.contracts.active} icon={FileText} color="blue" to="/gerenciador" />
        <KPICard title="Aguard. Assinatura" value={data.contracts.pendingSignature} icon={Clock} color="yellow" to="/assinaturas" />
        <KPICard title="Vencendo em 30 dias" value={data.contracts.expiring} icon={AlertTriangle} color="red" />
        <KPICard title="Obras em Andamento" value={data.obras.active} icon={HardHat} color="green" to="/obras" />
        <KPICard title="Orçamento Total Obras" value={fmt(data.obras.totalBudget)} icon={TrendingUp} color="blue" />
        <KPICard title="OCs Pendentes" value={data.purchaseOrders.pending} icon={ShoppingCart} color="yellow" to="/ordens-compra" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Contratos por Tipo</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={contractChartData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {contractChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Obras por Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={obraChartData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3">Contratos Recentes</h3>
          <div className="space-y-2">
            {data.recentContracts.map(c => (
              <Link key={c.id} to={`/contratos/${c.id}`} className="flex items-center justify-between py-2 border-b last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded">
                <div>
                  <p className="text-sm font-medium text-gray-900">{c.title}</p>
                  <p className="text-xs text-gray-500">{c.relatedParty}</p>
                </div>
                <span className={`badge-${c.status.toLowerCase().replace('_', '-')}`}>{c.status}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3">Obras Recentes</h3>
          <div className="space-y-2">
            {data.recentObras.map(o => (
              <Link key={o.id} to={`/obras/${o.id}`} className="flex items-center justify-between py-2 border-b last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded">
                <div>
                  <p className="text-sm font-medium text-gray-900">{o.name}</p>
                  <p className="text-xs text-gray-500">{fmt(o.totalCost)} / {fmt(o.budget)}</p>
                </div>
                <span className={`badge-${o.status === 'IN_PROGRESS' ? 'active' : 'draft'}`}>{o.status}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
