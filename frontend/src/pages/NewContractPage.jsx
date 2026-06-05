import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import toast from 'react-hot-toast';

const CONTRACT_TYPES = [
  { value: 'SERVICE', label: 'Prestação de Serviço' },
  { value: 'WORK', label: 'Contrato de Obra' },
  { value: 'EMPLOYMENT', label: 'Contrato de Trabalho' },
  { value: 'LEASE', label: 'Locação' },
  { value: 'PURCHASE', label: 'Compra' },
  { value: 'OTHER', label: 'Outro' },
];

export default function NewContractPage() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [form, setForm] = useState({ title: '', type: 'SERVICE', relatedParty: '', relatedDoc: '', value: '', startDate: '', endDate: '', notes: '', content: '', fieldValues: {} });
  const [loading, setLoading] = useState(false);

  useEffect(() => { api.get('/templates').then(r => setTemplates(r.data)); }, []);

  function selectTemplate(tmpl) {
    setSelectedTemplate(tmpl);
    setForm(f => ({ ...f, type: tmpl.type, content: tmpl.content, title: `Contrato - ${tmpl.name}` }));
    setStep(2);
  }

  function skipTemplate() {
    setSelectedTemplate(null);
    setStep(2);
  }

  function handleFieldValue(name, value) {
    setForm(f => {
      const fv = { ...f.fieldValues, [name]: value };
      let content = selectedTemplate?.content || f.content;
      Object.entries(fv).forEach(([k, v]) => { content = content.replaceAll(`{{${k}}}`, v); });
      return { ...f, fieldValues: fv, content };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/contracts', { ...form, templateId: selectedTemplate?.id });
      toast.success('Contrato criado com sucesso!');
      navigate(`/contratos/${data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao criar contrato');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Novo Contrato</h1>
        <div className="flex gap-4 mt-3">
          {['Escolher Template', 'Preencher Dados', 'Revisar'].map((s, i) => (
            <div key={s} className={`flex items-center gap-2 text-sm ${step === i + 1 ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
              <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold ${step === i + 1 ? 'bg-blue-600 text-white' : step > i + 1 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>{i + 1}</span>
              {s}
            </div>
          ))}
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-gray-900">Escolha um template ou crie do zero</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map(t => (
              <button key={t.id} onClick={() => selectTemplate(t)} className="card text-left hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
                <p className="font-semibold text-gray-900">{t.name}</p>
                <p className="text-sm text-gray-500 mt-1">{t.description}</p>
                <p className="text-xs text-blue-600 mt-2">{t.fields?.length} campos personalizáveis</p>
              </button>
            ))}
            <button onClick={skipTemplate} className="card text-left hover:border-blue-300 hover:shadow-md transition-all cursor-pointer border-dashed">
              <p className="font-semibold text-gray-900">Contrato em branco</p>
              <p className="text-sm text-gray-500 mt-1">Crie um contrato do zero com seu próprio conteúdo</p>
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <form onSubmit={(e) => { e.preventDefault(); setStep(3); }} className="card space-y-4">
          <h2 className="font-semibold text-gray-900">Dados do Contrato</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Título *</label>
              <input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div>
              <label className="label">Tipo</label>
              <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                {CONTRACT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Valor (R$)</label>
              <input className="input" type="number" step="0.01" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} />
            </div>
            <div>
              <label className="label">Parte Relacionada *</label>
              <input className="input" placeholder="Nome ou Razão Social" value={form.relatedParty} onChange={e => setForm({ ...form, relatedParty: e.target.value })} required />
            </div>
            <div>
              <label className="label">CPF/CNPJ</label>
              <input className="input" value={form.relatedDoc} onChange={e => setForm({ ...form, relatedDoc: e.target.value })} />
            </div>
            <div>
              <label className="label">Data de Início</label>
              <input className="input" type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div>
              <label className="label">Data de Encerramento</label>
              <input className="input" type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
            </div>
          </div>

          {selectedTemplate?.fields?.length > 0 && (
            <div className="border-t pt-4 space-y-3">
              <p className="font-medium text-gray-700 text-sm">Campos do Template</p>
              {selectedTemplate.fields.map(field => (
                <div key={field.id}>
                  <label className="label">{field.label}{field.required && ' *'}</label>
                  {field.type === 'TEXTAREA' ? (
                    <textarea className="input" rows={3} onChange={e => handleFieldValue(field.name, e.target.value)} />
                  ) : (
                    <input className="input" type={field.type === 'DATE' ? 'date' : field.type === 'NUMBER' || field.type === 'CURRENCY' ? 'number' : 'text'}
                      onChange={e => handleFieldValue(field.name, e.target.value)} />
                  )}
                </div>
              ))}
            </div>
          )}

          {!selectedTemplate && (
            <div>
              <label className="label">Conteúdo do Contrato *</label>
              <textarea className="input font-mono text-xs" rows={12} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} required />
            </div>
          )}

          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(1)} className="btn-secondary">Voltar</button>
            <button type="submit" className="btn-primary">Continuar</button>
          </div>
        </form>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Revisão do Contrato</h2>
            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              <div><span className="text-gray-500">Título:</span> <span className="font-medium">{form.title}</span></div>
              <div><span className="text-gray-500">Parte:</span> <span className="font-medium">{form.relatedParty}</span></div>
              <div><span className="text-gray-500">Valor:</span> <span className="font-medium">{form.value ? `R$ ${form.value}` : '—'}</span></div>
              <div><span className="text-gray-500">Vigência:</span> <span className="font-medium">{form.startDate || '—'} até {form.endDate || '—'}</span></div>
            </div>
            <div className="border rounded-lg p-4 bg-gray-50 max-h-64 overflow-y-auto">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans">{form.content}</pre>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="btn-secondary">Editar</button>
            <button onClick={handleSubmit} className="btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar como Rascunho'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
