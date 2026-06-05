import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Send, FileCheck, Eye, ArrowLeft } from 'lucide-react';

const STATUS_LABELS = { DRAFT: 'Rascunho', PENDING_SIGNATURE: 'Aguard. Assinatura', SIGNED: 'Assinado', ACTIVE: 'Ativo', EXPIRED: 'Expirado', CANCELLED: 'Cancelado' };

export default function ContractDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [signers, setSigners] = useState([{ name: '', email: '', phone: '' }]);
  const [sending, setSending] = useState(false);

  useEffect(() => { api.get(`/contracts/${id}`).then(r => setContract(r.data)); }, [id]);

  async function sendSignature() {
    setSending(true);
    try {
      const { data } = await api.post('/signatures/send', { contractId: id, signers, channel: 'EMAIL' });
      toast.success('Solicitações de assinatura enviadas!');
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

  if (!contract) return <div className="p-8 text-center text-gray-500">Carregando...</div>;

  const fmt = (v) => v ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v) : '—';
  const fmtDate = (d) => d ? format(new Date(d), 'dd/MM/yyyy', { locale: ptBR }) : '—';

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/contratos')} className="text-gray-500 hover:text-gray-800">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{contract.title}</h1>
          <p className="text-gray-500 text-sm">{contract.relatedParty}</p>
        </div>
        <div className="flex gap-2">
          {contract.status === 'DRAFT' && (
            <>
              <button onClick={() => setShowSendModal(true)} className="btn-primary flex items-center gap-2">
                <Send size={15} /> Enviar para Assinatura
              </button>
              <button onClick={markActive} className="btn-secondary flex items-center gap-2">
                <FileCheck size={15} /> Marcar como Ativo
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Status', value: STATUS_LABELS[contract.status] || contract.status },
          { label: 'Valor', value: fmt(contract.value) },
          { label: 'Início', value: fmtDate(contract.startDate) },
          { label: 'Encerramento', value: fmtDate(contract.endDate) },
        ].map(({ label, value }) => (
          <div key={label} className="card py-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
            <p className="font-semibold text-gray-900 mt-1">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 card">
          <h3 className="font-semibold text-gray-900 mb-3">Conteúdo do Contrato</h3>
          <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">{contract.content}</pre>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Assinaturas</h3>
            {contract.signatureRequests?.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhuma solicitação</p>
            ) : (
              <ul className="space-y-2">
                {contract.signatureRequests?.map(r => (
                  <li key={r.id} className="text-sm">
                    <p className="font-medium">{r.signerName}</p>
                    <span className={`badge-${r.status === 'SIGNED' ? 'signed' : r.status === 'EXPIRED' ? 'expired' : 'pending'}`}>{r.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {contract.obras?.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-3">Obras Vinculadas</h3>
              <ul className="space-y-1">
                {contract.obras.map(o => (
                  <li key={o.id} className="text-sm text-blue-600 hover:underline">
                    <a href={`/obras/${o.id}`}>{o.name}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {showSendModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="font-bold text-gray-900 text-lg mb-4">Enviar para Assinatura</h3>
            {signers.map((s, i) => (
              <div key={i} className="space-y-2 mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-600">Signatário {i + 1}</p>
                <input className="input" placeholder="Nome completo" value={s.name} onChange={e => { const n = [...signers]; n[i].name = e.target.value; setSigners(n); }} />
                <input className="input" placeholder="E-mail" type="email" value={s.email} onChange={e => { const n = [...signers]; n[i].email = e.target.value; setSigners(n); }} />
                <input className="input" placeholder="WhatsApp (opcional)" value={s.phone} onChange={e => { const n = [...signers]; n[i].phone = e.target.value; setSigners(n); }} />
              </div>
            ))}
            <button onClick={() => setSigners([...signers, { name: '', email: '', phone: '' }])} className="text-blue-600 text-sm mb-4 hover:underline">+ Adicionar signatário</button>
            <div className="flex gap-3">
              <button onClick={() => setShowSendModal(false)} className="btn-secondary flex-1">Cancelar</button>
              <button onClick={sendSignature} className="btn-primary flex-1" disabled={sending}>{sending ? 'Enviando...' : 'Enviar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
