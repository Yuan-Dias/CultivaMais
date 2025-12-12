import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Adicionado useNavigate
import { authService } from '../services/api'; // IMPORTANTE: Ajuste o caminho se necessário
import {
    Home, MapPin, Sprout, Wheat, BarChart3,
    CheckSquare, Shield, LogOut, Bell, User,
    ChevronLeft, ChevronRight, Settings, HelpCircle
} from 'lucide-react';

// Lembre-se de importar o CSS: import './App.css';

export const DashboardLayout = ({ children }) => {
    const navigate = useNavigate(); // Hook para redirecionar
    const location = useLocation();

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    // 1. RECUPERAR DADOS DO USUÁRIO
    const usuario = authService.obterUsuarioLogado();

    // 2. FUNÇÃO DE LOGOUT
    const handleLogout = () => {
        authService.logout(); // Limpa o localStorage
        navigate('/login');   // Manda para a tela de login
    };

    const handleNavClick = () => {
        // Fecha sidebar em mobile se necessário
    };

    const toggleUserMenu = () => {
        setShowUserMenu(!showUserMenu);
        setShowNotifications(false);
    };

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
        setShowUserMenu(false);
    };

    const isActive = (path) => {
        const currentPath = location.pathname;
        if (path === '/' && currentPath === '/') return true;
        if (path !== '/' && currentPath.startsWith(path)) return true;
        return false;
    };

    const sidebarClass = isSidebarOpen ? 'sidebar-open' : 'sidebar-closed';
    const headerClass = isSidebarOpen ? 'header-expanded' : 'header-collapsed';
    const contentClass = isSidebarOpen ? 'content-expanded' : 'content-collapsed';

    return (
        <div className="dashboard-container">

            {/* --- SIDEBAR --- */}
            <aside className={`sidebar ${sidebarClass}`}>
                <div className="sidebar-toggle-area">
                    <button
                        className="toggle-btn"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        title={isSidebarOpen ? "Minimizar Menu" : "Expandir Menu"}
                    >
                        {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                    </button>
                </div>

                <nav className="sidebar-nav">
                    <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`} onClick={handleNavClick}>
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
            </aside>


            {/* --- HEADER --- */}
            <header className={`top-header ${headerClass}`}>
                <div style={{ width: '100px' }}></div>

                <div className="header-center">
                    <Sprout size={32} color="#4ade80" className="logo-icon" />
                    <h1 className="logo-text">Cultiva+</h1>
                </div>

                <div className="header-right">
                    {/* Notificações (código mantido igual) */}
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
                                <div className="notification-list">
                                    <div className="notification-item">
                                        <span className="notif-title">Colheita do Milho iniciada</span>
                                        <span className="notif-time">Há 30 minutos</span>
                                    </div>
                                </div>
                                <div className="dropdown-item" style={{justifyContent: 'center', fontSize: '0.8rem', color: '#64748b'}}>
                                    Ver todas
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="header-divider"></div>

                    {/* --- DROPDOWN DE USUÁRIO (DINÂMICO AGORA) --- */}
                    <div className="dropdown-container">
                        <div className="user-profile" onClick={toggleUserMenu}>
                            <div className="user-info">
                                {/* Exibe o nome que veio do Login */}
                                <span className="user-name">
                              {usuario?.nomeUsuario || 'Visitante'}
                          </span>
                                {/* Exibe o cargo */}
                                <span className="user-role">
                              {usuario?.funcao || ''}
                          </span>
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

                                <div style={{ borderTop: '1px solid #f1f5f9', margin: '4px 0' }}></div>

                                {/* BOTÃO DE LOGOUT FUNCIONAL */}
                                <button onClick={handleLogout} className="dropdown-item danger">
                                    <LogOut size={16} /> Sair
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* CONTEÚDO */}
            <main className={`main-content ${contentClass}`}>
                {children}
            </main>

        </div>
    );
};