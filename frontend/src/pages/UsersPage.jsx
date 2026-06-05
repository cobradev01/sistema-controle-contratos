import { useEffect, useState } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Plus, Users } from 'lucide-react';

const ROLE_LABELS = { ADMIN: 'Administrador', MANAGER: 'Gerente', USER: 'Usuário' };

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'USER' });

  const load = () => api.get('/users').then(r => setUsers(r.data));
  useEffect(() => { load(); }, []);

  async function createUser(e) {
    e.preventDefault();
    try {
      await api.post('/users', form);
      toast.success('Usuário criado!');
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao criar usuário');
    }
  }

  async function toggleActive(user) {
    await api.put(`/users/${user.id}`, { active: !user.active });
    load();
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Usuários</h1>
          <p className="text-gray-500 text-sm">Multi-tenant — usuários desta empresa</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Novo Usuário
        </button>
      </div>

      <div className="card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-xs text-gray-500 uppercase tracking-wide">
              <th className="pb-3 text-left font-medium">Nome</th>
              <th className="pb-3 text-left font-medium">E-mail</th>
              <th className="pb-3 text-left font-medium">Perfil</th>
              <th className="pb-3 text-left font-medium">Status</th>
              <th className="pb-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="py-3 font-medium">{u.name}</td>
                <td className="py-3 text-gray-600">{u.email}</td>
                <td className="py-3"><span className="badge-draft">{ROLE_LABELS[u.role]}</span></td>
                <td className="py-3"><span className={u.active ? 'badge-active' : 'badge-cancelled'}>{u.active ? 'Ativo' : 'Inativo'}</span></td>
                <td className="py-3 text-center">
                  <button onClick={() => toggleActive(u)} className="text-xs text-blue-600 hover:underline">
                    {u.active ? 'Desativar' : 'Ativar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <div className="text-center py-8 text-gray-500">Nenhum usuário encontrado</div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form onSubmit={createUser} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
            <h3 className="font-bold text-lg">Novo Usuário</h3>
            <div>
              <label className="label">Nome *</label>
              <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="label">E-mail *</label>
              <input className="input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="label">Senha *</label>
              <input className="input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <div>
              <label className="label">Perfil</label>
              <select className="input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="USER">Usuário</option>
                <option value="MANAGER">Gerente</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancelar</button>
              <button type="submit" className="btn-primary flex-1">Criar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
