import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  MapPin, 
  Sprout, 
  Wheat, 
  BarChart3, 
  CheckSquare, 
  Shield, 
  LogOut, 
  Bell, 
  User 
} from 'lucide-react';

export const DashboardLayout = ({ children, onLogout }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Função para verificar se o link está ativo
  const isActive = (path) => {
    if (path === '/' && currentPath === '/') return true;
    if (path !== '/' && currentPath.startsWith(path)) return true;
    return false;
  };

  // Estilo dinâmico para links (Ativo vs Inativo)
  const getLinkStyle = (path) => ({
    textDecoration: 'none',
    padding: '12px 16px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '0.95rem',
    transition: 'all 0.2s',
    color: 'white',
    backgroundColor: isActive(path) ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
    fontWeight: isActive(path) ? '600' : '400',
    borderLeft: isActive(path) ? '4px solid #4ade80' : '4px solid transparent'
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f4f9' }}>
      
      {/* --- SIDEBAR (Lateral) --- */}
      <aside style={{ 
        width: '260px', 
        backgroundColor: '#1b5e20', 
        color: 'white', 
        display: 'flex', 
        flexDirection: 'column',
        boxShadow: '4px 0 10px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 20
      }}>
        {/* Logo */}
        <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem' }}>
            <Sprout size={28} color="#4ade80" /> Cultiva+
          </h2>
          <p style={{ margin: '5px 0 0 0', fontSize: '0.75rem', opacity: 0.7, paddingLeft: '38px' }}>Sistema Agrícola</p>
        </div>

        {/* Navegação */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1, padding: '20px 10px' }}>
          <Link to="/" style={getLinkStyle('/')}><Home size={20}/> Dashboard</Link>
          <Link to="/areas" style={getLinkStyle('/areas')}><MapPin size={20}/> Áreas</Link>
          <Link to="/plantas" style={getLinkStyle('/plantas')}><Sprout size={20}/> Plantas</Link>
          <Link to="/cultivos" style={getLinkStyle('/cultivos')}><Wheat size={20}/> Cultivos</Link>
          <Link to="/tarefas" style={getLinkStyle('/tarefas')}><CheckSquare size={20}/> Tarefas</Link>
          <Link to="/relatorios" style={getLinkStyle('/relatorios')}><BarChart3 size={20}/> Relatórios</Link>
          
          <div style={{ margin: '10px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}></div>
          
          <Link to="/admin" style={getLinkStyle('/admin')}><Shield size={20}/> Administração</Link>
        </nav>

        {/* Logout */}
        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <button onClick={onLogout} style={{
                ...getLinkStyle('logout'), 
                width: '100%', 
                border: 'none', 
                cursor: 'pointer', 
                color: '#ffcdd2',
                justifyContent: 'flex-start'
            }}>
                <LogOut size={20}/> Sair
            </button>
        </div>
      </aside>


      {/* --- ÁREA PRINCIPAL (Header + Conteúdo) --- */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* HEADER (Topo) - Igual ao Lovable */}
        <header style={{
            height: '64px',
            backgroundColor: 'white',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end', // Alinha itens à direita
            padding: '0 30px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                {/* Ícone de Notificação */}
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', color: '#64748b' }}>
                    <Bell size={20} />
                    <span style={{
                        position: 'absolute', top: '-2px', right: '-2px', 
                        width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%'
                    }}></span>
                </button>

                {/* Divisor Vertical */}
                <div style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0' }}></div>

                {/* Perfil do Usuário */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <div style={{ textAlign: 'right' }}>
                        <span style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#0f172a' }}>Usuário Admin</span>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Fazenda Principal</span>
                    </div>
                    <div style={{
                        width: '36px', height: '36px', borderRadius: '50%', 
                        backgroundColor: '#dcfce7', color: '#166534',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '1px solid #bbf7d0'
                    }}>
                        <User size={18} />
                    </div>
                </div>
            </div>
        </header>

        {/* CONTEÚDO DA PÁGINA (Scrollável) */}
        <main style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
            {children}
        </main>

      </div>

    </div>
  );
};