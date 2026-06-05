import { useEffect, useState } from 'react';
import api from '../lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { BarChart3 } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) return (
    <div className="bg-[#1e2130] border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color }} className="font-medium">{p.name}: {typeof p.value === 'number' && p.value > 1000 ? `R$ ${p.value.toLocaleString('pt-BR')}` : p.value}</p>)}
    </div>
  );
  return null;
};

export default function ReportsPage() {
  const [financial, setFinancial] = useState(null);
  const [contractReport, setContractReport] = useState(null);
  const [obraReport, setObraReport] = useState(null);

  useEffect(() => {
    api.get('/reports/financial').then(r => setFinancial(r.data));
    api.get('/reports/contracts').then(r => setContractReport(r.data));
    api.get('/reports/obras').then(r => setObraReport(r.data));
  }, []);

  const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

  const contractChart = contractReport
    ? Object.entries(contractReport.summary.byStatus).map(([k, v]) => ({ name: k, Qtd: v }))
    : [];

  const obraChart = obraReport
    ? obraReport.obras.slice(0, 8).map(o => ({ name: o.name.substring(0, 15), Orçado: Number(o.budget), Realizado: Number(o.totalCost) }))
    : [];

  return (
    <div className="p-6 space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Relatórios</h1>
          <p className="page-subtitle">Indicadores financeiros e operacionais</p>
        </div>
      </div>

      {financial && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: 'Contratos Ativos', value: fmt(financial.activeContractsValue), sub: 'Valor total em vigor' },
            { label: 'Orçamento Total', value: fmt(financial.totalObrasBudget), sub: 'Previsto nas obras' },
            { label: 'Custo Real', value: fmt(financial.totalObrasCost), sub: 'Realizado nas obras' },
            { label: 'Variação Orçamentária', value: fmt(financial.budgetVariance), sub: financial.budgetVariance >= 0 ? 'Dentro do orçamento' : 'Acima do orçamento' },
          ].map(({ label, value, sub }) => (
            <div key={label} className="card">
              <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</p>
              <p className="text-xl font-semibold mt-1 font-mono" style={{ color: 'var(--text-primary)' }}>{value}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="card">
          <p className="text-sm font-medium mb-4" style={{ color: 'var(--text-secondary)' }}>Contratos por Status</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={contractChart} barSize={24}>
              <XAxis dataKey="name" tick={{ fill: '#4b5563', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4b5563', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Qtd" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <p className="text-sm font-medium mb-4" style={{ color: 'var(--text-secondary)' }}>Obras — Previsto vs. Realizado</p>
          {obraChart.length === 0 ? (
            <div className="flex items-center justify-center h-48" style={{ color: 'var(--text-muted)' }}>
              <p className="text-sm">Nenhuma obra cadastrada</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={obraChart} barSize={12}>
                <XAxis dataKey="name" tick={{ fill: '#4b5563', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#4b5563', fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Orçado" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Realizado" fill="#10b981" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {contractReport && contractReport.contracts.length > 0 && (
        <div className="table-wrapper">
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Contratos — Detalhe</p>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Parte</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {contractReport.contracts.map(c => (
                <tr key={c.id}>
                  <td className="font-medium" style={{ color: 'var(--text-primary)' }}>{c.title}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{c.relatedParty}</td>
                  <td><span className="badge-info">{c.type}</span></td>
                  <td className="font-mono text-sm">{c.value ? fmt(c.value) : '—'}</td>
                  <td><span className="badge-draft">{c.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
