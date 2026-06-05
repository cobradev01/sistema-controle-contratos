import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Building2, AlertCircle, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';

function PasswordStrength({ password = '' }) {
  const checks = [
    { label: 'Mínimo 8 caracteres', ok: password.length >= 8 },
    { label: 'Letra maiúscula', ok: /[A-Z]/.test(password) },
    { label: 'Letra minúscula', ok: /[a-z]/.test(password) },
    { label: 'Número', ok: /\d/.test(password) },
  ];
  const score = checks.filter(c => c.ok).length;
  const colors = ['bg-red-500', 'bg-red-400', 'bg-amber-400', 'bg-emerald-400', 'bg-emerald-500'];
  const labels = ['', 'Fraca', 'Razoável', 'Boa', 'Forte'];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[1,2,3,4].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? colors[score] : 'bg-gray-200 dark:bg-white/10'}`} />
        ))}
      </div>
      {score > 0 && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Senha: <span className={`font-medium ${score >= 3 ? 'text-emerald-500' : score === 2 ? 'text-amber-500' : 'text-red-500'}`}>{labels[score]}</span></p>}
      <ul className="space-y-1">
        {checks.map(c => (
          <li key={c.label} className="flex items-center gap-1.5 text-xs" style={{ color: c.ok ? '#10b981' : 'var(--text-muted)' }}>
            {c.ok ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
            {c.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [invalid, setInvalid] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [done, setDone] = useState(false);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
  const password = watch('password', '');

  useEffect(() => {
    api.get(`/auth/validate-reset-token/${token}`)
      .then(r => setUser(r.data))
      .catch(() => setInvalid(true));
  }, [token]);

  async function onSubmit(data) {
    try {
      await api.post(`/auth/reset-password/${token}`, { password: data.password });
      setDone(true);
      toast.success('Senha redefinida com sucesso!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao redefinir senha');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-app)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-4 shadow-lg shadow-blue-900/30">
            <Building2 size={22} className="text-white" />
          </div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>B2B — Soluções Financeiras</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Redefinição de senha</p>
        </div>

        {invalid && (
          <div className="card p-6 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-red-50 dark:bg-red-500/10 rounded-full mx-auto">
              <XCircle size={28} className="text-red-500" />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Link inválido ou expirado</h3>
              <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                Este link de redefinição não é mais válido. Os links expiram em 1 hora.
              </p>
            </div>
            <Link to="/esqueci-senha" className="btn-primary w-full">Solicitar novo link</Link>
          </div>
        )}

        {done && (
          <div className="card p-6 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-50 dark:bg-emerald-500/10 rounded-full mx-auto">
              <CheckCircle2 size={28} className="text-emerald-500" />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Senha redefinida!</h3>
              <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                Sua senha foi alterada com sucesso. Redirecionando para o login...
              </p>
            </div>
            <Link to="/login" className="btn-primary w-full">Ir para o login</Link>
          </div>
        )}

        {!invalid && !done && user && (
          <form onSubmit={handleSubmit(onSubmit)} className="card border-white/[0.08] space-y-4 p-6">
            <div>
              <h2 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>Criar nova senha</h2>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                Olá, <strong style={{ color: 'var(--text-secondary)' }}>{user.name}</strong>. Defina sua nova senha abaixo.
              </p>
            </div>

            <div>
              <label className="label">Nova senha *</label>
              <div className="relative">
                <input
                  className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
                  type={showPass ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  {...register('password', {
                    required: 'Senha obrigatória',
                    minLength: { value: 8, message: 'Mínimo 8 caracteres' },
                  })}
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--text-muted)' }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="field-error"><AlertCircle size={12} />{errors.password.message}</p>}
              <PasswordStrength password={password} />
            </div>

            <div>
              <label className="label">Confirmar nova senha *</label>
              <div className="relative">
                <input
                  className={`input pr-10 ${errors.confirm ? 'input-error' : ''}`}
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repita a nova senha"
                  {...register('confirm', {
                    required: 'Confirmação obrigatória',
                    validate: v => v === password || 'As senhas não coincidem',
                  })}
                />
                <button type="button" onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--text-muted)' }}>
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.confirm && <p className="field-error"><AlertCircle size={12} />{errors.confirm.message}</p>}
            </div>

            <button type="submit" className="btn-primary w-full py-2.5" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar nova senha'}
            </button>
          </form>
        )}

        {!invalid && !done && !user && (
          <div className="card p-6 text-center">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Validando link...</p>
          </div>
        )}
      </div>
    </div>
  );
}
