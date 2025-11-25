import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "./components/DashboardLayout";

import Areas from "./pages/Areas";
import Plantas from "./pages/Plantas";
import Cultivos from "./pages/Cultivos";
import Dashboard from "./pages/Dashboard";
import Administracao from "./pages/Administracao";

const Relatorios = () => <h1>📈 Relatórios Gerenciais (Em construção)</h1>;

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
      <Route path="/areas" element={<DashboardLayout><Areas /></DashboardLayout>} />
      <Route path="/plantas" element={<DashboardLayout><Plantas /></DashboardLayout>} />
      <Route path="/cultivos" element={<DashboardLayout><Cultivos /></DashboardLayout>} />
      <Route path="/relatorios" element={<DashboardLayout><Relatorios /></DashboardLayout>} />
      <Route path="/admin" element={<DashboardLayout><Administracao /></DashboardLayout>} />
    </Routes>
  </BrowserRouter>
);

export default App;