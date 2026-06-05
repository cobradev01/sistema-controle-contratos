import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Briefcase } from 'lucide-react';

const STATUS_LABELS = { DRAFT: 'Rascunho', PENDING_SIGNATURE: 'Ag. Assinatura', SIGNED: 'Assinado', ACTIVE: 'Ativo', EXPIRING: 'Vencendo', EXPIRED: 'Expirado', CANCELLED: 'Cancelado' };
const STATUS_BADGE  = { DRAFT: 'badge-draft', PENDING_SIGNATURE: 'badge-pending', SIGNED: 'badge-signed', ACTIVE: 'badge-active', EXPIRING: 'badge-pending', EXPIRED: 'badge-expired', CANCELLED: 'badge-cancelled' };
const TYPE_LABELS   = { SERVICE: 'Serviço', WORK: 'Obra', EMPLOYMENT: 'Trabalho', LEASE: 'Locação', PURCHASE: 'Compra', OTHER: 'Outro' };

function VigenciaCell({ days }) {
  if (days === null) return <span style={{ color: 'var(--text-muted)' }}>—</span>;
  if (days < 0) return <span className="badge-expired">Vencido</span>;
  if (days <= 30) return <span className="badge-pending">{days} dias</span>;
  if (days <= 90) return <span className="text-amber-400 text-xs">{days} dias</span>;
  return <span className="text-emerald-400 text-xs">{Math.round(days / 30)} meses</span>;
}

export default function ContractManagerPage() {
  const [contracts, setContracts] = useState([]);
  const [filter, setFilter] = useState('');

  useEffect(() => { api.get('/contracts', { params: { limit: 200 } }).then(r => setContracts(r.data.contracts)); }, []);

  const filtered = filter ? contracts.filter(c => c.status === filter) : contracts;
  const fmt = (v) => v ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v) : '—';
  const fmtDate = (d) => d ? format(new Date(d), 'dd/MM/yyyy', { locale: ptBR }) : '—';

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gerenciador de Contratos</h1>
          <p className="page-subtitle">Vigência e status em tempo real</p>
        </div>
        <select className="input w-44 h-9" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">Todos os status</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(STATUS_LABELS).map(([k, v]) => {
          const count = contracts.filter(c => c.status === k).length;
          if (!count) return null;
          return (
            <button key={k} onClick={() => setFilter(filter === k ? '' : k)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${filter === k ? 'bg-blue-600/20 border-blue-500/30 text-blue-400' : 'bg-white/[0.03] border-white/[0.06] hover:border-white/10'}`}
              style={filter !== k ? { color: 'var(--text-muted)' } : {}}>
              {v} <span className="ml-1 font-bold">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="table-wrapper">
        {filtered.length === 0 ? (
          <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
            <Briefcase size={36} className="mx-auto mb-3" />
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Nenhum contrato encontrado</p>
          </div>
        ) : (
          <table className="table min-w-[900px]">
            <thead>
              <tr>
                <th>Parte / Contrato</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Início</th>
                <th>Encerramento</th>
                <th>Vigência Restante</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{c.relatedParty}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{c.title}</p>
                  </td>
                  <td><span className="badge-info">{TYPE_LABELS[c.type]}</span></td>
                  <td className="font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>{fmt(c.value)}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{fmtDate(c.startDate)}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{fmtDate(c.endDate)}</td>
                  <td><VigenciaCell days={c.daysRemaining} /></td>
                  <td><span className={STATUS_BADGE[c.status] || 'badge-draft'}>{STATUS_LABELS[c.status]}</span></td>
                  <td>
                    <div className="flex gap-2">
                      <Link to={`/contratos/${c.id}`} className="text-xs text-blue-500 hover:text-blue-400">Ver</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
