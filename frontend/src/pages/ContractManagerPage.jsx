import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const STATUS_LABELS = { DRAFT: 'Rascunho', PENDING_SIGNATURE: 'Aguard. Assinatura', SIGNED: 'Assinado', ACTIVE: 'Ativo', EXPIRING: 'Vencendo', EXPIRED: 'Expirado', CANCELLED: 'Cancelado' };
const TYPE_LABELS = { SERVICE: 'Serviço', WORK: 'Obra', EMPLOYMENT: 'Trabalho', LEASE: 'Locação', PURCHASE: 'Compra', OTHER: 'Outro' };

function DaysRemaining({ days }) {
  if (days === null) return <span className="text-gray-400">—</span>;
  if (days < 0) return <span className="text-red-600 font-medium">Vencido</span>;
  if (days <= 30) return <span className="text-yellow-600 font-medium">{days} dias</span>;
  return <span className="text-green-600">{days} dias</span>;
}

export default function ContractManagerPage() {
  const [contracts, setContracts] = useState([]);

  useEffect(() => {
    api.get('/contracts', { params: { limit: 100 } }).then(r => setContracts(r.data.contracts));
  }, []);

  const fmt = (v) => v ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v) : '—';
  const fmtDate = (d) => d ? format(new Date(d), 'dd/MM/yyyy', { locale: ptBR }) : '—';

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gerenciador de Contratos</h1>
        <p className="text-gray-500 text-sm">Painel de acompanhamento com vigência em tempo real</p>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="border-b text-left text-gray-500 text-xs uppercase tracking-wide">
              <th className="pb-3 font-medium">Parte Relacionada</th>
              <th className="pb-3 font-medium">Tipo</th>
              <th className="pb-3 font-medium">Valor</th>
              <th className="pb-3 font-medium">Início</th>
              <th className="pb-3 font-medium">Encerramento</th>
              <th className="pb-3 font-medium">Vigência Restante</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {contracts.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="py-3">
                  <Link to={`/contratos/${c.id}`} className="text-blue-600 hover:underline font-medium">{c.relatedParty}</Link>
                  <p className="text-xs text-gray-400">{c.title}</p>
                </td>
                <td className="py-3 text-gray-600">{TYPE_LABELS[c.type]}</td>
                <td className="py-3 text-gray-600">{fmt(c.value)}</td>
                <td className="py-3 text-gray-600">{fmtDate(c.startDate)}</td>
                <td className="py-3 text-gray-600">{fmtDate(c.endDate)}</td>
                <td className="py-3"><DaysRemaining days={c.daysRemaining} /></td>
                <td className="py-3">
                  <span className={`badge-${c.status === 'ACTIVE' ? 'active' : c.status === 'PENDING_SIGNATURE' ? 'pending' : c.status === 'SIGNED' ? 'signed' : c.status === 'EXPIRED' ? 'expired' : 'draft'}`}>
                    {STATUS_LABELS[c.status]}
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex gap-2">
                    <Link to={`/contratos/${c.id}`} className="text-xs text-blue-600 hover:underline">Ver</Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {contracts.length === 0 && (
          <div className="text-center py-12 text-gray-500">Nenhum contrato cadastrado</div>
        )}
      </div>
    </div>
  );
}
