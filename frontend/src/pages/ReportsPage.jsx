import { useEffect, useState } from 'react';
import api from '../lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function ReportsPage() {
  const [financial, setFinancial] = useState(null);
  const [contractReport, setContractReport] = useState(null);
  const [obraReport, setObraReport] = useState(null);

  useEffect(() => {
    api.get('/reports/financial').then(r => setFinancial(r.data));
    api.get('/reports/contracts').then(r => setContractReport(r.data));
    api.get('/reports/obras').then(r => setObraReport(r.data));
  }, []);

  const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const contractChartData = contractReport
    ? Object.entries(contractReport.summary.byStatus).map(([k, v]) => ({ name: k, total: v }))
    : [];

  const obraChartData = obraReport
    ? obraReport.obras.map(o => ({ name: o.name, budget: Number(o.budget), cost: Number(o.totalCost) }))
    : [];

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-gray-500 text-sm">Métricas e exportações do sistema</p>
      </div>

      {financial && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Contratos Ativos (Valor)', value: fmt(financial.activeContractsValue) },
            { label: 'Orçamento Total Obras', value: fmt(financial.totalObrasBudget) },
            { label: 'Custo Real Obras', value: fmt(financial.totalObrasCost) },
            { label: 'Total Ordens de Compra', value: fmt(financial.totalPurchaseOrders) },
          ].map(({ label, value }) => (
            <div key={label} className="card">
              <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Contratos por Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={contractChartData}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="total" fill="#3b82f6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Obras — Previsto vs. Realizado</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={obraChartData.slice(0, 6)}>
              <XAxis dataKey="name" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 9 }} />
              <Tooltip formatter={(v) => fmt(v)} />
              <Bar dataKey="budget" name="Orçado" fill="#3b82f6" radius={[4,4,0,0]} />
              <Bar dataKey="cost" name="Realizado" fill="#10b981" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {contractReport && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Contratos — Resumo</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div><p className="text-xs text-gray-500">Total de Contratos</p><p className="text-xl font-bold">{contractReport.summary.total}</p></div>
            <div><p className="text-xs text-gray-500">Valor Total</p><p className="text-xl font-bold">{fmt(contractReport.summary.totalValue)}</p></div>
            <div><p className="text-xs text-gray-500">Por Tipo</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {Object.entries(contractReport.summary.byType).map(([k, v]) => (
                  <span key={k} className="badge-draft">{k}: {v}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
