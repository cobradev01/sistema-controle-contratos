import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import toast from 'react-hot-toast';

const STATUS_LABELS = { DRAFT: 'Rascunho', PENDING_APPROVAL: 'Aguard. Aprovação', APPROVED: 'Aprovado', SENT: 'Enviado', COMPLETED: 'Concluído', CANCELLED: 'Cancelado' };

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => { api.get('/purchase-orders').then(r => { setOrders(r.data.orders); setTotal(r.data.total); }); }, []);

  async function updateStatus(id, status) {
    await api.put(`/purchase-orders/${id}/status`, { status });
    api.get('/purchase-orders').then(r => setOrders(r.data.orders));
    toast.success('Status atualizado');
  }

  const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ordens de Compra</h1>
        <p className="text-gray-500 text-sm">{total} ordens cadastradas</p>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-xs text-gray-500 uppercase tracking-wide">
              <th className="pb-3 text-left font-medium">Número</th>
              <th className="pb-3 text-left font-medium">Obra</th>
              <th className="pb-3 text-left font-medium">Fornecedor</th>
              <th className="pb-3 text-left font-medium">Pagador</th>
              <th className="pb-3 text-right font-medium">Valor Total</th>
              <th className="pb-3 text-left font-medium">Status</th>
              <th className="pb-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map(o => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="py-3 font-mono font-medium">{o.number}</td>
                <td className="py-3 text-gray-600">{o.obra?.name || '—'}</td>
                <td className="py-3">{o.supplierName}</td>
                <td className="py-3 text-gray-500 text-xs">{o.payerName}<br />{o.payerCnpj}</td>
                <td className="py-3 text-right font-semibold">{fmt(o.totalValue)}</td>
                <td className="py-3"><span className="badge-draft">{STATUS_LABELS[o.status]}</span></td>
                <td className="py-3">
                  <div className="flex gap-1">
                    {o.status === 'DRAFT' && <button onClick={() => updateStatus(o.id, 'PENDING_APPROVAL')} className="text-xs text-yellow-600 hover:underline">Enviar p/ Aprovação</button>}
                    {o.status === 'PENDING_APPROVAL' && <button onClick={() => updateStatus(o.id, 'APPROVED')} className="text-xs text-green-600 hover:underline">Aprovar</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <div className="text-center py-12 text-gray-500">Nenhuma ordem de compra. Crie uma a partir de uma obra.</div>}
      </div>
    </div>
  );
}
