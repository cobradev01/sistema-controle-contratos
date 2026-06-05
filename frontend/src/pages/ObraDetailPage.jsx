import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle, Circle, Clock, Plus, Camera, ShoppingCart } from 'lucide-react';
import CurrencyInput from '../components/CurrencyInput';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const PHASE_LABELS = { PLANNING: 'Planejamento', EXECUTION: 'Execução', DELIVERY: 'Entrega' };
const COST_CATEGORIES = { MATERIAL: 'Material', LABOR: 'Mão de Obra', EQUIPMENT: 'Equipamento', SERVICE: 'Serviço', TRANSPORT: 'Transporte', OTHER: 'Outro' };

export default function ObraDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [obra, setObra] = useState(null);
  const [activeTab, setActiveTab] = useState('roteiro');
  const [showCustoModal, setShowCustoModal] = useState(false);
  const [showVistoriaModal, setShowVistoriaModal] = useState(false);
  const [showPOModal, setShowPOModal] = useState(false);
  const [custo, setCusto] = useState({ category: 'MATERIAL', description: '', value: '', date: new Date().toISOString().split('T')[0], supplier: '' });
  const [vistoria, setVistoria] = useState({ type: 'INITIAL', date: new Date().toISOString().split('T')[0], inspector: '', description: '' });
  const [poForm, setPoForm] = useState({ payerCnpj: '', payerName: '', supplierName: '', supplierCnpj: '', items: [{ description: '', quantity: 1, unitPrice: 0 }], notes: '' });

  const load = () => api.get(`/obras/${id}`).then(r => setObra(r.data));
  useEffect(() => { load(); }, [id]);

  async function updateStep(stepId, status) {
    await api.put(`/obras/${id}/steps/${stepId}`, { status });
    load();
    toast.success('Etapa atualizada');
  }

  async function addCusto(e) {
    e.preventDefault();
    await api.post(`/obras/${id}/custos`, custo);
    toast.success('Custo registrado');
    setShowCustoModal(false);
    load();
  }

  async function addVistoria(e) {
    e.preventDefault();
    await api.post(`/obras/${id}/vistorias`, vistoria);
    toast.success('Vistoria registrada');
    setShowVistoriaModal(false);
    load();
  }

  async function createPO(e) {
    e.preventDefault();
    await api.post('/purchase-orders', { obraId: id, ...poForm });
    toast.success('Ordem de Compra criada');
    setShowPOModal(false);
    load();
  }

  if (!obra) return <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>Carregando...</div>;

  const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const fmtDate = (d) => d ? format(new Date(d), 'dd/MM/yyyy', { locale: ptBR }) : '—';
  const budgetPct = obra.budget > 0 ? Math.round((Number(obra.totalCost) / Number(obra.budget)) * 100) : 0;

  const tabs = [
    { id: 'roteiro', label: 'Roteiro' },
    { id: 'custos', label: `Custos (${obra.custos?.length})` },
    { id: 'vistorias', label: `Vistorias (${obra.vistorias?.length})` },
    { id: 'oc', label: `Ordens de Compra (${obra.purchaseOrders?.length})` },
  ];

  const phases = ['PLANNING', 'EXECUTION', 'DELIVERY'];

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/obras')} className="btn-ghost p-2" style={{ color: 'var(--text-muted)' }}><ArrowLeft size={20} /></button>
        <div className="flex-1">
          <h1 className="page-title">{obra.name}</h1>
          <p className="page-subtitle">{obra.address}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Orçamento', value: fmt(obra.budget) },
          { label: 'Gasto Real', value: fmt(obra.totalCost) },
          { label: '% Utilizado', value: `${budgetPct}%` },
          { label: 'Status', value: obra.status },
        ].map(({ label, value }) => (
          <div key={label} className="card py-4">
            <p className="text-xs uppercase" style={{ color: 'var(--text-muted)' }}>{label}</p>
            <p className={`font-bold text-lg ${label === '% Utilizado' && budgetPct > 90 ? 'text-red-500' : ''}`}
              style={!(label === '% Utilizado' && budgetPct > 90) ? { color: 'var(--text-primary)' } : {}}>{value}</p>
          </div>
        ))}
      </div>

      <div className="progress-bar">
        <div className={`progress-fill transition-all ${budgetPct > 90 ? 'bg-red-500' : budgetPct > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
          style={{ width: `${Math.min(budgetPct, 100)}%` }} />
      </div>

      <div className="flex gap-1 border-b overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${activeTab === t.id ? 'border-blue-500 text-blue-500' : 'border-transparent hover:text-gray-600'}`}
            style={activeTab !== t.id ? { color: 'var(--text-muted)' } : {}}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'roteiro' && (
        <div className="space-y-6">
          {phases.map(phase => (
            <div key={phase}>
              <h3 className="font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>{PHASE_LABELS[phase]}</h3>
              <div className="space-y-2">
                {obra.steps?.filter(s => s.phase === phase).map(step => (
                  <div key={step.id} className="flex items-center gap-3 p-3 rounded-lg border hover:shadow-sm transition-shadow" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    <button onClick={() => updateStep(step.id, step.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED')}>
                      {step.status === 'COMPLETED' ? <CheckCircle size={20} className="text-emerald-500" /> : <Circle size={20} style={{ color: 'var(--text-muted)' }} />}
                    </button>
                    <span className={`flex-1 text-sm ${step.status === 'COMPLETED' ? 'line-through' : ''}`}
                      style={{ color: step.status === 'COMPLETED' ? 'var(--text-muted)' : 'var(--text-primary)' }}>{step.name}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{step.completedAt ? fmtDate(step.completedAt) : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'custos' && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => setShowCustoModal(true)} className="btn-primary flex items-center gap-2"><Plus size={15} /> Lançar Custo</button>
          </div>
          <div className="overflow-x-auto"><table className="table w-full text-sm">
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Categoria</th>
                <th>Fornecedor</th>
                <th>Data</th>
                <th className="text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {obra.custos?.map(c => (
                <tr key={c.id}>
                  <td style={{ color: 'var(--text-primary)' }}>{c.description}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{COST_CATEGORIES[c.category]}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{c.supplier || '—'}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{fmtDate(c.date)}</td>
                  <td className="text-right font-medium" style={{ color: 'var(--text-primary)' }}>{fmt(c.value)}</td>
                </tr>
              ))}
            </tbody>
            {obra.custos?.length > 0 && (
              <tfoot>
                <tr className="border-t" style={{ borderColor: 'var(--border)' }}>
                  <td colSpan={4} className="pt-2 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Total</td>
                  <td className="pt-2 text-right font-bold" style={{ color: 'var(--text-primary)' }}>{fmt(obra.totalCost)}</td>
                </tr>
              </tfoot>
            )}
          </table></div>
          {obra.custos?.length === 0 && <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>Nenhum custo registrado</div>}
        </div>
      )}

      {activeTab === 'vistorias' && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => setShowVistoriaModal(true)} className="btn-primary flex items-center gap-2"><Camera size={15} /> Nova Vistoria</button>
          </div>
          <div className="space-y-4">
            {obra.vistorias?.map(v => (
              <div key={v.id} className="card">
                <div className="flex items-center justify-between mb-2">
                  <span className={`badge-${v.type === 'INITIAL' ? 'draft' : v.type === 'FINAL' ? 'signed' : 'pending'}`}>{v.type === 'INITIAL' ? 'Vistoria Inicial' : v.type === 'FINAL' ? 'Vistoria Final' : 'Progresso'}</span>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{fmtDate(v.date)} — {v.inspector}</span>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{v.description}</p>
              </div>
            ))}
            {obra.vistorias?.length === 0 && <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>Nenhuma vistoria registrada</div>}
          </div>
        </div>
      )}

      {activeTab === 'oc' && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => setShowPOModal(true)} className="btn-primary flex items-center gap-2"><ShoppingCart size={15} /> Nova O.C.</button>
          </div>
          <div className="space-y-3">
            {obra.purchaseOrders?.map(po => (
              <div key={po.id} className="card flex items-center justify-between">
                <div>
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{po.number}</p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Fornecedor: {po.supplierName}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{fmt(po.totalValue)}</p>
                  <span className="badge-draft">{po.status}</span>
                </div>
              </div>
            ))}
            {obra.purchaseOrders?.length === 0 && <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>Nenhuma ordem de compra</div>}
          </div>
        </div>
      )}

      {/* Modals */}
      {showCustoModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowCustoModal(false)}>
          <form onSubmit={addCusto} className="modal max-w-md w-full space-y-4">
            <div className="modal-header">
              <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>Lançar Custo</h3>
            </div>
            <div className="modal-body space-y-4">
              <div>
                <label className="label">Categoria</label>
                <select className="input" value={custo.category} onChange={e => setCusto({ ...custo, category: e.target.value })}>
                  {Object.entries(COST_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Descrição *</label>
                <input className="input" value={custo.description} onChange={e => setCusto({ ...custo, description: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Valor (R$) *</label>
                  <CurrencyInput
                    value={custo.value}
                    onChange={v => setCusto({ ...custo, value: v })}
                    required
                  />
                </div>
                <div>
                  <label className="label">Data *</label>
                  <input className="input" type="date" value={custo.date} onChange={e => setCusto({ ...custo, date: e.target.value })} required />
                </div>
              </div>
              <div>
                <label className="label">Fornecedor</label>
                <input className="input" value={custo.supplier} onChange={e => setCusto({ ...custo, supplier: e.target.value })} />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" onClick={() => setShowCustoModal(false)} className="btn-secondary flex-1">Cancelar</button>
              <button type="submit" className="btn-primary flex-1">Salvar</button>
            </div>
          </form>
        </div>
      )}

      {showVistoriaModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowVistoriaModal(false)}>
          <form onSubmit={addVistoria} className="modal max-w-md w-full space-y-4">
            <div className="modal-header">
              <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>Nova Vistoria</h3>
            </div>
            <div className="modal-body space-y-4">
              <div>
                <label className="label">Tipo</label>
                <select className="input" value={vistoria.type} onChange={e => setVistoria({ ...vistoria, type: e.target.value })}>
                  <option value="INITIAL">Vistoria Inicial</option>
                  <option value="PROGRESS">Progresso</option>
                  <option value="FINAL">Vistoria Final</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Data *</label>
                  <input className="input" type="date" value={vistoria.date} onChange={e => setVistoria({ ...vistoria, date: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Vistoriador *</label>
                  <input className="input" value={vistoria.inspector} onChange={e => setVistoria({ ...vistoria, inspector: e.target.value })} required />
                </div>
              </div>
              <div>
                <label className="label">Descrição *</label>
                <textarea className="input" rows={4} value={vistoria.description} onChange={e => setVistoria({ ...vistoria, description: e.target.value })} required />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" onClick={() => setShowVistoriaModal(false)} className="btn-secondary flex-1">Cancelar</button>
              <button type="submit" className="btn-primary flex-1">Salvar</button>
            </div>
          </form>
        </div>
      )}

      {showPOModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowPOModal(false)}>
          <form onSubmit={createPO} className="modal max-w-lg w-full space-y-4 max-h-screen overflow-y-auto">
            <div className="modal-header">
              <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>Nova Ordem de Compra</h3>
            </div>
            <div className="modal-body space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">CNPJ Pagador *</label>
                  <input className="input" value={poForm.payerCnpj} onChange={e => setPoForm({ ...poForm, payerCnpj: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Nome Pagador *</label>
                  <input className="input" value={poForm.payerName} onChange={e => setPoForm({ ...poForm, payerName: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Fornecedor *</label>
                  <input className="input" value={poForm.supplierName} onChange={e => setPoForm({ ...poForm, supplierName: e.target.value })} required />
                </div>
                <div>
                  <label className="label">CNPJ Fornecedor</label>
                  <input className="input" value={poForm.supplierCnpj} onChange={e => setPoForm({ ...poForm, supplierCnpj: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label">Itens</label>
                {poForm.items.map((item, i) => (
                  <div key={i} className="grid grid-cols-3 gap-2 mb-2">
                    <input className="input col-span-1" placeholder="Descrição" value={item.description} onChange={e => { const n = [...poForm.items]; n[i].description = e.target.value; setPoForm({ ...poForm, items: n }); }} />
                    <input className="input" type="number" placeholder="Qtd" value={item.quantity} onChange={e => { const n = [...poForm.items]; n[i].quantity = Number(e.target.value); setPoForm({ ...poForm, items: n }); }} />
                    <CurrencyInput placeholder="R$ 0,00" value={item.unitPrice} onChange={v => { const n = [...poForm.items]; n[i].unitPrice = v; setPoForm({ ...poForm, items: n }); }} />
                  </div>
                ))}
                <button type="button" onClick={() => setPoForm({ ...poForm, items: [...poForm.items, { description: '', quantity: 1, unitPrice: 0 }] })} className="text-blue-500 text-sm hover:underline">+ Item</button>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" onClick={() => setShowPOModal(false)} className="btn-secondary flex-1">Cancelar</button>
              <button type="submit" className="btn-primary flex-1">Criar O.C.</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
