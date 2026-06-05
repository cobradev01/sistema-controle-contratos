import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../lib/api';
import { Building2, AlertCircle, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';

function formatCNPJ(value) {
  const digits = value.replace(/\D/g, '').slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [resetLink, setResetLink] = useState(null);
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm();

  async function onSubmit(data) {
    try {
      const res = await api.post('/auth/forgot-password', data);
      setSent(true);
      if (res.data.resetLink) setResetLink(res.data.resetLink);
    } catch (err) {
      setSent(true); // resposta genérica por segurança
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
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Recuperação de senha</p>
        </div>

        {sent ? (
          <div className="card border-white/[0.08] p-6 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-50 dark:bg-emerald-500/10 rounded-full mx-auto">
              <CheckCircle2 size={28} className="text-emerald-500" />
            </div>
            <div>
              <h3 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>Solicitação enviada!</h3>
              <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                Se os dados estiverem corretos, você receberá um e-mail com o link para redefinir sua senha em breve.
              </p>
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                O link expira em <strong>1 hora</strong>. Verifique também a caixa de spam.
              </p>
            </div>

            {/* Link direto para ambiente de demo */}
            {resetLink && (
              <div className="p-3 rounded-lg border text-left" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                  🔗 Link de redefinição (demo)
                </p>
                <a href={resetLink} className="text-xs text-blue-500 hover:text-blue-600 break-all">{resetLink}</a>
              </div>
            )}

            <Link to="/login" className="btn-primary w-full mt-2">
              <ArrowLeft size={14} /> Voltar ao login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="card border-white/[0.08] space-y-4 p-6">
            <div>
              <h2 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>Esqueceu sua senha?</h2>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                Informe o CNPJ da empresa e seu e-mail. Enviaremos um link para redefinir sua senha.
              </p>
            </div>

            <div>
              <label className="label">CNPJ da Empresa</label>
              <input
                className={`input font-mono ${errors.cnpj ? 'input-error' : ''}`}
                placeholder="00.000.000/0001-00"
                maxLength={18}
                {...register('cnpj', {
                  required: 'CNPJ obrigatório',
                  validate: v => v.replace(/\D/g, '').length === 14 || 'CNPJ deve ter 14 dígitos',
                })}
                onChange={e => {
                  const formatted = formatCNPJ(e.target.value);
                  e.target.value = formatted;
                  setValue('cnpj', formatted);
                }}
              />
              {errors.cnpj && <p className="field-error"><AlertCircle size={12} />{errors.cnpj.message}</p>}
            </div>

            <div>
              <label className="label">E-mail da conta</label>
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

            <button type="submit" className="btn-primary w-full py-2.5" disabled={isSubmitting}>
              <Mail size={15} />
              {isSubmitting ? 'Enviando...' : 'Enviar link de recuperação'}
            </button>

            <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>
              <ArrowLeft size={14} /> Voltar ao login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
