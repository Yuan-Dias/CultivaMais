import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService, notificationService } from '../services/api';
import {
    Home, MapPin, Sprout, Wheat, BarChart3,
    CheckSquare, Shield, LogOut, Bell, User,
    ChevronLeft, ChevronRight, Trash2, Mail
} from 'lucide-react';

export const DashboardLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Refs para fechar menus ao clicar fora
    const notificationRef = useRef(null);
    const userMenuRef = useRef(null);

    // Estados de UI e Menus
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    // Estados de Dados das Notificações
    const [notificacoes, setNotificacoes] = useState([]);
    const [totalNaoLidas, setTotalNaoLidas] = useState(0);

    // Estado para o Modal de Confirmação de Exclusão
    const [confirmExclusao, setConfirmExclusao] = useState({ show: false, id: null });

    const usuario = authService.obterUsuarioLogado();

    // Lógica para fechar menus ao clicar fora do elemento
    useEffect(() => {
        const handleClickFora = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickFora);
        return () => document.removeEventListener("mousedown", handleClickFora);
    }, []);

    // --- CORREÇÃO DO LOOP INFINITO ---
    // Alterado de [usuario] para os IDs específicos para evitar renderizações desnecessárias
    useEffect(() => {
        const id = usuario?.idUsuario || usuario?.id;
        if (id) {
            buscarNotificacoes();
        }
    }, [usuario?.idUsuario, usuario?.id]);

    const buscarNotificacoes = async () => {
        try {
            const lista = await notificationService.listar();
            if (Array.isArray(lista)) {
                const ordenadas = lista.sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));
                setNotificacoes(ordenadas);
                setTotalNaoLidas(ordenadas.filter(n => !n.lida).length);
            }
        } catch (error) {
            console.error("Erro ao buscar notificações:", error);
        }
    };

    // --- FUNÇÕES DE AÇÃO ---

    const handleToggleLida = async (e, notif) => {
        e.stopPropagation();
        try {
            await notificationService.marcarComoLida(notif.id);
            buscarNotificacoes();
        } catch (error) {
            console.error("Erro ao atualizar status:", error);
        }
    };

    const handleMarcarTodasLidas = async () => {
        try {
            await notificationService.marcarTodasComoLidas();
            buscarNotificacoes();
        } catch (error) {
            console.error("Erro ao marcar todas como lidas:", error);
        }
    };

    const abrirModalExcluir = (e, id) => {
        e.stopPropagation();
        setConfirmExclusao({ show: true, id });
    };

    const executarExclusao = async () => {
        try {
            await notificationService.excluir(confirmExclusao.id);
            setConfirmExclusao({ show: false, id: null });
            buscarNotificacoes();
        } catch (error) {
            console.error("Erro ao excluir:", error);
        }
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const isActive = (path) => {
        const currentPath = location.pathname;
        return path === '/' ? currentPath === '/' : currentPath.startsWith(path);
    };

    const formatarData = (dataString) => {
        if (!dataString) return '';
        const data = new Date(dataString);
        return data.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute:'2-digit' });
    };

    const sidebarClass = isSidebarOpen ? 'sidebar-open' : 'sidebar-closed';
    const headerClass = isSidebarOpen ? 'header-expanded' : 'header-collapsed';
    const contentClass = isSidebarOpen ? 'content-expanded' : 'content-collapsed';

    return (
        <div className="dashboard-container">

            {/* --- MODAL DE CONFIRMAÇÃO PERSONALIZADO --- */}
            {confirmExclusao.show && (
                <div className="modal-modern-overlay">
                    <div className="modal-modern-content" style={{ maxWidth: '380px', textAlign: 'center' }}>
                        <div style={{ color: '#ef4444', marginBottom: '16px' }}>
                            <Trash2 size={48} style={{ margin: '0 auto' }} />
                        </div>
                        <h3 className="modal-title">Remover Notificação?</h3>
                        <p className="modal-desc">Você tem certeza que deseja excluir esta mensagem permanentemente?</p>
                        <div className="modal-footer" style={{ border: 'none', padding: 0, gap: '12px' }}>
                            <button className="btn-outline" style={{ flex: 1 }} onClick={() => setConfirmExclusao({ show: false, id: null })}>
                                Cancelar
                            </button>
                            <button className="botao-ver" style={{ flex: 1, background: '#ef4444' }} onClick={executarExclusao}>
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- SIDEBAR --- */}
            <aside className={`sidebar ${sidebarClass}`}>
                <div className="sidebar-toggle-area">
                    <button className="toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                    </button>
                </div>

                <nav className="sidebar-nav">
                    <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}><Home size={20} /><span className="link-text">Dashboard</span></Link>
                    <Link to="/areas" className={`nav-link ${isActive('/areas') ? 'active' : ''}`}><MapPin size={20} /><span className="link-text">Áreas</span></Link>
                    <Link to="/plantas" className={`nav-link ${isActive('/plantas') ? 'active' : ''}`}><Sprout size={20} /><span className="link-text">Plantas</span></Link>
                    <Link to="/cultivos" className={`nav-link ${isActive('/cultivos') ? 'active' : ''}`}><Wheat size={20} /><span className="text">Cultivos</span></Link>
                    <Link to="/tarefas" className={`nav-link ${isActive('/tarefas') ? 'active' : ''}`}><CheckSquare size={20} /><span className="link-text">Tarefas</span></Link>
                    <Link to="/relatorios" className={`nav-link ${isActive('/relatorios') ? 'active' : ''}`}><BarChart3 size={20} /><span className="link-text">Relatórios</span></Link>
                    <div style={{ margin: '10px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}></div>
                    {usuario?.funcao === 'ADMINISTRADOR' && (
                        <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}><Shield size={20} /><span className="link-text">Administração</span></Link>
                    )}
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

                    {/* DROPDOWN DE NOTIFICAÇÕES */}
                    <div className="dropdown-container" ref={notificationRef}>
                        <button
                            className={`icon-btn ${showNotifications ? 'active' : ''}`}
                            onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
                        >
                            <Bell size={20} />
                            {totalNaoLidas > 0 && (
                                <span className="notification-badge-count">
                                    {totalNaoLidas > 9 ? '9+' : totalNaoLidas}
                                </span>
                            )}
                        </button>

                        {showNotifications && (
                            <div className="notifications-dropdown">
                                <div className="dropdown-header">
                                    <h3>Notificações</h3>
                                    {totalNaoLidas > 0 && (
                                        <button className="btn-mark-all" onClick={handleMarcarTodasLidas}>
                                            Ler todas
                                        </button>
                                    )}
                                </div>

                                <div className="notifications-list">
                                    {notificacoes.length === 0 ? (
                                        <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                                            <Mail size={32} style={{ opacity: 0.2, marginBottom: '10px' }} />
                                            <p style={{ fontSize: '0.85rem' }}>Nenhum aviso por enquanto.</p>
                                        </div>
                                    ) : (
                                        notificacoes.map((notif) => (
                                            <div
                                                key={notif.id}
                                                className={`notification-item ${!notif.lida ? 'unread' : ''}`}
                                                onClick={(e) => handleToggleLida(e, notif)}
                                            >
                                                <div className="notif-content" style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <h4>{notif.titulo}</h4>
                                                        <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{formatarData(notif.dataHora)}</span>
                                                    </div>
                                                    <p>{notif.mensagem}</p>
                                                </div>
                                                <div className="notif-actions-hover" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    <button
                                                        onClick={(e) => abrirModalExcluir(e, notif.id)}
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="header-divider"></div>

                    {/* MENU DO USUÁRIO */}
                    <div className="dropdown-container" ref={userMenuRef}>
                        <div className="user-profile" onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}>
                            <div className="user-info">
                                <span className="user-name">{usuario?.nomeUsuario || 'Usuário'}</span>
                                <span className="user-role">{usuario?.funcao || 'Membro'}</span>
                            </div>
                            <div className="user-avatar"><User size={20} /></div>
                        </div>
                        {showUserMenu && (
                            <div className="dropdown-menu user-menu" style={{ top: '55px', right: 0 }}>
                                <div className="dropdown-header">Minha Conta</div>
                                <Link to="/perfil" className="dropdown-item"><User size={16} /> Perfil</Link>
                                <button onClick={handleLogout} className="dropdown-item danger"><LogOut size={16} /> Sair</button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className={`main-content ${contentClass}`}>
                {children}
            </main>
        </div>
    );
};