# Guia para Claude — Projeto Financeiro B2B

> Este projeto segue a mesma base arquitetural do sistema-controle-contratos.
> Leia TOPOLOGIA.md para entender a estrutura completa antes de qualquer ação.

---

## Stack (não alterar)

React 18 + Vite · Zustand · Axios · React Hook Form · Recharts · Lucide React · React Hot Toast · Tailwind CSS v3 com CSS vars · Node.js + Express · Prisma 5 · PostgreSQL · JWT · Nodemailer

---

## Regras invioláveis

1. **Nunca implementar sem análise prévia** — sempre analisar primeiro ("analise sem alterar nada")
2. **Multitenancy obrigatório** — toda query no backend filtra por `companyId: req.companyId`
3. **Nunca usar cores Tailwind direto** — usar `var(--text-primary)`, `var(--bg-card)`, etc.
4. **Dark mode via classe** — `dark` no `<html>`, controlado pelo `themeStore`
5. **Responsivo sempre** — padding `p-4 sm:p-6`, grids com breakpoints, tabelas com `overflow-x-auto`
6. **Token no localStorage** — `authStore` cuida disso; não duplicar lógica

---

## Arquivos críticos — não refatorar sem necessidade

| Arquivo | Responsabilidade |
|---|---|
| `frontend/src/store/authStore.js` | Auth, roles, company — fonte de verdade |
| `frontend/src/store/themeStore.js` | Dark/light mode persistido |
| `frontend/src/lib/api.js` | Axios com interceptors JWT + redirect 401 |
| `frontend/src/components/Layout.jsx` | Sidebar drawer mobile + top bar |
| `backend/src/middleware/auth.js` | JWT validate + requireRole |
| `backend/prisma/schema.prisma` | Modelos do banco |

---

## Padrão de nova feature

### Backend — nova rota
```js
// backend/src/routes/minha-rota.js
const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const items = await prisma.meuModel.findMany({
      where: { companyId: req.companyId },  // OBRIGATÓRIO
      orderBy: { createdAt: 'desc' },
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
```

Registrar em `server.js`:
```js
const minhaRota = require('./routes/minha-rota');
app.use('/api/minha-rota', minhaRota);
```

### Frontend — nova página
```jsx
// frontend/src/pages/MinhaPage.jsx
export default function MinhaPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    api.get('/minha-rota').then(r => setData(r.data));
  }, []);

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Título</h1>
          <p className="page-subtitle">Subtítulo</p>
        </div>
        <button className="btn-primary"><Plus size={15} /> Nova</button>
      </div>
      {/* conteúdo */}
    </div>
  );
}
```

Registrar em `App.jsx` dentro do `<Route path="/" element={<PrivateRoute>...}>`.

### Banco — novo model
Adicionar em `schema.prisma`, sempre com:
- `id String @id @default(uuid())`
- `companyId String` + relação com `Company`
- `createdAt DateTime @default(now())`
- `updatedAt DateTime @updatedAt`

Depois rodar: `npx prisma migrate dev --name descricao`

---

## Sistema de Design (classes CSS — não reinventar)

### Botões
- `.btn-primary` — azul, ação principal
- `.btn-secondary` — com borda, ação secundária
- `.btn-danger` — vermelho, destrutivo
- `.btn-ghost` — sem fundo, discreto

### Cards
- `.card` — card padrão (padding 20px)
- `.card-sm` — card menor (padding 14px)
- `.kpi-blue/green/amber/red/purple/teal` — KPI com gradiente colorido

### Formulários
- `.input` — campo de texto/select
- `.input-error` — campo com erro
- `.label` — label uppercase
- `.field-error` — mensagem de erro

### Badges de status
- `.badge-draft` — rascunho (cinza)
- `.badge-active` — ativo (verde)
- `.badge-pending` — pendente (amarelo)
- `.badge-signed` — assinado (azul)
- `.badge-expired` — expirado (vermelho)
- `.badge-cancelled` — cancelado (cinza)
- `.badge-info` — informativo (roxo)

### Tabelas
```jsx
<div className="table-wrapper">    {/* overflow-x-auto incluído */}
  <table className="table">
    <thead><tr><th>Col</th></tr></thead>
    <tbody><tr><td>Valor</td></tr></tbody>
  </table>
</div>
```

### Modais
```jsx
<div className="modal-overlay" onClick={e => e.target === e.currentTarget && fechar()}>
  <div className="modal max-w-lg w-full">
    <div className="modal-header"><h3>Título</h3></div>
    <div className="modal-body space-y-4">...</div>
    <div className="modal-footer">
      <button className="btn-secondary">Cancelar</button>
      <button className="btn-primary">Salvar</button>
    </div>
  </div>
</div>
```

### Tabs
```jsx
<div className="flex gap-1 border-b overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
  {tabs.map(t => (
    <button key={t.id} onClick={() => setTab(t.id)}
      className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap flex-shrink-0 transition-colors
        ${tab === t.id ? 'border-blue-500 text-blue-500' : 'border-transparent'}`}
      style={tab !== t.id ? { color: 'var(--text-muted)' } : {}}>
      {t.label}
    </button>
  ))}
</div>
```

---

## Variáveis CSS disponíveis

```css
/* Backgrounds */
var(--bg-app)        /* fundo da aplicação */
var(--bg-sidebar)    /* sidebar escura */
var(--bg-card)       /* cards e painéis */
var(--bg-input)      /* inputs */
var(--bg-elevated)   /* thead, hover states */
var(--bg-hover)      /* hover de linhas */

/* Bordas */
var(--border)        /* borda padrão */
var(--border-input)  /* borda de input */
var(--border-focus)  /* foco azul */

/* Textos */
var(--text-primary)      /* título, valor destacado */
var(--text-secondary)    /* corpo */
var(--text-muted)        /* placeholder, label, datas */
var(--text-placeholder)  /* placeholder input */

/* Sombras */
var(--shadow-card)   /* sombra de card */
var(--shadow-modal)  /* sombra do modal */
```

---

## Responsivo — checklist obrigatório

Toda página/componente novo deve seguir:
- [ ] Padding: `p-4 sm:p-6` (nunca `p-6` fixo)
- [ ] Grids: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` (nunca colunas fixas sem breakpoint)
- [ ] Tabelas: sempre dentro de `<div className="table-wrapper">`
- [ ] Tabs: `overflow-x-auto` + `whitespace-nowrap flex-shrink-0` nos botões
- [ ] Headers de página: `page-header` (já tem `flex-wrap`)
- [ ] Modais: `max-w-X w-full` no container

---

## Autenticação — como usar nas páginas

```jsx
import { useAuthStore } from '../store/authStore';

// Dentro do componente:
const { user, company } = useAuthStore();

// user.role: 'ADMIN' | 'MANAGER' | 'USER'
// company.name, company.id
```

---

## Checklist antes de commitar

- [ ] Rota backend filtra por `companyId`?
- [ ] Página usa `p-4 sm:p-6`?
- [ ] Tabelas têm `table-wrapper`?
- [ ] Cores usam `var(--...)` e não Tailwind direto?
- [ ] Testou no mobile (ou ao menos revisou breakpoints)?
- [ ] Registrou rota no `server.js` e página no `App.jsx`?
