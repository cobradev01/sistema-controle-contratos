import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { ArrowLeft, BookOpen, FilePlus, AlertCircle, CheckCircle } from 'lucide-react';
import CurrencyInput from '../components/CurrencyInput';

const CONTRACT_TYPES = [
  { value: 'SERVICE', label: 'Prestação de Serviço' },
  { value: 'WORK',    label: 'Contrato de Obra' },
  { value: 'EMPLOYMENT', label: 'Contrato de Trabalho' },
  { value: 'LEASE',   label: 'Locação' },
  { value: 'PURCHASE',label: 'Compra' },
  { value: 'OTHER',   label: 'Outro' },
];

function FieldError({ message }) {
  if (!message) return null;
  return <p className="field-error"><AlertCircle size={11} />{message}</p>;
}

export default function NewContractPage() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [fieldValues, setFieldValues] = useState({});
  const [previewContent, setPreviewContent] = useState('');

  const { register, handleSubmit, watch, setValue, control, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { type: 'SERVICE' }
  });

  useEffect(() => { api.get('/templates').then(r => setTemplates(r.data)); }, []);

  function selectTemplate(tmpl) {
    setSelectedTemplate(tmpl);
    setValue('type', tmpl.type);
    setValue('title', `Contrato - ${tmpl.name}`);
    setPreviewContent(tmpl.content);
    setStep(2);
  }

  function handleDynamicField(name, value) {
    const fv = { ...fieldValues, [name]: value };
    setFieldValues(fv);
    let content = selectedTemplate?.content || '';
    Object.entries(fv).forEach(([k, v]) => { content = content.replaceAll(`{{${k}}}`, v); });
    setPreviewContent(content);
  }

  async function onSubmit(data) {
    try {
      const payload = {
        ...data,
        value: data.value ? parseFloat(data.value) : null,
        content: previewContent || data.content || '',
        templateId: selectedTemplate?.id || null,
        fieldValues,
      };
      const res = await api.post('/contracts', payload);
      toast.success('Contrato criado com sucesso!');
      navigate(`/contratos/${res.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao criar contrato');
    }
  }

  const steps = ['Template', 'Dados', 'Revisão'];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/contratos" className="btn-ghost p-2"><ArrowLeft size={16} /></Link>
        <div className="flex-1">
          <h1 className="page-title">Novo Contrato</h1>
        </div>
        {/* Step indicator */}
        <div className="flex items-center gap-1">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                step === i + 1 ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : step > i + 1 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'text-gray-700 border border-transparent'
              }`}>
                {step > i + 1 ? <CheckCircle size={11} /> : <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">{i+1}</span>}
                {s}
              </div>
              {i < steps.length - 1 && <div className="w-6 h-px bg-white/[0.06]" />}
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1 — Template */}
      {step === 1 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-400">Escolha um modelo para começar ou crie do zero</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {templates.map(t => (
              <button key={t.id} onClick={() => selectTemplate(t)}
                className="card text-left hover:border-blue-500/30 hover:bg-blue-500/[0.03] transition-all cursor-pointer group">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                    <BookOpen size={15} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-200">{t.name}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{t.description}</p>
                    <p className="text-xs text-blue-500 mt-2">{t.fields?.length} campos dinâmicos</p>
                  </div>
                </div>
              </button>
            ))}
            <button onClick={() => { setSelectedTemplate(null); setStep(2); }}
              className="card text-left hover:border-white/10 transition-all cursor-pointer border-dashed border-white/[0.06]">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/[0.04] rounded-lg border border-white/[0.08]">
                  <FilePlus size={15} className="text-gray-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-400">Contrato em branco</p>
                  <p className="text-xs text-gray-600 mt-0.5">Escreva seu próprio conteúdo</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 — Dados */}
      {step === 2 && (
        <form id="contract-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="card space-y-4">
            <p className="section-label">Informações Gerais</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">Título do Contrato *</label>
                <input className={`input ${errors.title ? 'input-error' : ''}`}
                  placeholder="Ex: Contrato de Prestação de Serviços — Empresa X"
                  {...register('title', { required: 'Título obrigatório', minLength: { value: 5, message: 'Mínimo 5 caracteres' } })} />
                <FieldError message={errors.title?.message} />
              </div>

              <div>
                <label className="label">Tipo de Contrato *</label>
                <select className="input" {...register('type', { required: true })}>
                  {CONTRACT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              <div>
                <label className="label">Valor (R$)</label>
                <Controller
                  name="value"
                  control={control}
                  rules={{ min: { value: 0, message: 'Valor não pode ser negativo' } }}
                  render={({ field }) => (
                    <CurrencyInput {...field} error={errors.value} />
                  )}
                />
                <FieldError message={errors.value?.message} />
              </div>

              <div>
                <label className="label">Parte Relacionada *</label>
                <input className={`input ${errors.relatedParty ? 'input-error' : ''}`}
                  placeholder="Nome ou Razão Social"
                  {...register('relatedParty', { required: 'Parte relacionada obrigatória', minLength: { value: 3, message: 'Mínimo 3 caracteres' } })} />
                <FieldError message={errors.relatedParty?.message} />
              </div>

              <div>
                <label className="label">CPF / CNPJ</label>
                <input className="input" placeholder="000.000.000-00 ou 00.000.000/0001-00"
                  {...register('relatedDoc')} />
              </div>

              <div>
                <label className="label">Data de Início</label>
                <input className="input" type="date" {...register('startDate')} />
              </div>

              <div>
                <label className="label">Data de Encerramento</label>
                <input className={`input ${errors.endDate ? 'input-error' : ''}`} type="date"
                  {...register('endDate', {
                    validate: v => {
                      const start = watch('startDate');
                      if (v && start && v < start) return 'Data de encerramento não pode ser anterior ao início';
                      return true;
                    }
                  })} />
                <FieldError message={errors.endDate?.message} />
              </div>
            </div>
          </div>

          {/* Dynamic fields */}
          {selectedTemplate?.fields?.length > 0 && (
            <div className="card space-y-4">
              <p className="section-label">Campos do Template — {selectedTemplate.name}</p>
              <div className="grid grid-cols-2 gap-4">
                {selectedTemplate.fields.map(f => (
                  <div key={f.id} className={f.type === 'TEXTAREA' ? 'col-span-2' : ''}>
                    <label className="label">{f.label}{f.required && ' *'}</label>
                    {f.type === 'TEXTAREA' ? (
                      <textarea className="input" rows={3} onChange={e => handleDynamicField(f.name, e.target.value)} />
                    ) : (
                      <input className="input"
                        type={f.type === 'DATE' ? 'date' : f.type === 'NUMBER' || f.type === 'CURRENCY' ? 'number' : 'text'}
                        onChange={e => handleDynamicField(f.name, e.target.value)} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Free content */}
          {!selectedTemplate && (
            <div className="card">
              <p className="section-label">Conteúdo do Contrato *</p>
              <textarea className={`input font-mono text-xs ${errors.content ? 'input-error' : ''}`} rows={14}
                placeholder="Digite o conteúdo completo do contrato..."
                {...register('content', { required: 'Conteúdo do contrato é obrigatório' })}
                onChange={e => setPreviewContent(e.target.value)} />
              <FieldError message={errors.content?.message} />
            </div>
          )}

          <div>
            <label className="label">Observações Internas</label>
            <textarea className="input" rows={2} placeholder="Notas internas (não aparecem no contrato)"
              {...register('notes')} />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(1)} className="btn-secondary">← Voltar</button>
            <button type="button" onClick={() => setStep(3)} className="btn-primary">Revisar Contrato →</button>
          </div>
        </form>
      )}

      {/* STEP 3 — Review */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="card">
            <p className="section-label mb-4">Resumo</p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm mb-5">
              {[
                { l: 'Título', v: watch('title') },
                { l: 'Tipo', v: watch('type') },
                { l: 'Parte', v: watch('relatedParty') },
                { l: 'Valor', v: watch('value') ? `R$ ${watch('value')}` : '—' },
                { l: 'Início', v: watch('startDate') || '—' },
                { l: 'Encerramento', v: watch('endDate') || '—' },
              ].map(({ l, v }) => (
                <div key={l}>
                  <span className="text-gray-600">{l}: </span>
                  <span className="text-gray-200 font-medium">{v}</span>
                </div>
              ))}
            </div>
            <p className="section-label mb-2">Conteúdo</p>
            <div className="bg-[#1e2130] rounded-lg p-4 max-h-72 overflow-y-auto border border-white/[0.06]">
              <pre className="text-xs text-gray-400 whitespace-pre-wrap font-sans leading-relaxed">{previewContent || watch('content')}</pre>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="btn-secondary">← Editar</button>
            <button onClick={handleSubmit(onSubmit)} className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : '✓ Salvar como Rascunho'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
