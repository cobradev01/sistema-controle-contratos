# Topologia do Projeto — Sistema de Controle de Contratos

> Documento de referência arquitetural. Use para replicar esta base em novos projetos.

---

## Visão Geral

Sistema SaaS **multitenant por CNPJ**. Cada empresa tem seus próprios dados isolados por `companyId`. Deploy: frontend no Vercel, backend + banco no Railway.

```
Browser / Mobile
      │
      ▼
  Vercel (React SPA)
      │  HTTPS REST /api/*
      ▼
  Railway (Node.js + Express)
      │  Prisma ORM
      ▼
  Railway (PostgreSQL)
```

---

## Stack

| Camada | Tecnologia | Versão |
|---|---|---|
| Frontend | React + Vite | 18.x / 5.x |
| Roteamento | React Router DOM | v6 |
| Estado global | Zustand | 4.x |
| HTTP client | Axios | 1.x |
| Formulários | React Hook Form | 7.x |
| Gráficos | Recharts | 2.x |
| Datas | date-fns | 3.x |
| Ícones | Lucide React | 0.368 |
| Toasts | React Hot Toast | 2.x |
| CSS | Tailwind CSS v3 + CSS vars | 3.4 |
| Backend | Node.js + Express | 4.x |
| ORM | Prisma | 5.x |
| Banco | PostgreSQL (Railway) | — |
| Auth | JWT (jsonwebtoken) | 9.x |
| Senha | bcryptjs | 2.x |
| E-mail | Nodemailer | 6.x |
| Upload | Multer | 1.x |

---

## Estrutura de Arquivos

```
sistema-controle-contratos/
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js          # darkMode: 'class', font: Roboto
│   ├── postcss.config.js
│   ├── vercel.json                 # rewrites SPA: "/*" → "/index.html"
│   └── src/
│       ├── main.jsx                # BrowserRouter + ThemeStore.init()
│       ├── App.jsx                 # Rotas + PrivateRoute guard
│       ├── App.css
│       ├── index.css               # Todas as classes utilitárias (ver seção CSS)
│       ├── lib/
│       │   └── api.js              # Axios instance + interceptors JWT
│       ├── store/
│       │   ├── authStore.js        # Zustand: user, company, token, login/logout/loadUser
│       │   └── themeStore.js       # Zustand persist: dark/light, toggle, init()
│       ├── components/
│       │   ├── Layout.jsx          # Sidebar drawer (mobile) + top bar mobile + Outlet
│       │   └── CurrencyInput.jsx   # Input com máscara BRL (R$ 1.234,56)
│       └── pages/
│           ├── LoginPage.jsx
│           ├── RegisterPage.jsx
│           ├── ForgotPasswordPage.jsx
│           ├── ResetPasswordPage.jsx
│           ├── SignPage.jsx            # Página pública de assinatura (token na URL)
│           ├── Dashboard.jsx
│           ├── ContractsPage.jsx
│           ├── ContractDetailPage.jsx
│           ├── NewContractPage.jsx
│           ├── TemplatesPage.jsx
│           ├── SignaturesPage.jsx
│           ├── ContractManagerPage.jsx
│           ├── ObrasPage.jsx
│           ├── ObraDetailPage.jsx
│           ├── PurchaseOrdersPage.jsx
│           ├── ReportsPage.jsx
│           └── UsersPage.jsx
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma           # 13 models (ver seção Banco)
│   │   └── seed.js                 # Empresa demo + 3 templates padrão
│   └── src/
│       ├── server.js               # Express app, CORS, rotas, error handler
│       ├── lib/
│       │   └── prisma.js           # PrismaClient singleton
│       ├── middleware/
│       │   └── auth.js             # authMiddleware + requireRole(...roles)
│       └── routes/
│           ├── auth.js             # POST /register, POST /login, GET /me
│           ├── passwordReset.js    # POST /forgot-password, POST /reset-password/:token
│           ├── contracts.js        # CRUD contratos
│           ├── templates.js        # CRUD templates
│           ├── signatures.js       # Envio + assinatura eletrônica
│           ├── obras.js            # CRUD obras + steps + custos + vistorias
│           ├── purchaseOrders.js   # CRUD ordens de compra
│           ├── dashboard.js        # GET /dashboard (KPIs + charts)
│           ├── uploads.js          # POST upload Multer
│           ├── users.js            # CRUD usuários (ADMIN only)
│           └── reports.js          # GET /reports (resumo financeiro)
│
├── ACESSO.md                       # URL produção + credenciais demo
├── TOPOLOGIA.md                    # Este arquivo
└── README.md                       # Setup local + módulos + changelog
```

