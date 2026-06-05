import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

export default function SignaturesPage() {
  const [contracts, setContracts] = useState([]);

  useEffect(() => { api.get('/signatures/pending').then(r => setContracts(r.data)); }, []);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Fila de Assinaturas</h1>
        <p className="text-gray-500 text-sm">{contracts.length} contratos aguardando assinatura</p>
      </div>

      <div className="space-y-4">
        {contracts.map(c => (
          <div key={c.id} className="card">
            <div className="flex items-start justify-between">
              <div>
                <Link to={`/contratos/${c.id}`} className="font-semibold text-blue-600 hover:underline">{c.title}</Link>
                <p className="text-sm text-gray-500">{c.relatedParty}</p>
              </div>
              <span className="badge-pending">Aguardando Assinatura</span>
            </div>
            <div className="mt-3 space-y-1">
              {c.signatureRequests?.map(r => (
                <div key={r.id} className="flex items-center gap-2 text-sm">
                  {r.status === 'SIGNED' ? <CheckCircle size={14} className="text-green-500" /> :
                    r.status === 'EXPIRED' ? <XCircle size={14} className="text-red-500" /> :
                    <Clock size={14} className="text-yellow-500" />}
                  <span className="text-gray-700">{r.signerName}</span>
                  <span className="text-gray-400">{r.signerEmail}</span>
                  <span className={`text-xs font-medium ${r.status === 'SIGNED' ? 'text-green-600' : r.status === 'EXPIRED' ? 'text-red-600' : 'text-yellow-600'}`}>{r.status}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {contracts.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <CheckCircle size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="font-medium">Nenhum contrato aguardando assinatura</p>
          </div>
        )}
      </div>
    </div>
  );
}
