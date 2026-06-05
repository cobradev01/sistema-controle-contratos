import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Plus, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const STATUS_LABELS = { DRAFT: 'Rascunho', PENDING_SIGNATURE: 'Aguard. Assinatura', SIGNED: 'Assinado', ACTIVE: 'Ativo', EXPIRING: 'Vencendo', EXPIRED: 'Expirado', CANCELLED: 'Cancelado', ARCHIVED: 'Arquivado' };
const TYPE_LABELS = { SERVICE: 'Serviço', WORK: 'Obra', EMPLOYMENT: 'Trabalho', LEASE: 'Locação', PURCHASE: 'Compra', OTHER: 'Outro' };

function statusBadge(status) {
  const map = { DRAFT: 'badge-draft', PENDING_SIGNATURE: 'badge-pending', SIGNED: 'badge-signed', ACTIVE: 'badge-active', EXPIRING: 'badge-pending', EXPIRED: 'badge-expired', CANCELLED: 'badge-cancelled' };
  return <span className={map[status] || 'badge-draft'}>{STATUS_LABELS[status] || status}</span>;
}

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

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contratos</h1>
          <p className="text-gray-500 text-sm">{total} contratos encontrados</p>
        </div>
        <Link to="/contratos/novo" className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Novo Contrato
        </Link>
      </div>

      <div className="card">
        <div className="flex gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-9" placeholder="Buscar por título ou parte..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input w-44" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">Todos os status</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select className="input w-44" value={type} onChange={e => setType(e.target.value)}>
            <option value="">Todos os tipos</option>
            {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Carregando...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500 text-xs uppercase tracking-wide">
                <th className="pb-3 font-medium">Título</th>
                <th className="pb-3 font-medium">Parte</th>
                <th className="pb-3 font-medium">Tipo</th>
                <th className="pb-3 font-medium">Valor</th>
                <th className="pb-3 font-medium">Encerramento</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {contracts.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="py-3"><Link to={`/contratos/${c.id}`} className="text-blue-600 hover:underline font-medium">{c.title}</Link></td>
                  <td className="py-3 text-gray-600">{c.relatedParty}</td>
                  <td className="py-3 text-gray-600">{TYPE_LABELS[c.type]}</td>
                  <td className="py-3 text-gray-600">{c.value ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c.value) : '—'}</td>
                  <td className="py-3 text-gray-600">{c.endDate ? format(new Date(c.endDate), 'dd/MM/yyyy', { locale: ptBR }) : '—'}</td>
                  <td className="py-3">{statusBadge(c.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && contracts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="font-medium">Nenhum contrato encontrado</p>
            <Link to="/contratos/novo" className="text-blue-600 hover:underline text-sm mt-1 inline-block">Criar primeiro contrato</Link>
          </div>
        )}
      </div>
    </div>
  );
}
