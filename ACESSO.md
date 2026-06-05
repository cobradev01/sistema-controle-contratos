# 🚀 Sistema de Controle de Contratos & Gestão Orçamentária

## 🌐 Acesso Online (Produção)

**URL do Sistema:**
👉 https://b2b-sistemas-contratos.vercel.app

**Credenciais de acesso:**
| Campo | Valor |
|---|---|
| CNPJ | `48.011.700/0001-08` |
| E-mail | `rh@associacaodebeneficios.com.br` |
| Senha | `admin123` |

---

## 📂 Repositório GitHub (Código-fonte)

👉 https://github.com/cobradev01/sistema-controle-contratos

---

## 💻 Rodar Localmente

### Pré-requisitos
- Node.js v20+ → https://nodejs.org
- Git → https://git-scm.com

### Passo a passo

```bash
# 1. Clonar o repositório
git clone https://github.com/cobradev01/sistema-controle-contratos.git
cd sistema-controle-contratos

# 2. Instalar e iniciar o Backend
cd backend
npm install
npm run dev

# 3. Em outro terminal — instalar e iniciar o Frontend
cd frontend
npm install
npm run dev
```

Acesse: **http://localhost:5173**

> O banco de dados já está na nuvem (Railway) — não precisa instalar PostgreSQL localmente.

---

## 🛠️ Stack Utilizada

| Camada | Tecnologia |
|---|---|
| Frontend | React + Vite + TailwindCSS + Zustand |
| Backend | Node.js + Express |
| Banco de Dados | PostgreSQL (Railway) |
| ORM | Prisma |
| Autenticação | JWT multi-tenant |
| Deploy Frontend | Vercel |
| Deploy Backend | Railway |
