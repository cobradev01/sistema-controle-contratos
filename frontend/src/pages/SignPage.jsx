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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Carregando...</div>;

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="card max-w-md w-full text-center">
        <p className="text-red-600 font-semibold text-lg">{error}</p>
        <p className="text-gray-500 text-sm mt-2">Este link pode ter expirado ou já foi utilizado.</p>
      </div>
    </div>
  );

  if (signed) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="card max-w-md w-full text-center">
        <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Contrato Assinado!</h2>
        <p className="text-gray-500 mt-2">Sua assinatura foi registrada com sucesso.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex items-start justify-center">
      <div className="max-w-2xl w-full space-y-4 mt-8">
        <div className="card text-center">
          <FileText size={40} className="text-blue-600 mx-auto mb-3" />
          <h1 className="text-xl font-bold text-gray-900">Solicitação de Assinatura</h1>
          <p className="text-gray-500 mt-1">Olá, <strong>{data?.request?.signerName}</strong>! Você recebeu um contrato para assinar.</p>
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-3">{data?.contract?.title}</h2>
          <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">{data?.contract?.content}</pre>
          </div>
        </div>

        <div className="card">
          <p className="text-sm text-gray-600 mb-4">Ao clicar em "Assinar Contrato", você confirma que leu e concorda com os termos acima. Sua assinatura eletrônica será registrada com data, hora e endereço IP.</p>
          <button onClick={handleSign} className="btn-primary w-full text-base py-3" disabled={signing}>
            {signing ? 'Assinando...' : 'Assinar Contrato'}
          </button>
        </div>
      </div>
    </div>
  );
}
