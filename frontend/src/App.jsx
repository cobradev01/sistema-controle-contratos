import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import ContractsPage from './pages/ContractsPage';
import ContractDetailPage from './pages/ContractDetailPage';
import NewContractPage from './pages/NewContractPage';
import TemplatesPage from './pages/TemplatesPage';
import SignaturesPage from './pages/SignaturesPage';
import ContractManagerPage from './pages/ContractManagerPage';
import ObrasPage from './pages/ObrasPage';
import ObraDetailPage from './pages/ObraDetailPage';
import PurchaseOrdersPage from './pages/PurchaseOrdersPage';
import ReportsPage from './pages/ReportsPage';
import UsersPage from './pages/UsersPage';
import SignPage from './pages/SignPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

function PrivateRoute({ children }) {
  const token = useAuthStore((s) => s.token);
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const loadUser = useAuthStore((s) => s.loadUser);

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/assinar/:token" element={<SignPage />} />
        <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
        <Route path="/redefinir-senha/:token" element={<ResetPasswordPage />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="contratos" element={<ContractsPage />} />
          <Route path="contratos/novo" element={<NewContractPage />} />
          <Route path="contratos/:id" element={<ContractDetailPage />} />
          <Route path="templates" element={<TemplatesPage />} />
          <Route path="assinaturas" element={<SignaturesPage />} />
          <Route path="gerenciador" element={<ContractManagerPage />} />
          <Route path="obras" element={<ObrasPage />} />
          <Route path="obras/:id" element={<ObraDetailPage />} />
          <Route path="ordens-compra" element={<PurchaseOrdersPage />} />
          <Route path="relatorios" element={<ReportsPage />} />
          <Route path="usuarios" element={<UsersPage />} />
        </Route>
      </Routes>
    </>
  );
}
