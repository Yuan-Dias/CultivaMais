import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { Login } from "./pages/Login";
import { DashboardLayout } from "./components/DashboardLayout";

import Areas from "./pages/Areas";
import Plantas from "./pages/Plantas";
import Cultivos from "./pages/Cultivos";
import Dashboard from "./pages/Dashboard";
import Tarefas from "./pages/Tarefas";
import Administracao from "./pages/Administracao";
import Relatorios from "./pages/Relatorios";

const App = () => (
  <BrowserRouter>
    <Routes>

        {/* --- ROTAS PÚBLICAS --- */}
        {/* Se acessar a raiz "/", joga para o "/login" */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* A tela de Login fica FORA do DashboardLayout para não ter menu lateral */}
        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
        <Route path="/areas" element={<DashboardLayout><Areas /></DashboardLayout>} />
        <Route path="/plantas" element={<DashboardLayout><Plantas /></DashboardLayout>} />
        <Route path="/cultivos" element={<DashboardLayout><Cultivos /></DashboardLayout>} />
        <Route path="/tarefas" element={<DashboardLayout><Tarefas /></DashboardLayout>} />
        <Route path="/relatorios" element={<DashboardLayout><Relatorios /></DashboardLayout>} />
        <Route path="/admin" element={<DashboardLayout><Administracao /></DashboardLayout>} />
    </Routes>
  </BrowserRouter>
);

export default App;