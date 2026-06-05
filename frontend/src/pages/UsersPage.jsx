import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Plus, Users, AlertCircle, X } from 'lucide-react';

const ROLE_LABELS = { ADMIN: 'Administrador', MANAGER: 'Gerente', USER: 'Usuário' };
const ROLE_BADGE  = { ADMIN: 'badge-info', MANAGER: 'badge-signed', USER: 'badge-draft' };

function FieldError({ message }) {
  if (!message) return null;
  return <p className="field-error"><AlertCircle size={11} />{message}</p>;
}

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ defaultValues: { role: 'USER' } });

  const load = () => api.get('/users').then(r => setUsers(r.data));
  useEffect(() => { load(); }, []);

  async function onSubmit(data) {
    try {
      await api.post('/users', data);
      toast.success('Usuário criado!');
      setShowModal(false);
      reset();
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao criar usuário');
    }
  }

  async function toggleActive(user) {
    await api.put(`/users/${user.id}`, { active: !user.active });
    load();
    toast.success(user.active ? 'Usuário desativado' : 'Usuário ativado');
  }

  return (
    <div className="p-6 space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestão de Usuários</h1>
          <p className="page-subtitle">Multi-tenant — acesso isolado por empresa</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={15} /> Novo Usuário
        </button>
      </div>

      <div className="table-wrapper">
        {users.length === 0 ? (
          <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
            <Users size={36} className="mx-auto mb-3" />
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Nenhum usuário</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Perfil</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                  <td><span className={ROLE_BADGE[u.role] || 'badge-draft'}>{ROLE_LABELS[u.role]}</span></td>
                  <td><span className={u.active ? 'badge-active' : 'badge-cancelled'}>{u.active ? 'Ativo' : 'Inativo'}</span></td>
                  <td>
                    <button onClick={() => toggleActive(u)}
                      className={`text-xs font-medium transition-colors ${u.active ? 'text-red-500 hover:text-red-400' : 'text-emerald-500 hover:text-emerald-400'}`}>
                      {u.active ? 'Desativar' : 'Ativar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <form onSubmit={handleSubmit(onSubmit)} className="modal max-w-md w-full">
            <div className="modal-header">
              <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>Novo Usuário</h3>
              <button type="button" onClick={() => setShowModal(false)} className="btn-ghost p-1.5"><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div>
                <label className="label">Nome Completo *</label>
                <input className={`input ${errors.name ? 'input-error' : ''}`}
                  {...register('name', { required: 'Nome obrigatório', minLength: { value: 3, message: 'Mínimo 3 caracteres' } })} />
                <FieldError message={errors.name?.message} />
              </div>
              <div>
                <label className="label">E-mail *</label>
                <input className={`input ${errors.email ? 'input-error' : ''}`} type="email"
                  {...register('email', { required: 'E-mail obrigatório', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'E-mail inválido' } })} />
                <FieldError message={errors.email?.message} />
              </div>
              <div>
                <label className="label">Senha *</label>
                <input className={`input ${errors.password ? 'input-error' : ''}`} type="password"
                  {...register('password', { required: 'Senha obrigatória', minLength: { value: 8, message: 'Mínimo 8 caracteres' } })} />
                <FieldError message={errors.password?.message} />
              </div>
              <div>
                <label className="label">Perfil de Acesso</label>
                <select className="input" {...register('role')}>
                  <option value="USER">Usuário</option>
                  <option value="MANAGER">Gerente</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Criando...' : 'Criar Usuário'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
