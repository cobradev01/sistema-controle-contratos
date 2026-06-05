import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { Building2, AlertCircle } from 'lucide-react';

function formatCNPJ(value) {
  const digits = value.replace(/\D/g, '').slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {error && <p className="field-error"><AlertCircle size={12} />{error}</p>}
    </div>
  );
}

export default function RegisterPage() {
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm();
  const { register: registerUser } = useAuthStore();
  const navigate = useNavigate();

  async function onSubmit(data) {
    const result = await registerUser(data);
    if (result.success) {
      toast.success('Empresa cadastrada com sucesso!');
      navigate('/dashboard');
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-app)' }}>
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-600 rounded-xl mb-3">
            <Building2 size={18} className="text-white" />
          </div>
          <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Cadastrar Empresa</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Crie sua conta no sistema GLC</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card border-white/[0.08] p-6 space-y-5">

          {/* Empresa */}
          <div>
            <p className="section-label">Dados da Empresa</p>
            <div className="space-y-3">
              <Field label="Razão Social *" error={errors.companyName?.message}>
                <input className={`input ${errors.companyName ? 'input-error' : ''}`}
                  placeholder="Nome da empresa"
                  {...register('companyName', { required: 'Razão social obrigatória', minLength: { value: 3, message: 'Mínimo 3 caracteres' } })} />
              </Field>
              <Field label="CNPJ *" error={errors.companyCnpj?.message}>
                <input className={`input font-mono ${errors.companyCnpj ? 'input-error' : ''}`}
                  placeholder="00.000.000/0001-00"
                  maxLength={18}
                  {...register('companyCnpj', {
                    required: 'CNPJ obrigatório',
                    validate: v => v.replace(/\D/g, '').length === 14 || 'CNPJ deve ter 14 dígitos',
                  })}
                  onChange={e => {
                    const formatted = formatCNPJ(e.target.value);
                    e.target.value = formatted;
                    setValue('companyCnpj', formatted);
                  }} />
              </Field>
              <Field label="E-mail da Empresa *" error={errors.companyEmail?.message}>
                <input className={`input ${errors.companyEmail ? 'input-error' : ''}`}
                  type="email" placeholder="empresa@exemplo.com"
                  {...register('companyEmail', {
                    required: 'E-mail da empresa obrigatório',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'E-mail inválido' },
                  })} />
              </Field>
            </div>
          </div>

          <div className="divider" />

          {/* Admin */}
          <div>
            <p className="section-label">Administrador</p>
            <div className="space-y-3">
              <Field label="Nome Completo *" error={errors.name?.message}>
                <input className={`input ${errors.name ? 'input-error' : ''}`}
                  placeholder="Seu nome completo"
                  {...register('name', { required: 'Nome obrigatório', minLength: { value: 3, message: 'Mínimo 3 caracteres' } })} />
              </Field>
              <Field label="E-mail *" error={errors.email?.message}>
                <input className={`input ${errors.email ? 'input-error' : ''}`}
                  type="email" placeholder="admin@exemplo.com"
                  {...register('email', {
                    required: 'E-mail obrigatório',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'E-mail inválido' },
                  })} />
              </Field>
              <Field label="Senha *" error={errors.password?.message}>
                <input className={`input ${errors.password ? 'input-error' : ''}`}
                  type="password" placeholder="Mínimo 8 caracteres"
                  {...register('password', {
                    required: 'Senha obrigatória',
                    minLength: { value: 8, message: 'Mínimo 8 caracteres' },
                  })} />
              </Field>
            </div>
          </div>

          <button type="submit" className="btn-primary w-full py-2.5" disabled={isSubmitting}>
            {isSubmitting ? 'Criando conta...' : 'Criar conta'}
          </button>

          <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            Já tem conta?{' '}
            <Link to="/login" className="text-blue-500 hover:text-blue-400 font-medium">Entrar</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