---

## Banco de Dados — Models Prisma

### Multitenancy
Toda tabela de negócio tem `companyId String`. O backend filtra **sempre** por `req.companyId` (injetado pelo `authMiddleware`). Nunca expor dados cruzando empresa.

### Models

| Model | Tabela | Descrição |
|---|---|---|
| `Company` | `companies` | Tenant raiz — identificado por CNPJ único |
| `User` | `users` | Usuário vinculado a empresa; roles: ADMIN / MANAGER / USER |
| `ContractTemplate` | `contract_templates` | Template com campos dinâmicos por tipo |
| `ContractTemplateField` | `contract_template_fields` | Campos do template (TEXT, DATE, CURRENCY, etc.) |
| `Contract` | `contracts` | Contrato gerado a partir de template ou livre |
| `SignatureRequest` | `signature_requests` | Pedido de assinatura com token único + canal (EMAIL/WHATSAPP) |
| `Obra` | `obras` | Obra vinculada opcionalmente a contrato |
| `ObraStep` | `obra_steps` | Etapa da obra por fase (PLANNING/EXECUTION/DELIVERY) |
| `ObraVistoria` | `obra_vistorias` | Vistoria inicial/progresso/final |
| `ObraCusto` | `obra_custos` | Lançamento de custo por categoria |
| `PurchaseOrder` | `purchase_orders` | Ordem de compra com itens JSON |
| `Upload` | `uploads` | Arquivo vinculado a qualquer entidade |
| `AuditLog` | `audit_logs` | Log de ações por empresa/usuário |

### Enums principais

```
UserRole:        ADMIN | MANAGER | USER
ContractType:    SERVICE | WORK | EMPLOYMENT | LEASE | PURCHASE | OTHER
ContractStatus:  DRAFT | PENDING_SIGNATURE | SIGNED | ACTIVE | EXPIRING | EXPIRED | CANCELLED | ARCHIVED
SignatureStatus: PENDING | SENT | VIEWED | SIGNED | EXPIRED | CANCELLED
ObraStatus:      PLANNING | IN_PROGRESS | PAUSED | COMPLETED | CANCELLED
ObraPhase:       PLANNING | EXECUTION | DELIVERY
StepStatus:      PENDING | IN_PROGRESS | COMPLETED | BLOCKED
CostCategory:    MATERIAL | LABOR | EQUIPMENT | SERVICE | TRANSPORT | OTHER
POStatus:        DRAFT | PENDING_APPROVAL | APPROVED | SENT | COMPLETED | CANCELLED
```

---

## Autenticação

**Fluxo login:**
1. Frontend envia `{ cnpj, email, password }` → `POST /api/auth/login`
2. Backend resolve empresa pelo CNPJ, valida credenciais, retorna JWT
3. Frontend salva token no `localStorage` via `authStore`
4. Toda requisição subsequente envia `Authorization: Bearer <token>`
5. `authMiddleware` valida JWT, busca usuário no banco, injeta `req.user` e `req.companyId`

**Forgot password:**
- `POST /api/auth/forgot-password` → gera token SHA256, salva com expiração 1h, envia e-mail HTML via Nodemailer
- `POST /api/auth/reset-password/:token` → valida token + expiração, atualiza senha com bcrypt

**Roles:**
- `ADMIN` — acesso total (usuários, configurações)
- `MANAGER` — gerencia contratos e obras
- `USER` — acesso somente leitura / operacional

Proteção no backend: `requireRole('ADMIN')` como middleware nas rotas restritas.

---

## Frontend — Padrões

### Roteamento
```
/login                  → LoginPage (pública)
/register               → RegisterPage (pública)
/esqueci-senha          → ForgotPasswordPage (pública)
/redefinir-senha/:token → ResetPasswordPage (pública)
/assinar/:token         → SignPage (pública — link externo de assinatura)

/ (PrivateRoute → Layout)
  /dashboard
  /contratos
  /contratos/novo
  /contratos/:id
  /templates
  /assinaturas
  /gerenciador
  /obras
  /obras/:id
  /ordens-compra
  /relatorios
  /usuarios
```

`PrivateRoute` verifica `token` no `authStore`. Sem token → redirect `/login`.

### Estado Global (Zustand)

**`authStore`**
```js
{ user, company, token, loading }
login(cnpj, email, password)   // POST /auth/login → salva token localStorage
register(data)                 // POST /auth/register
loadUser()                     // GET /auth/me → chamado no App.useEffect
logout()                       // limpa localStorage + store
```

**`themeStore`** (persist em localStorage key `glc-theme`)
```js
{ dark }
toggle()   // inverte + aplica classe 'dark' no documentElement
init()     // aplicado no main.jsx para hidratar tema salvo
```

