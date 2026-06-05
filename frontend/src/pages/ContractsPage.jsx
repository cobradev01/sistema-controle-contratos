import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Plus, Search, Filter, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const STATUS_LABELS = { DRAFT: 'Rascunho', PENDING_SIGNATURE: 'Ag. Assinatura', SIGNED: 'Assinado', ACTIVE: 'Ativo', EXPIRING: 'Vencendo', EXPIRED: 'Expirado', CANCELLED: 'Cancelado', ARCHIVED: 'Arquivado' };
const STATUS_BADGE = { DRAFT: 'badge-draft', PENDING_SIGNATURE: 'badge-pending', SIGNED: 'badge-signed', ACTIVE: 'badge-active', EXPIRING: 'badge-pending', EXPIRED: 'badge-expired', CANCELLED: 'badge-cancelled' };
const TYPE_LABELS = { SERVICE: 'Serviço', WORK: 'Obra', EMPLOYMENT: 'Trabalho', LEASE: 'Locação', PURCHASE: 'Compra', OTHER: 'Outro' };

export default function ContractsPage() {
  const [contracts, setContracts] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/contracts', { params: { search, status, type } })
      .then(r => { setContracts(r.data.contracts); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  }, [search, status, type]);

  const fmt = (v) => v ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v) : '—';
  const fmtDate = (d) => d ? format(new Date(d), 'dd/MM/yy', { locale: ptBR }) : '—';

  return (
    <div className="p-6 space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Contratos</h1>
          <p className="page-subtitle">{total} contrato{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/contratos/novo" className="btn-primary">
          <Plus size={15} /> Novo Contrato
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
          <input className="input pl-9 h-9" placeholder="Buscar por título ou parte..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-44 h-9" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">Todos os status</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select className="input w-40 h-9" value={type} onChange={e => setType(e.target.value)}>
          <option value="">Todos os tipos</option>
          {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        {loading ? (
          <div className="text-center py-12 text-gray-600 text-sm">Carregando...</div>
        ) : contracts.length === 0 ? (
          <div className="text-center py-16 text-gray-600">
            <FileText size={36} className="mx-auto mb-3 text-gray-700" />
            <p className="text-sm font-medium text-gray-500">Nenhum contrato encontrado</p>
            <Link to="/contratos/novo" className="text-sm text-blue-500 hover:text-blue-400 mt-1 inline-block">Criar primeiro contrato →</Link>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Título / Parte</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Início</th>
                <th>Encerramento</th>
                <th>Vigência</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map(c => (
                <tr key={c.id}>
                  <td>
                    <Link to={`/contratos/${c.id}`} className="text-blue-400 hover:text-blue-300 font-medium transition-colors">{c.title}</Link>
                    <p className="text-xs text-gray-600 mt-0.5">{c.relatedParty}</p>
                  </td>
                  <td><span className="badge-info">{TYPE_LABELS[c.type]}</span></td>
                  <td className="font-mono text-sm">{fmt(c.value)}</td>
                  <td className="text-gray-500">{fmtDate(c.startDate)}</td>
                  <td className="text-gray-500">{fmtDate(c.endDate)}</td>
                  <td>
                    {c.daysRemaining === null ? <span className="text-gray-700">—</span>
                      : c.daysRemaining < 0 ? <span className="text-red-400 text-xs font-medium">Vencido</span>
                      : c.daysRemaining <= 30 ? <span className="text-amber-400 text-xs font-medium">{c.daysRemaining}d</span>
                      : <span className="text-emerald-400 text-xs">{c.daysRemaining}d</span>}
                  </td>
                  <td><span className={STATUS_BADGE[c.status] || 'badge-draft'}>{STATUS_LABELS[c.status] || c.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
