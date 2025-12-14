import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { authService } from "./services/api";

import { Login } from "./pages/Login";
import { DashboardLayout } from "./components/DashboardLayout";
import { PrivateRoute } from "./components/PrivateRoute";

import Areas from "./pages/Areas";
import Plantas from "./pages/Plantas";
import Cultivos from "./pages/Cultivos";
import Dashboard from "./pages/Dashboard";
import Tarefas from "./pages/Tarefas";
import Administracao from "./pages/Administracao";
import Relatorios from "./pages/Relatorios";

// --- NOVO COMPONENTE DE PROTEÇÃO ---
// Ele verifica o usuário NA HORA que a rota é chamada
const RotaAdmin = ({ children }) => {
    const usuario = authService.obterUsuarioLogado();

    if (usuario?.funcao !== 'ADMINISTRADOR') {
        // Se não for admin, manda pro dashboard
        return <Navigate to="/dashboard" replace />;
    }

    // Se for admin, libera o acesso
    return children;
};

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* --- ROTAS PÚBLICAS --- */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />

                {/* --- ROTAS PROTEGIDAS --- */}
                <Route element={<PrivateRoute />}>

                    <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
                    <Route path="/areas" element={<DashboardLayout><Areas /></DashboardLayout>} />
                    <Route path="/plantas" element={<DashboardLayout><Plantas /></DashboardLayout>} />
                    <Route path="/cultivos" element={<DashboardLayout><Cultivos /></DashboardLayout>} />
                    <Route path="/tarefas" element={<DashboardLayout><Tarefas /></DashboardLayout>} />
                    <Route path="/relatorios" element={<DashboardLayout><Relatorios /></DashboardLayout>} />

                    {/* --- ROTA ADMIN CORRIGIDA --- */}
                    <Route path="/admin" element={
                        <DashboardLayout>
                            <RotaAdmin>
                                <Administracao />
                            </RotaAdmin>
                        </DashboardLayout>
                    } />

                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default App;