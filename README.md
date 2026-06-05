# Sistema de Controle de Contratos & Gestão Orçamentária

Sistema SaaS local para controle de contratos e gestão orçamentária de obras.

## Stack
- **Frontend**: React + Vite + TailwindCSS + Zustand
- **Backend**: Node.js + Express
- **ORM**: Prisma
- **Banco de Dados**: PostgreSQL (Railway)
- **Auth**: JWT multi-tenant

## Pré-requisitos
- Node.js v20+
- Conta no Railway (banco PostgreSQL já configurado)

## Instalação e Execução Local

### 1. Clone o repositório
```bash
git clone https://github.com/cobradev01/sistema-controle-contratos.git
cd sistema-controle-contratos
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env
# Edite o .env com sua DATABASE_URL do Railway
npx prisma generate
npx prisma migrate deploy
node prisma/seed.js
npm run dev
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

O sistema estará disponível em:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001

## Credenciais de Demonstração
- **CNPJ**: 00.000.000/0001-00
- **E-mail**: admin@glctecnologia.com.br
- **Senha**: admin123

## Módulos

### 1. Gestão de Contratos
- Listagem com filtros por status, tipo e busca
- Biblioteca de templates (Serviço, Obra, Locação)
- Criação guiada com campos dinâmicos por template
- Visualização completa antes de assinar

### 2. Assinatura Eletrônica
- Envio por e-mail e/ou WhatsApp
- Link único por signatário com expiração
- Rastreamento: Aguardando → Visualizado → Assinado
- Histórico completo de envios

### 3. Gerenciador de Contratos
- Painel com vigência restante calculada automaticamente
- Alertas de contratos vencendo em 30 dias
- Ações rápidas: Visualizar, Renovar, Encerrar

### 4. Gestão de Obras
- Roteiro com checklist por fase (Planejamento / Execução / Entrega)
- Vistoria inicial e final com registro descritivo
- Controle de custos por categoria com previsto vs. realizado
- Geração de Ordem de Compra com CNPJ pagador
- Vinculação ao contrato de origem

### 5. Dashboard
- KPIs em tempo real do banco de dados
- Gráficos de contratos por tipo e obras por status
- Alertas de pendências

### 6. Relatórios
- Resumo financeiro consolidado
- Contratos por status e tipo
- Obras: orçado vs. realizado

## Variáveis de Ambiente

### Backend (.env)
```
DATABASE_URL=postgresql://...
JWT_SECRET=seu_secret
JWT_EXPIRES_IN=7d
PORT=3001
FRONTEND_URL=http://localhost:5173
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu@email.com
SMTP_PASS=sua_senha_app
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3001/api
```

## Changelog

### 2026-06-05
**Responsivo mobile completo**
- `Layout.jsx`: sidebar fixa substituída por drawer deslizante no mobile — botão hamburguer + overlay de fechamento; desktop mantém comportamento original
- `index.css`: `table-wrapper` com `overflow-x: auto` (tabelas roláveis no celular); `page-header` com `flex-wrap` para não esmagar título e botão
- Todas as páginas: padding `p-4 sm:p-6` (adaptativo) em vez de `p-6` fixo
- `Dashboard`: data oculta em telas pequenas, header com `flex-wrap`
- `ContractsPage`: filtros empilham em coluna no mobile e abrem em linha no desktop

### 2026-06-04 — Scaffold inicial
**Sistema completo desenvolvido do zero**
- Scaffold completo: autenticação JWT multi-tenant, controle de contratos, obras, ordens de compra, assinaturas, relatórios e dashboard
- Visual ERP/SaaS premium com KPI cards coloridos, dark/light mode, máscara BRL
- Esqueci senha com token seguro (1h), indicador de força de senha, e-mail HTML
- Deploy: frontend Vercel + backend Railway

## Estrutura do Projeto
```
sistema-controle-contratos/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma     # 13 tabelas com relacionamentos
│   │   └── seed.js           # Dados iniciais + 3 templates
│   ├── src/
│   │   ├── lib/prisma.js
│   │   ├── middleware/auth.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── contracts.js
│   │   │   ├── templates.js
│   │   │   ├── signatures.js
│   │   │   ├── obras.js
│   │   │   ├── purchaseOrders.js
│   │   │   ├── dashboard.js
│   │   │   ├── reports.js
│   │   │   ├── uploads.js
│   │   │   └── users.js
│   │   └── server.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/Layout.jsx
    │   ├── lib/api.js
    │   ├── pages/             # 12 páginas
    │   ├── store/authStore.js
    │   └── App.jsx
    └── package.json
```
