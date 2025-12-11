import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, MapPin, Sprout, Wheat, BarChart3, 
  CheckSquare, Shield, LogOut, Bell, User,
  ChevronLeft, ChevronRight, Settings, HelpCircle
} from 'lucide-react';

// Lembre-se de importar o CSS: import './App.css';

export const DashboardLayout = ({ children, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const location = useLocation();

  // Função auxiliar para fechar dropdowns ao clicar em links
  const handleNavClick = () => {
    // Opcional: fechar sidebar em mobile aqui se necessário
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
    setShowNotifications(false); // Fecha o outro se estiver aberto
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    setShowUserMenu(false); // Fecha o outro se estiver aberto
  };

  // Verifica Link Ativo
  const isActive = (path) => {
    const currentPath = location.pathname;
    if (path === '/' && currentPath === '/') return true;
    if (path !== '/' && currentPath.startsWith(path)) return true;
    return false;
  };

  // Classes dinâmicas
  const sidebarClass = isSidebarOpen ? 'sidebar-open' : 'sidebar-closed';
  const headerClass = isSidebarOpen ? 'header-expanded' : 'header-collapsed';
  const contentClass = isSidebarOpen ? 'content-expanded' : 'content-collapsed';

  return (
    <div className="dashboard-container">
      
      {/* --- SIDEBAR (Apenas Navegação) --- */}
      <aside className={`sidebar ${sidebarClass}`}>
        
        {/* Botão de Controle da Sidebar */}
        <div className="sidebar-toggle-area">
            <button 
                className="toggle-btn"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                title={isSidebarOpen ? "Minimizar Menu" : "Expandir Menu"}
            >
                {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
        </div>

        {/* Navegação */}
        <nav className="sidebar-nav">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`} onClick={handleNavClick}>
            <Home size={20} /> 
            <span className="link-text">Dashboard</span>
          </Link>

          <Link to="/areas" className={`nav-link ${isActive('/areas') ? 'active' : ''}`} onClick={handleNavClick}>
            <MapPin size={20} /> 
            <span className="link-text">Áreas</span>
          </Link>

          <Link to="/plantas" className={`nav-link ${isActive('/plantas') ? 'active' : ''}`} onClick={handleNavClick}>
            <Sprout size={20} /> 
            <span className="link-text">Plantas</span>
          </Link>

          <Link to="/cultivos" className={`nav-link ${isActive('/cultivos') ? 'active' : ''}`} onClick={handleNavClick}>
            <Wheat size={20} /> 
            <span className="link-text">Cultivos</span>
          </Link>

          <Link to="/tarefas" className={`nav-link ${isActive('/tarefas') ? 'active' : ''}`} onClick={handleNavClick}>
            <CheckSquare size={20} /> 
            <span className="link-text">Tarefas</span>
          </Link>

          <Link to="/relatorios" className={`nav-link ${isActive('/relatorios') ? 'active' : ''}`} onClick={handleNavClick}>
            <BarChart3 size={20} /> 
            <span className="link-text">Relatórios</span>
          </Link>
          
          <div style={{ margin: '10px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}></div>
          
          <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`} onClick={handleNavClick}>
            <Shield size={20} /> 
            <span className="link-text">Administração</span>
          </Link>
        </nav>
        {/* Logout removido daqui e movido para o Header */}
      </aside>


      {/* --- HEADER (Verde, Logo Centralizada) --- */}
      <header className={`top-header ${headerClass}`}>
          
          {/* Lado Esquerdo (Vazio ou pode ter Breadcrumbs futuramente) */}
          <div style={{ width: '100px' }}></div> 

          {/* Centro: LOGO */}
          <div className="header-center">
            <Sprout size={32} color="#4ade80" className="logo-icon" />
            <h1 className="logo-text">Cultiva+</h1>
          </div>

          {/* Lado Direito: Ícones e Perfil */}
          <div className="header-right">
              
              {/* Dropdown de Notificações */}
              <div className="dropdown-container">
                  <button 
                    className={`icon-btn ${showNotifications ? 'active' : ''}`} 
                    onClick={toggleNotifications}
                  >
                      <Bell size={20} />
                      <span className="notification-dot"></span>
                  </button>

                  {showNotifications && (
                      <div className="dropdown-menu">
                          <div className="dropdown-header">Notificações</div>
                          {/* LISTA MOCK (Dados fictícios pois não há backend) */}
                          <div className="notification-list">
                              <div className="notification-item">
                                  <span className="notif-title">Colheita do Milho iniciada</span>
                                  <span className="notif-time">Há 30 minutos</span>
                              </div>
                              <div className="notification-item">
                                  <span className="notif-title">Alerta de Chuva: Setor A2</span>
                                  <span className="notif-time">Há 2 horas</span>
                              </div>
                              <div className="notification-item">
                                  <span className="notif-title">Relatório Mensal disponível</span>
                                  <span className="notif-time">Há 1 dia</span>
                              </div>
                          </div>
                          <div className="dropdown-item" style={{justifyContent: 'center', fontSize: '0.8rem', color: '#64748b'}}>
                              Ver todas
                          </div>
                      </div>
                  )}
              </div>

              <div className="header-divider"></div>

              {/* Dropdown de Usuário */}
              <div className="dropdown-container">
                  <div className="user-profile" onClick={toggleUserMenu}>
                      <div className="user-info">
                          <span className="user-name">Usuário Admin</span>
                          <span className="user-role">Fazenda Principal</span>
                      </div>
                      <div className="user-avatar">
                          <User size={20} />
                      </div>
                  </div>

                  {showUserMenu && (
                      <div className="dropdown-menu user-menu">
                          <div className="dropdown-header">Minha Conta</div>
                          
                          <Link to="/perfil" className="dropdown-item">
                              <User size={16} /> Perfil
                          </Link>
                          <Link to="/configuracoes" className="dropdown-item">
                              <Settings size={16} /> Configurações
                          </Link>
                          <Link to="/ajuda" className="dropdown-item">
                              <HelpCircle size={16} /> Ajuda
                          </Link>
                          
                          <div style={{ borderTop: '1px solid #f1f5f9', margin: '4px 0' }}></div>
                          
                          <button onClick={onLogout} className="dropdown-item danger">
                              <LogOut size={16} /> Sair
                          </button>
                      </div>
                  )}
              </div>
          </div>
      </header>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <main className={`main-content ${contentClass}`}>
          {children}
      </main>

    </div>
  );
};