import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { BookOpen, Plus } from 'lucide-react';

const TYPE_LABELS = { SERVICE: 'Serviço', WORK: 'Obra', EMPLOYMENT: 'Trabalho', LEASE: 'Locação', PURCHASE: 'Compra', OTHER: 'Outro' };

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);

  useEffect(() => { api.get('/templates').then(r => setTemplates(r.data)); }, []);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Templates de Contratos</h1>
          <p className="text-gray-500 text-sm">Biblioteca de modelos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map(t => (
          <div key={t.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 rounded-lg"><BookOpen size={18} className="text-blue-600" /></div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{t.name}</p>
                <p className="text-xs text-blue-600 font-medium mt-0.5">{TYPE_LABELS[t.type]}</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-3">{t.description}</p>
            <div className="flex items-center justify-between mt-4 pt-3 border-t">
              <span className="text-xs text-gray-400">{t.fields?.length || 0} campos</span>
              <Link to={`/contratos/novo`} className="text-sm text-blue-600 hover:underline font-medium">Usar template →</Link>
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <BookOpen size={40} className="mx-auto mb-3 text-gray-300" />
          <p>Nenhum template disponível</p>
          <p className="text-sm mt-1">Execute o seed do banco para criar templates padrão</p>
        </div>
      )}
    </div>
  );
}
