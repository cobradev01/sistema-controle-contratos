import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Clock, CheckCircle, XCircle, PenSquare } from 'lucide-react';

const SIGN_STATUS = { PENDING: { icon: Clock, color: 'text-gray-500', badge: 'badge-draft' }, SENT: { icon: Clock, color: 'text-amber-400', badge: 'badge-pending' }, VIEWED: { icon: Clock, color: 'text-blue-400', badge: 'badge-signed' }, SIGNED: { icon: CheckCircle, color: 'text-emerald-400', badge: 'badge-active' }, EXPIRED: { icon: XCircle, color: 'text-red-400', badge: 'badge-expired' } };

export default function SignaturesPage() {
  const [contracts, setContracts] = useState([]);

  useEffect(() => { api.get('/signatures/pending').then(r => setContracts(r.data)); }, []);

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Fila de Assinaturas</h1>
          <p className="page-subtitle">{contracts.length} contrato{contracts.length !== 1 ? 's' : ''} aguardando assinatura</p>
        </div>
      </div>

      {contracts.length === 0 ? (
        <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>
          <CheckCircle size={40} className="mx-auto mb-3 text-emerald-500" />
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Nenhum contrato aguardando assinatura</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contracts.map(c => (
            <div key={c.id} className="card hover:border-white/10 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <Link to={`/contratos/${c.id}`} className="font-medium text-blue-400 hover:text-blue-300 transition-colors">{c.title}</Link>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{c.relatedParty}</p>
                </div>
                <span className="badge-pending">Aguardando</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {c.signatureRequests?.map(r => {
                  const s = SIGN_STATUS[r.status] || SIGN_STATUS.PENDING;
                  const Icon = s.icon;
                  return (
                    <div key={r.id} className="flex items-center gap-3 bg-white/[0.02] rounded-lg px-3 py-2.5 border border-white/[0.04]">
                      <Icon size={15} className={s.color} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{r.signerName}</p>
                        <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{r.signerEmail}</p>
                      </div>
                      <span className={s.badge}>{r.status}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
