import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Plus, HardHat, TrendingUp } from 'lucide-react';

const STATUS_LABELS = { PLANNING: 'Planejamento', IN_PROGRESS: 'Em Andamento', PAUSED: 'Pausada', COMPLETED: 'Concluída', CANCELLED: 'Cancelada' };
const STATUS_COLORS = { PLANNING: 'badge-draft', IN_PROGRESS: 'badge-active', PAUSED: 'badge-pending', COMPLETED: 'badge-signed', CANCELLED: 'badge-cancelled' };

export default function ObrasPage() {
  const [obras, setObras] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [contracts, setContracts] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', address: '', budget: '', startDate: '', endDate: '', contractId: '', responsible: '' });
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/obras').then(r => setObras(r.data.obras));
    api.get('/contracts', { params: { limit: 100 } }).then(r => setContracts(r.data.contracts));
  }, []);

  async function createObra(e) {
    e.preventDefault();
    try {
      const { data } = await api.post('/obras', form);
      toast.success('Obra criada com sucesso!');
      navigate(`/obras/${data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao criar obra');
    }
  }

  const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Obras</h1>
          <p className="text-gray-500 text-sm">{obras.length} obras cadastradas</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Nova Obra
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {obras.map(o => (
          <Link key={o.id} to={`/obras/${o.id}`} className="card hover:shadow-md transition-shadow block">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-orange-50 rounded-lg"><HardHat size={18} className="text-orange-500" /></div>
              <span className={STATUS_COLORS[o.status] || 'badge-draft'}>{STATUS_LABELS[o.status]}</span>
            </div>
            <h3 className="font-semibold text-gray-900">{o.name}</h3>
            <p className="text-sm text-gray-500 mt-1 truncate">{o.address}</p>
            <div className="mt-3 pt-3 border-t">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Orçamento utilizado</span>
                <span>{o.budgetPercent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className={`h-1.5 rounded-full ${o.budgetPercent > 90 ? 'bg-red-500' : o.budgetPercent > 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min(o.budgetPercent, 100)}%` }} />
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-gray-500">{fmt(o.totalCost)}</span>
                <span className="text-gray-700 font-medium">{fmt(o.budget)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {obras.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <HardHat size={40} className="mx-auto mb-3 text-gray-300" />
          <p>Nenhuma obra cadastrada</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form onSubmit={createObra} className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl space-y-4">
            <h3 className="font-bold text-gray-900 text-lg">Nova Obra</h3>
            <div>
              <label className="label">Nome da Obra *</label>
              <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="label">Endereço *</label>
              <input className="input" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Orçamento (R$) *</label>
                <input className="input" type="number" step="0.01" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} required />
              </div>
              <div>
                <label className="label">Responsável</label>
                <input className="input" value={form.responsible} onChange={e => setForm({ ...form, responsible: e.target.value })} />
              </div>
              <div>
                <label className="label">Data Início</label>
                <input className="input" type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div>
                <label className="label">Previsão Entrega</label>
                <input className="input" type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">Vincular a Contrato</label>
              <select className="input" value={form.contractId} onChange={e => setForm({ ...form, contractId: e.target.value })}>
                <option value="">Sem vínculo</option>
                {contracts.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancelar</button>
              <button type="submit" className="btn-primary flex-1">Criar Obra</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
