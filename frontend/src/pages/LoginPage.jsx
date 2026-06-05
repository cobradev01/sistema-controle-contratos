import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { Building2, AlertCircle, LogIn } from 'lucide-react';

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { login } = useAuthStore();
  const navigate = useNavigate();

  async function onSubmit(data) {
    const result = await login(data.cnpj, data.email, data.password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-app)' }}>
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-4 shadow-lg shadow-blue-900/50">
            <Building2 size={22} className="text-white" />
          </div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>B2B — Soluções Financeiras</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Contratos & Gestão de Obras</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}
          className="card border-white/[0.08] space-y-4 p-6">

          <div>
            <label className="label">CNPJ da Empresa</label>
            <input
              className={`input ${errors.cnpj ? 'input-error' : ''}`}
              placeholder="00.000.000/0001-00"
              {...register('cnpj', {
                required: 'CNPJ obrigatório',
                minLength: { value: 14, message: 'CNPJ deve ter pelo menos 14 caracteres' },
              })}
            />
            {errors.cnpj && <p className="field-error"><AlertCircle size={12} />{errors.cnpj.message}</p>}
          </div>

          <div>
            <label className="label">E-mail</label>
            <input
              className={`input ${errors.email ? 'input-error' : ''}`}
              type="email"
              placeholder="seu@email.com"
              {...register('email', {
                required: 'E-mail obrigatório',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'E-mail inválido' },
              })}
            />
            {errors.email && <p className="field-error"><AlertCircle size={12} />{errors.email.message}</p>}
          </div>

          <div>
            <label className="label">Senha</label>
            <input
              className={`input ${errors.password ? 'input-error' : ''}`}
              type="password"
              placeholder="••••••••"
              {...register('password', {
                required: 'Senha obrigatória',
                minLength: { value: 6, message: 'Senha deve ter pelo menos 6 caracteres' },
              })}
            />
            {errors.password && <p className="field-error"><AlertCircle size={12} />{errors.password.message}</p>}
          </div>

          <button type="submit" className="btn-primary w-full py-2.5" disabled={isSubmitting}>
            <LogIn size={15} />
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>

          <p className="text-center text-sm text-gray-600">
            Não tem conta?{' '}
            <Link to="/register" className="text-blue-500 hover:text-blue-400 font-medium">Cadastrar empresa</Link>
          </p>
        </form>

        <div className="mt-4 p-3 rounded-lg border" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
          <p className="text-[10px] uppercase tracking-wider mb-1.5 font-medium" style={{ color: 'var(--text-muted)' }}>Acesso de demonstração — B2B Soluções em Negócios</p>
          <div className="space-y-0.5 text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
            <p>CNPJ: <span className="text-blue-500">48.011.700/0001-08</span></p>
            <p>Email: <span className="text-blue-500">rh@associacaodebeneficios.com.br</span></p>
            <p>Senha: <span className="text-blue-500">admin123</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
