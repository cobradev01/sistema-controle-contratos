import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { BookOpen, ArrowRight } from 'lucide-react';

const TYPE_LABELS = { SERVICE: 'Serviço', WORK: 'Obra', EMPLOYMENT: 'Trabalho', LEASE: 'Locação', PURCHASE: 'Compra', OTHER: 'Outro' };
const TYPE_COLORS = { SERVICE: 'text-blue-400 bg-blue-500/10 border-blue-500/20', WORK: 'text-orange-400 bg-orange-500/10 border-orange-500/20', EMPLOYMENT: 'text-purple-400 bg-purple-500/10 border-purple-500/20', LEASE: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', PURCHASE: 'text-amber-400 bg-amber-500/10 border-amber-500/20', OTHER: 'text-gray-400 bg-gray-500/10 border-gray-500/20' };

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);

  useEffect(() => { api.get('/templates').then(r => setTemplates(r.data)); }, []);

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Templates de Contratos</h1>
          <p className="page-subtitle">Biblioteca de modelos reutilizáveis</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {templates.map(t => (
          <div key={t.id} className="card hover:border-white/10 transition-all group">
            <div className="flex items-start gap-3 mb-3">
              <div className={`p-2 rounded-lg border ${TYPE_COLORS[t.type] || TYPE_COLORS.OTHER}`}>
                <BookOpen size={15} />
              </div>
              <div className="flex-1">
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{t.name}</p>
                <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded text-[10px] font-medium border ${TYPE_COLORS[t.type] || TYPE_COLORS.OTHER}`}>
                  {TYPE_LABELS[t.type]}
                </span>
              </div>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{t.description}</p>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.05]">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.fields?.length || 0} campos dinâmicos</span>
              <Link to="/contratos/novo"
                className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-400 font-medium transition-colors group-hover:gap-1.5">
                Usar template <ArrowRight size={11} />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>
          <BookOpen size={40} className="mx-auto mb-3" />
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Nenhum template disponível</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Execute o seed do banco para criar templates padrão</p>
        </div>
      )}
    </div>
  );
}
