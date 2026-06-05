import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Plus, HardHat, AlertCircle, X } from 'lucide-react';
import CurrencyInput from '../components/CurrencyInput';
import { Controller } from 'react-hook-form';

const STATUS_LABELS = { PLANNING: 'Planejamento', IN_PROGRESS: 'Em Andamento', PAUSED: 'Pausada', COMPLETED: 'Concluída', CANCELLED: 'Cancelada' };
const STATUS_BADGE  = { PLANNING: 'badge-draft', IN_PROGRESS: 'badge-active', PAUSED: 'badge-pending', COMPLETED: 'badge-signed', CANCELLED: 'badge-cancelled' };

function FieldError({ message }) {
  if (!message) return null;
  return <p className="field-error"><AlertCircle size={11} />{message}</p>;
}

export default function ObrasPage() {
  const [obras, setObras] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    api.get('/obras').then(r => setObras(r.data.obras));
    api.get('/contracts', { params: { limit: 100 } }).then(r => setContracts(r.data.contracts));
  }, []);

  async function onSubmit(data) {
    try {
      const res = await api.post('/obras', { ...data, budget: parseFloat(data.budget || 0) });
      toast.success('Obra criada!');
      setShowModal(false);
      reset();
      navigate(`/obras/${res.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao criar obra');
    }
  }

  const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestão de Obras</h1>
          <p className="page-subtitle">{obras.length} obra{obras.length !== 1 ? 's' : ''} cadastrada{obras.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={15} /> Nova Obra
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {obras.map(o => (
          <Link key={o.id} to={`/obras/${o.id}`}
            className="card hover:border-white/10 transition-all group block">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
                <HardHat size={15} className="text-orange-400" />
              </div>
              <span className={STATUS_BADGE[o.status] || 'badge-draft'}>{STATUS_LABELS[o.status]}</span>
            </div>
            <h3 className="font-medium group-hover:text-white transition-colors" style={{ color: 'var(--text-primary)' }}>{o.name}</h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{o.address}</p>

            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                <span>Orçamento utilizado</span>
                <span className={o.budgetPercent > 90 ? 'text-red-400' : o.budgetPercent > 70 ? 'text-amber-400' : 'text-emerald-400'}>
                  {o.budgetPercent}%
                </span>
              </div>
              <div className="progress-bar">
                <div className={`progress-fill ${o.budgetPercent > 90 ? 'bg-red-500' : o.budgetPercent > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(o.budgetPercent, 100)}%` }} />
              </div>
              <div className="flex justify-between text-xs mt-0.5">
                <span style={{ color: 'var(--text-muted)' }}>{fmt(o.totalCost)}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{fmt(o.budget)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {obras.length === 0 && (
        <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>
          <HardHat size={40} className="mx-auto mb-3" />
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Nenhuma obra cadastrada</p>
          <button onClick={() => setShowModal(true)} className="text-sm text-blue-500 hover:text-blue-400 mt-1">Criar primeira obra →</button>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <form onSubmit={handleSubmit(onSubmit)} className="modal max-w-lg w-full">
            <div className="modal-header">
              <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>Nova Obra</h3>
              <button type="button" onClick={() => setShowModal(false)} className="btn-ghost p-1.5"><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div>
                <label className="label">Nome da Obra *</label>
                <input className={`input ${errors.name ? 'input-error' : ''}`}
                  placeholder="Ex: Reforma Sede — Unidade Centro"
                  {...register('name', { required: 'Nome obrigatório', minLength: { value: 3, message: 'Mínimo 3 caracteres' } })} />
                <FieldError message={errors.name?.message} />
              </div>
              <div>
                <label className="label">Endereço *</label>
                <input className={`input ${errors.address ? 'input-error' : ''}`}
                  placeholder="Rua, número, bairro — Cidade/UF"
                  {...register('address', { required: 'Endereço obrigatório' })} />
                <FieldError message={errors.address?.message} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Orçamento (R$) *</label>
                  <Controller
                    name="budget"
                    control={control}
                    rules={{ required: 'Orçamento obrigatório', min: { value: 0.01, message: 'Deve ser maior que zero' } }}
                    render={({ field }) => (
                      <CurrencyInput {...field} error={errors.budget} />
                    )}
                  />
                  <FieldError message={errors.budget?.message} />
                </div>
                <div>
                  <label className="label">Responsável</label>
                  <input className="input" placeholder="Nome do responsável"
                    {...register('responsible')} />
                </div>
                <div>
                  <label className="label">Data Início</label>
                  <input className="input" type="date" {...register('startDate')} />
                </div>
                <div>
                  <label className="label">Previsão Entrega</label>
                  <input className="input" type="date" {...register('endDate')} />
                </div>
              </div>
              <div>
                <label className="label">Vincular a Contrato</label>
                <select className="input" {...register('contractId')}>
                  <option value="">Sem vínculo</option>
                  {contracts.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Criando...' : 'Criar Obra'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