### API Client (`lib/api.js`)
- Axios com `baseURL = VITE_API_URL || http://localhost:3001/api`
- Request interceptor: injeta `Authorization: Bearer <token>` do localStorage
- Response interceptor: status 401 → limpa token + redireciona `/login`

### Componentes

**`Layout.jsx`**
- Sidebar fixa no desktop (`lg:`), drawer deslizante no mobile
- Estado local `sidebarOpen` para controle do drawer
- Overlay escuro ao abrir no mobile, fecha ao clicar fora ou em qualquer link
- Top bar mobile com hamburguer + nome da empresa
- Footer: toggle dark/light, avatar do usuário, botão logout

**`CurrencyInput.jsx`**
- Input controlado com máscara BRL em tempo real
- Recebe `value` (número) + `onChange(número)` — compatível com `react-hook-form` via `Controller`

---

## CSS — Sistema de Design (`index.css`)

Todas as classes são definidas em `@layer components` usando variáveis CSS para suporte a dark/light mode.

### Variáveis CSS
```css
/* Light (padrão) */
--bg-app, --bg-sidebar, --bg-card, --bg-input, --bg-elevated, --bg-hover
--border, --border-input, --border-focus
--text-primary, --text-secondary, --text-muted, --text-placeholder
--shadow-card, --shadow-md, --shadow-modal

/* Dark (.dark no <html>) — mesmas vars com valores escuros */
```

### Classes utilitárias do projeto

| Classe | Uso |
|---|---|
| `.btn-primary` | Botão azul principal |
| `.btn-secondary` | Botão secundário com borda |
| `.btn-danger` | Botão vermelho |
| `.btn-ghost` | Botão sem fundo |
| `.card` | Card branco/escuro com borda e sombra (padding 20px) |
| `.card-sm` | Card menor (padding 14px) |
| `.kpi-blue/green/amber/red/purple/teal` | Card KPI com gradiente colorido |
| `.input` | Input estilizado |
| `.input-error` | Input com borda vermelha |
| `.label` | Label de formulário uppercase |
| `.field-error` | Mensagem de erro de campo |
| `.badge` | Badge base inline |
| `.badge-draft/active/pending/signed/expired/cancelled/info` | Variantes de status |
| `.table-wrapper` | Container de tabela com overflow-x-auto |
| `.table` | Tabela estilizada |
| `.page-header` | Flex wrap entre título e botão de ação |
| `.page-title` | Título bold xl |
| `.page-subtitle` | Subtítulo muted |
| `.modal-overlay` | Overlay fixo com blur |
| `.modal` | Container do modal |
| `.modal-header/body/footer` | Seções do modal |
| `.tabs` | Container de abas |
| `.tab` | Aba individual |
| `.tab-active` | Aba ativa com borda azul |
| `.progress-bar` | Barra de progresso container |
| `.progress-fill` | Preenchimento da barra |

### Dark Mode
Ativado pela classe `dark` no `<html>`. Aplicada pelo `themeStore.toggle()`.
Variáveis CSS mudam automaticamente — **não usar cores Tailwind direto, usar `var(--...)`**.

---

## Variáveis de Ambiente

### Backend (`.env`)
```
DATABASE_URL=postgresql://user:pass@host:port/db
JWT_SECRET=string_aleatorio_longo
JWT_EXPIRES_IN=7d
PORT=3001
FRONTEND_URL=https://seu-dominio.vercel.app
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu@email.com
SMTP_PASS=senha_de_app_google
```

### Frontend (`.env`)
```
VITE_API_URL=https://seu-backend.railway.app/api
```

---

## Deploy

| Serviço | Plataforma | Comando build |
|---|---|---|
| Frontend | Vercel | `npm run build` → `dist/` |
| Backend | Railway | `npm start` (node src/server.js) |
| Banco | Railway (PostgreSQL) | `npx prisma migrate deploy` |

**`vercel.json`** obrigatório para SPA routing:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**Primeiro deploy Railway:**
```bash
npx prisma migrate deploy
node prisma/seed.js   # cria empresa demo + templates
```

---

## Padrão de uma rota backend

```js
// Sempre filtra por companyId do token
router.get('/', authMiddleware, async (req, res) => {
  try {
    const items = await prisma.model.findMany({
      where: { companyId: req.companyId },  // <— obrigatório
      orderBy: { createdAt: 'desc' },
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

## Padrão de uma página frontend

```jsx
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
        <button className="btn-primary">Ação</button>
      </div>
      {/* conteúdo */}
    </div>
  );
}
```
