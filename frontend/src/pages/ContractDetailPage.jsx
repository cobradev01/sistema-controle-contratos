import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Send, FileCheck, ArrowLeft, Clock, CheckCircle, XCircle, X, AlertCircle } from 'lucide-react';

const STATUS_LABELS = { DRAFT: 'Rascunho', PENDING_SIGNATURE: 'Ag. Assinatura', SIGNED: 'Assinado', ACTIVE: 'Ativo', EXPIRED: 'Expirado', CANCELLED: 'Cancelado' };
const STATUS_BADGE  = { DRAFT: 'badge-draft', PENDING_SIGNATURE: 'badge-pending', SIGNED: 'badge-signed', ACTIVE: 'badge-active', EXPIRED: 'badge-expired', CANCELLED: 'badge-cancelled' };

function SignerForm({ index, register, errors, remove, canRemove }) {
  const base = `signers.${index}`;
  return (
    <div className="bg-white/[0.02] rounded-lg p-4 border border-white/[0.06] space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Signatário {index + 1}</p>
        {canRemove && <button type="button" onClick={remove} className="btn-ghost p-1"><X size={13} /></button>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="label">Nome completo *</label>
          <input className={`input ${errors?.signers?.[index]?.name ? 'input-error' : ''}`}
            {...register(`${base}.name`, { required: 'Nome obrigatório' })} />
          {errors?.signers?.[index]?.name && <p className="field-error"><AlertCircle size={11} />{errors.signers[index].name.message}</p>}
        </div>
        <div>
          <label className="label">E-mail *</label>
          <input className={`input ${errors?.signers?.[index]?.email ? 'input-error' : ''}`}
            type="email" {...register(`${base}.email`, { required: 'E-mail obrigatório', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'E-mail inválido' } })} />
          {errors?.signers?.[index]?.email && <p className="field-error"><AlertCircle size={11} />{errors.signers[index].email.message}</p>}
        </div>
        <div>
          <label className="label">WhatsApp</label>
          <input className="input" placeholder="(00) 00000-0000" {...register(`${base}.phone`)} />
        </div>
      </div>
    </div>
  );
}

export default function ContractDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [signerCount, setSignerCount] = useState(1);
  const [sending, setSending] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { signers: [{ name: '', email: '', phone: '' }] }
  });

  useEffect(() => { api.get(`/contracts/${id}`).then(r => setContract(r.data)); }, [id]);

  async function sendSignature(data) {
    setSending(true);
    try {
      await api.post('/signatures/send', { contractId: id, signers: data.signers, channel: 'EMAIL' });
      toast.success('Solicitações enviadas!');
      setShowSendModal(false);
      setContract(c => ({ ...c, status: 'PENDING_SIGNATURE' }));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao enviar');
    } finally {
      setSending(false);
    }
  }

  async function markActive() {
    await api.put(`/contracts/${id}`, { status: 'ACTIVE' });
    setContract(c => ({ ...c, status: 'ACTIVE' }));
    toast.success('Contrato marcado como ativo');
  }

  if (!contract) return (
    <div className="flex items-center justify-center h-full text-sm" style={{ color: 'var(--text-secondary)' }}>Carregando...</div>
  );

  const fmt = (v) => v ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v) : '—';
  const fmtDate = (d) => d ? format(new Date(d), 'dd/MM/yyyy', { locale: ptBR }) : '—';

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button onClick={() => navigate('/contratos')} className="btn-ghost p-2 mt-0.5"><ArrowLeft size={16} /></button>
        <div className="flex-1 min-w-0">
          <h1 className="page-title">{contract.title}</h1>
          <p className="page-subtitle">{contract.relatedParty}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={STATUS_BADGE[contract.status] || 'badge-draft'}>{STATUS_LABELS[contract.status] || contract.status}</span>
          {contract.status === 'DRAFT' && (
            <>
              <button onClick={() => setShowSendModal(true)} className="btn-primary">
                <Send size={14} /> Enviar p/ Assinatura
              </button>
              <button onClick={markActive} className="btn-secondary">
                <FileCheck size={14} /> Marcar Ativo
              </button>
            </>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { l: 'Valor', v: fmt(contract.value) },
          { l: 'Criado por', v: contract.createdBy?.name || '—' },
          { l: 'Início da Vigência', v: fmtDate(contract.startDate) },
          { l: 'Encerramento', v: fmtDate(contract.endDate) },
        ].map(({ l, v }) => (
          <div key={l} className="card-sm">
            <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{l}</p>
            <p className="text-sm font-medium mt-1" style={{ color: 'var(--text-primary)' }}>{v}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Content */}
        <div className="col-span-2 card">
          <p className="text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Conteúdo do Contrato</p>
          <div className="bg-[#1e2130] rounded-lg p-4 max-h-[480px] overflow-y-auto border border-white/[0.05]">
            <pre className="text-sm text-gray-400 whitespace-pre-wrap font-sans leading-relaxed">{contract.content}</pre>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card">
            <p className="text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Assinaturas</p>
            {contract.signatureRequests?.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Nenhuma solicitação enviada</p>
            ) : (
              <ul className="space-y-2">
                {contract.signatureRequests?.map(r => {
                  const icon = r.status === 'SIGNED' ? CheckCircle : r.status === 'EXPIRED' ? XCircle : Clock;
                  const color = r.status === 'SIGNED' ? 'text-emerald-400' : r.status === 'EXPIRED' ? 'text-red-400' : 'text-amber-400';
                  const Icon = icon;
                  return (
                    <li key={r.id} className="flex items-start gap-2 py-2 border-b border-white/[0.04] last:border-0">
                      <Icon size={14} className={`${color} mt-0.5 flex-shrink-0`} />
                      <div>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{r.signerName}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.signerEmail}</p>
                        <span className={`badge-${r.status === 'SIGNED' ? 'active' : r.status === 'EXPIRED' ? 'expired' : 'pending'} mt-1`}>{r.status}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {contract.obras?.length > 0 && (
            <div className="card">
              <p className="text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Obras Vinculadas</p>
              <ul className="space-y-1.5">
                {contract.obras.map(o => (
                  <li key={o.id}>
                    <Link to={`/obras/${o.id}`} className="text-sm text-blue-400 hover:text-blue-300 transition-colors">{o.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Send modal */}
      {showSendModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowSendModal(false)}>
          <form onSubmit={handleSubmit(sendSignature)} className="modal max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="modal-header">
              <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>Enviar para Assinatura</h3>
              <button type="button" onClick={() => setShowSendModal(false)} className="btn-ghost p-1.5"><X size={16} /></button>
            </div>
            <div className="modal-body space-y-3">
              {Array.from({ length: signerCount }).map((_, i) => (
                <SignerForm key={i} index={i} register={register} errors={errors}
                  canRemove={signerCount > 1}
                  remove={() => setSignerCount(n => n - 1)} />
              ))}
              <button type="button" onClick={() => setSignerCount(n => n + 1)}
                className="text-sm text-blue-500 hover:text-blue-400 transition-colors">
                + Adicionar signatário
              </button>
            </div>
            <div className="modal-footer">
              <button type="button" onClick={() => setShowSendModal(false)} className="btn-secondary">Cancelar</button>
              <button type="submit" className="btn-primary" disabled={sending}>
                <Send size={14} />
                {sending ? 'Enviando...' : 'Enviar Solicitações'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
