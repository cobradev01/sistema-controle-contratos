import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ companyName: '', companyCnpj: '', companyEmail: '', name: '', email: '', password: '' });
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    const result = await register(form);
    if (result.success) {
      toast.success('Empresa cadastrada com sucesso!');
      navigate('/dashboard');
    } else {
      toast.error(result.error);
    }
  }

  const field = (key, label, type = 'text', placeholder = '') => (
    <div>
      <label className="label">{label}</label>
      <input className="input" type={type} placeholder={placeholder} value={form[key]}
        onChange={e => setForm({ ...form, [key]: e.target.value })} required />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-xl space-y-4">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Cadastrar Empresa</h2>

          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Dados da Empresa</p>
          {field('companyName', 'Razão Social', 'text', 'Nome da empresa')}
          {field('companyCnpj', 'CNPJ', 'text', '00.000.000/0001-00')}
          {field('companyEmail', 'E-mail da Empresa', 'email', 'empresa@exemplo.com')}

          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-2">Administrador</p>
          {field('name', 'Nome Completo', 'text', 'Seu nome')}
          {field('email', 'E-mail', 'email', 'admin@exemplo.com')}
          {field('password', 'Senha', 'password', '••••••••')}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Cadastrando...' : 'Criar conta'}
          </button>

          <p className="text-center text-sm text-gray-600">
            Já tem conta? <Link to="/login" className="text-blue-600 hover:underline font-medium">Entrar</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
