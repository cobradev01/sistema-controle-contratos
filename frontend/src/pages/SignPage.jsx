import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { CheckCircle, FileText } from 'lucide-react';

export default function SignPage() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [signed, setSigned] = useState(false);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/signatures/sign/${token}`)
      .then(r => setData(r.data))
      .catch(err => setError(err.response?.data?.error || 'Link inválido'))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSign() {
    setSigning(true);
    try {
      await api.post(`/signatures/sign/${token}`);
      setSigned(true);
      toast.success('Contrato assinado com sucesso!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao assinar');
    } finally {
      setSigning(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-app)', color: 'var(--text-muted)' }}>
      Carregando...
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-app)' }}>
      <div className="card max-w-md w-full text-center">
        <p className="text-red-500 font-semibold text-lg">{error}</p>
        <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Este link pode ter expirado ou já foi utilizado.</p>
      </div>
    </div>
  );

  if (signed) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-app)' }}>
      <div className="card max-w-md w-full text-center">
        <CheckCircle size={48} className="text-emerald-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Contrato Assinado!</h2>
        <p className="mt-2" style={{ color: 'var(--text-muted)' }}>Sua assinatura foi registrada com sucesso.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-4 flex items-start justify-center" style={{ background: 'var(--bg-app)' }}>
      <div className="max-w-2xl w-full space-y-4 mt-8">
        <div className="card text-center">
          <FileText size={40} className="text-blue-500 mx-auto mb-3" />
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Solicitação de Assinatura</h1>
          <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Olá, <strong>{data?.request?.signerName}</strong>! Você recebeu um contrato para assinar.</p>
        </div>

        <div className="card">
          <h2 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{data?.contract?.title}</h2>
          <div className="rounded-lg p-4 max-h-96 overflow-y-auto" style={{ background: 'var(--bg-elevated)' }}>
            <pre className="text-sm whitespace-pre-wrap font-sans" style={{ color: 'var(--text-secondary)' }}>{data?.contract?.content}</pre>
          </div>
        </div>

        <div className="card">
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Ao clicar em "Assinar Contrato", você confirma que leu e concorda com os termos acima. Sua assinatura eletrônica será registrada com data, hora e endereço IP.</p>
          <button onClick={handleSign} className="btn-primary w-full text-base py-3" disabled={signing}>
            {signing ? 'Assinando...' : 'Assinar Contrato'}
          </button>
        </div>
      </div>
    </div>
  );
}
