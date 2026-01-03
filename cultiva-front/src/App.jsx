import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { authService } from "./services/api";

// Importe do Contexto de Notificação
import { NotificationProvider } from "./context/NotificationContext";

import { Login } from "./pages/Login";
import { DashboardLayout } from "./components/DashboardLayout";
import { PrivateRoute } from "./components/PrivateRoute";

// Importe as páginas
import Areas from "./pages/Areas";
import Plantas from "./pages/Plantas";
import Cultivos from "./pages/Cultivos";
import Dashboard from "./pages/Dashboard";
import Tarefas from "./pages/Tarefas";
import Administracao from "./pages/Administracao";
import Relatorios from "./pages/Relatorios";
import Perfil from "./pages/Perfil";

// --- COMPONENTE DE PROTEÇÃO ADMIN ---
const RotaAdmin = ({ children }) => {
    const usuario = authService.obterUsuarioLogado();

    // Verifica se existe usuário e se a função é ADMINISTRADOR
    if (usuario?.funcao !== 'ADMINISTRADOR') {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

const App = () => {
    return (
        <NotificationProvider>
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
                        <Route path="/perfil" element={<DashboardLayout><Perfil /></DashboardLayout>} />

                        {/* --- ROTA ADMIN --- */}
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
        </NotificationProvider>
    );
};

export default App;