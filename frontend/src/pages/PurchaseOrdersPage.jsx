import { useEffect, useState } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { ShoppingCart } from 'lucide-react';

const STATUS_LABELS = { DRAFT: 'Rascunho', PENDING_APPROVAL: 'Ag. Aprovação', APPROVED: 'Aprovado', SENT: 'Enviado', COMPLETED: 'Concluído', CANCELLED: 'Cancelado' };
const STATUS_BADGE  = { DRAFT: 'badge-draft', PENDING_APPROVAL: 'badge-pending', APPROVED: 'badge-active', SENT: 'badge-signed', COMPLETED: 'badge-info', CANCELLED: 'badge-cancelled' };

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);

  const load = () => api.get('/purchase-orders').then(r => { setOrders(r.data.orders); setTotal(r.data.total); });
  useEffect(() => { load(); }, []);

  async function updateStatus(id, status) {
    await api.put(`/purchase-orders/${id}/status`, { status });
    load();
    toast.success('Status atualizado');
  }

  const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="p-6 space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Ordens de Compra</h1>
          <p className="page-subtitle">{total} ordem{total !== 1 ? 's' : ''} cadastrada{total !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="table-wrapper">
        {orders.length === 0 ? (
          <div className="text-center py-16 text-gray-700">
            <ShoppingCart size={36} className="mx-auto mb-3" />
            <p className="text-sm text-gray-600">Nenhuma ordem de compra</p>
            <p className="text-xs text-gray-700 mt-1">Crie ordens a partir do detalhe de uma obra</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Obra</th>
                <th>Fornecedor</th>
                <th>CNPJ Pagador</th>
                <th className="text-right">Valor Total</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td><span className="font-mono text-xs text-gray-300 bg-white/[0.04] px-2 py-0.5 rounded">{o.number}</span></td>
                  <td className="text-gray-400">{o.obra?.name || '—'}</td>
                  <td>
                    <p className="text-gray-200 font-medium">{o.supplierName}</p>
                    {o.supplierCnpj && <p className="text-xs text-gray-600 font-mono">{o.supplierCnpj}</p>}
                  </td>
                  <td>
                    <p className="text-gray-400 text-sm">{o.payerName}</p>
                    <p className="text-xs text-gray-600 font-mono">{o.payerCnpj}</p>
                  </td>
                  <td className="text-right font-mono font-semibold text-gray-200">{fmt(o.totalValue)}</td>
                  <td><span className={STATUS_BADGE[o.status] || 'badge-draft'}>{STATUS_LABELS[o.status]}</span></td>
                  <td>
                    <div className="flex gap-2">
                      {o.status === 'DRAFT' && (
                        <button onClick={() => updateStatus(o.id, 'PENDING_APPROVAL')}
                          className="text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors">
                          Enviar p/ Aprovação
                        </button>
                      )}
                      {o.status === 'PENDING_APPROVAL' && (
                        <button onClick={() => updateStatus(o.id, 'APPROVED')}
                          className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                          Aprovar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
