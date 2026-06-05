import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { Building2 } from 'lucide-react';

export default function LoginPage() {
  const [form, setForm] = useState({ cnpj: '', email: '', password: '' });
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    const result = await login(form.cnpj, form.email, form.password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4">
            <Building2 className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-white">Sistema de Contratos</h1>
          <p className="text-slate-400 mt-1">Gestão Orçamentária & Obras</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-xl space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Entrar na plataforma</h2>

          <div>
            <label className="label">CNPJ da Empresa</label>
            <input className="input" placeholder="00.000.000/0001-00" value={form.cnpj}
              onChange={e => setForm({ ...form, cnpj: e.target.value })} required />
          </div>
          <div>
            <label className="label">E-mail</label>
            <input className="input" type="email" placeholder="seu@email.com" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label className="label">Senha</label>
            <input className="input" type="password" placeholder="••••••••" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <p className="text-center text-sm text-gray-600">
            Não tem conta?{' '}
            <Link to="/register" className="text-blue-600 hover:underline font-medium">Cadastre sua empresa</Link>
          </p>
        </form>

        <p className="text-center text-slate-500 text-xs mt-4">
          Demo: CNPJ 00.000.000/0001-00 | admin@glctecnologia.com.br | admin123
        </p>
      </div>
    </div>
  );
}
