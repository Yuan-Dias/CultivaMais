import React, { useState, useEffect } from 'react';
import { userService, authService } from '../services/api';
// Supondo que você tenha um logService ou adicione o método em userService.
// Se não tiver, o código abaixo trata isso.
import '../App.css';
import {
    UserPlus, Trash2, Search, Edit, Ban, CheckCircle,
    Save, X, ShieldAlert, FileText, LogOut, Key, List, Clock
} from 'lucide-react';

const Administracao = () => {
    // --- ESTADOS ---
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [termoBusca, setTermoBusca] = useState('');

    // Estado da Modal de Usuário
    const [modalAberta, setModalAberta] = useState(false);
    const [usuarioEmEdicao, setUsuarioEmEdicao] = useState(null);
    const [formData, setFormData] = useState({ nome: '', email: '', tipo: 'TECNICO_AGRICOLA' });

    // Estado da Modal de Código
    const [modalCodigo, setModalCodigo] = useState(false);
    const [codigoGerado, setCodigoGerado] = useState('');
    const [usuarioNomeCodigo, setUsuarioNomeCodigo] = useState('');

    // --- NOVO: Estado dos Logs ---
    const [logs, setLogs] = useState([]);
    const [modalLogsOpen, setModalLogsOpen] = useState(false);
    const [loadingLogs, setLoadingLogs] = useState(false);

    // --- 1. BUSCAR DADOS (USUÁRIOS) ---
    const fetchUsuarios = async () => {
        setLoading(true);
        try {
            const dados = await userService.listar();
            const dadosFormatados = dados.map(u => ({
                ...u,
                id: u.idUsuario || u.id,
                nome: u.nomeUsuario || u.nome,
                tipo: u.funcao || u.tipo
            }));
            setUsuarios(dadosFormatados);
        } catch (error) {
            console.error("Erro ao buscar usuários:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- NOVO: BUSCAR LOGS DO BANCO ---
    const fetchLogs = async () => {
        setLoadingLogs(true);
        try {
            // Tenta buscar logs da API.
            // NOTA: Você precisa criar essa rota no backend (ver instruções no final da resposta).
            // Se a rota não existir, isso vai cair no catch.
            let dadosLogs = [];

            if (userService.listarLogs) {
                dadosLogs = await userService.listarLogs();
            } else {
                // FALLBACK TEMPORÁRIO (Simulação para você ver o layout funcionando)
                // Remova isso quando tiver o backend pronto.
                console.warn("Rota de logs não encontrada no userService. Usando dados fictícios.");
                dadosLogs = [
                    { id: 1, data: new Date().toISOString(), usuario: 'Admin', acao: 'Acessou o sistema' },
                    { id: 2, data: new Date(Date.now() - 3600000).toISOString(), usuario: 'Carlos (Téc)', acao: 'Concluiu tarefa #102' },
                    { id: 3, data: new Date(Date.now() - 7200000).toISOString(), usuario: 'Maria (Gerente)', acao: 'Alterou status de produção' },
                ];
            }

            setLogs(dadosLogs);
            setModalLogsOpen(true);
        } catch (error) {
            console.error("Erro ao buscar logs:", error);
            alert("Não foi possível carregar o histórico. Verifique se a tabela 'logs' existe no banco.");
        } finally {
            setLoadingLogs(false);
        }
    };

    useEffect(() => {
        fetchUsuarios();
    }, []);

    // ... (Funções de Salvar, ToggleStatus, Delete mantidas iguais) ...
    // --- 2. SALVAR (CREATE / UPDATE) ---
    const handleSalvar = async () => {
        if (!formData.nome || !formData.email) return alert("Preencha todos os campos.");
        try {
            if (usuarioEmEdicao) {
                await userService.atualizar(usuarioEmEdicao.id, formData);
            } else {
                await userService.criar(formData);
            }
            await fetchUsuarios();
            fecharModal();
        } catch (error) {
            alert("Erro ao salvar: " + error.message);
        }
    };

    const toggleStatus = async (user) => {
        const usuarioLogado = authService.obterUsuarioLogado();
        const meuId = usuarioLogado?.idUsuario || usuarioLogado?.id;
        if (meuId && user.id === meuId) {
            alert("Operação negada: Você não pode bloquear seu próprio usuário.");
            return;
        }
        try {
            await userService.atualizar(user.id, { ativo: !user.ativo });
            fetchUsuarios();
        } catch (error) {
            alert("Erro ao alterar status do usuário.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Tem certeza que deseja remover este usuário do banco de dados?')) return;
        try {
            await userService.excluir(id);
            fetchUsuarios();
        } catch (error) {
            alert("Erro ao excluir usuário.");
        }
    };

    const handleGerarCodigoSenha = async (user) => {
        try {
            const resposta = await userService.gerarCodigo(user.email);
            let codigoFinal = '';
            if (typeof resposta === 'object' && resposta.codigo) {
                codigoFinal = resposta.codigo;
            } else if (typeof resposta === 'string') {
                codigoFinal = resposta;
            }
            if (!codigoFinal) throw new Error("Código vazio recebido.");
            setCodigoGerado(codigoFinal);
            setUsuarioNomeCodigo(user.nome);
            setModalCodigo(true);
        } catch (error) {
            console.error(error);
            alert("Erro ao gerar código. Verifique o console.");
        }
    };

    const handleLogoutGeral = () => {
        if(window.confirm("Isso irá desconectar TODOS os usuários do sistema imediatamente. Continuar?")) {
            alert("Comando enviado: Todos os tokens de sessão serão invalidados.");
        }
    };

    // --- HELPERS VISUAIS ---
    const abrirModalCriacao = () => {
        setUsuarioEmEdicao(null);
        setFormData({ nome: '', email: '', tipo: 'TECNICO_AGRICOLA' });
        setModalAberta(true);
    };

    const abrirModalEdicao = (user) => {
        setUsuarioEmEdicao(user);
        setFormData({ nome: user.nome, email: user.email, tipo: user.tipo });
        setModalAberta(true);
    };

    const fecharModal = () => {
        setModalAberta(false);
        setUsuarioEmEdicao(null);
    };

    const getIniciais = (nome) => nome ? nome.substring(0, 2).toUpperCase() : '??';

    const formatDate = (isoString) => {
        if (!isoString) return '-';
        return new Date(isoString).toLocaleString('pt-BR');
    };

    const usuariosFiltrados = usuarios.filter(u =>
        (u.nome && u.nome.toLowerCase().includes(termoBusca.toLowerCase())) ||
        (u.email && u.email.toLowerCase().includes(termoBusca.toLowerCase()))
    );

    return (
        <div className="main-content animate-fade-in" style={{ paddingTop: '10px' }}>

            {/* HEADER */}
            <div className="stat-header" style={{ marginBottom: '32px' }}>
                <div>
                    <h2 className="dashboard-title">Administração</h2>
                    <p className="dashboard-subtitle">Gestão de acessos e segurança.</p>
                </div>
                <button className="botao-ver" style={{ width: 'auto', display: 'flex', gap: '8px' }} onClick={abrirModalCriacao}>
                    <UserPlus size={18} /> Novo Usuário
                </button>
            </div>

            {/* FILTRO */}
            <div className="filter-card">
                <div className="filter-title"><Search size={18} className="text-muted" style={{ marginRight: '8px' }} /> Filtrar Equipe</div>
                <input
                    type="text" placeholder="Buscar por nome ou e-mail..." className="form-input"
                    value={termoBusca} onChange={(e) => setTermoBusca(e.target.value)}
                />
            </div>

            {/* LISTA DE USUÁRIOS */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>Carregando dados...</div>
            ) : (
                <div className="users-grid">
                    {usuariosFiltrados.map((user) => (
                        <div key={user.id} className="user-card" style={{ opacity: user.ativo ? 1 : 0.6 }}>
                            <button className="btn-delete-user" onClick={() => handleDelete(user.id)} title="Excluir Usuário">
                                <Trash2 size={18} />
                            </button>

                            <div className={`user-avatar-lg ${user.tipo === 'ADMINISTRADOR' ? 'avatar-admin' : 'avatar-tecnico'}`}>
                                {getIniciais(user.nome)}
                            </div>

                            <div className="user-info-content" style={{ width: '100%' }}>
                                <h3>{user.nome}</h3>
                                <span className="user-email">{user.email}</span>

                                <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                                    <span className={`role-badge ${user.tipo === 'ADMINISTRADOR' ? 'role-admin' : 'role-tecnico'}`}>
                                        {user.tipo ? user.tipo.replace('_', ' ') : 'USER'}
                                    </span>
                                    {!user.ativo && <span className="role-badge" style={{ background: '#f1f5f9', color: '#94a3b8', border: '1px solid #e2e8f0' }}>BLOQUEADO</span>}
                                </div>

                                {/* AÇÕES */}
                                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '8px' }}>
                                    <button className="btn-outline" style={{ padding: '6px', border: 'none' }} title="Editar" onClick={() => abrirModalEdicao(user)}>
                                        <Edit size={18} color="#64748b" />
                                    </button>
                                    <button className="btn-outline" style={{ padding: '6px', border: 'none' }} title="Gerar Código de Senha" onClick={() => handleGerarCodigoSenha(user)}>
                                        <Key size={18} color="#eab308" />
                                    </button>
                                    <button className="btn-outline" style={{ padding: '6px', border: 'none' }} title={user.ativo ? "Bloquear" : "Desbloquear"} onClick={() => toggleStatus(user)}>
                                        {user.ativo ? <Ban size={18} color="#ef4444" /> : <CheckCircle size={18} color="#16a34a" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ÁREA DE SEGURANÇA E LOGS */}
            <h3 className="titulo" style={{ textAlign: 'left', marginTop: '40px' }}>Operações de Segurança</h3>
            <div className="grid-areas" style={{ marginBottom: '40px' }}>
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ padding: '10px', background: '#fee2e2', borderRadius: '8px', color: '#dc2626' }}>
                            <ShieldAlert size={24} />
                        </div>
                        <div>
                            <h4 style={{ margin: 0, color: '#0f172a' }}>Controle de Sessão</h4>
                            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Ações de emergência</span>
                        </div>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#334155' }}>
                        <p>Utilize esta função em caso de suspeita de acesso não autorizado.</p>
                        <button className="btn-outline" style={{ width: '100%', marginTop: '10px', borderColor: '#fca5a5', color: '#dc2626' }} onClick={handleLogoutGeral}>
                            <LogOut size={16} style={{marginRight: '8px'}}/> Forçar Logout Geral
                        </button>
                    </div>
                </div>

                {/* CARD DE LOGS MODIFICADO */}
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ padding: '10px', background: '#f1f5f9', borderRadius: '8px', color: '#475569' }}>
                            <FileText size={24} />
                        </div>
                        <div>
                            <h4 style={{ margin: 0, color: '#0f172a' }}>Auditoria & Logs</h4>
                            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Rastreabilidade de ações</span>
                        </div>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                        <p style={{marginBottom: '16px'}}>Veja quem fez o quê e quando. Histórico completo de alterações.</p>
                        <button className="btn-outline" style={{ width: '100%' }} onClick={fetchLogs}>
                            <List size={16} style={{marginRight: '8px'}}/> Ver Histórico Completo
                        </button>
                    </div>
                </div>
            </div>

            {/* MODAL EDITAR/CRIAR (Mantida igual) */}
            {modalAberta && (
                <div className="modal-modern-overlay">
                    <div className="modal-modern-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h2 className="modal-title">{usuarioEmEdicao ? 'Editar Usuário' : 'Novo Usuário'}</h2>
                            <button onClick={fecharModal} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={24} color="#64748b" /></button>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Nome Completo</label>
                            <input className="form-input" value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">E-mail</label>
                            <input className="form-input" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Função</label>
                            <select className="form-select" value={formData.tipo} onChange={(e) => setFormData({...formData, tipo: e.target.value})}>
                                <option value="ADMINISTRADOR">Administrador</option>
                                <option value="GERENTE_PRODUCAO">Gerente Produção</option>
                                <option value="ENGENHEIRO_AGRONOMO">Eng. Agrônomo</option>
                                <option value="TECNICO_AGRICOLA">Téc. Agrícola</option>
                                <option value="OPERADOR_MAQUINAS">Operador de Máquinas</option>
                            </select>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-outline" onClick={fecharModal}>Cancelar</button>
                            <button className="botao-ver" style={{ width: 'auto' }} onClick={handleSalvar}><Save size={18} style={{marginRight:'8px'}}/> Salvar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE CÓDIGO (Mantida igual) */}
            {modalCodigo && (
                <div className="modal-modern-overlay">
                    <div className="modal-modern-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
                        <div style={{ margin: '0 auto 16px', width: '50px', height: '50px', background: '#fef08a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Key size={24} color="#854d0e" />
                        </div>
                        <h2 className="modal-title">Código Gerado</h2>
                        <p className="modal-desc">Informe este código ao usuário <strong>{usuarioNomeCodigo}</strong>.</p>
                        <div style={{ margin: '24px 0', padding: '16px', background: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: '8px', fontSize: '2rem', fontWeight: 'bold', letterSpacing: '4px', color: '#0f172a' }}>
                            {codigoGerado}
                        </div>
                        <button className="botao-ver" onClick={() => setModalCodigo(false)}>Fechar</button>
                    </div>
                </div>
            )}

            {/* --- NOVA MODAL: LOGS DO SISTEMA --- */}
            {modalLogsOpen && (
                <div className="modal-modern-overlay">
                    <div className="modal-modern-content" style={{ maxWidth: '800px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <div style={{display:'flex', alignItems:'center', gap: '10px'}}>
                                <Clock size={24} color="#0f172a" />
                                <div>
                                    <h2 className="modal-title">Logs de Auditoria</h2>
                                    <p className="modal-desc" style={{margin:0}}>Registro cronológico de atividades.</p>
                                </div>
                            </div>
                            <button onClick={() => setModalLogsOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={24} color="#64748b" /></button>
                        </div>

                        <div className="log-table-container">
                            <table className="log-table">
                                <thead>
                                <tr>
                                    <th>Data / Hora</th>
                                    <th>Usuário</th>
                                    <th>Ação</th>
                                </tr>
                                </thead>
                                <tbody>
                                {logs.length > 0 ? logs.map((log) => (
                                    <tr key={log.id}>
                                        <td style={{ whiteSpace: 'nowrap', color: '#64748b' }}>{formatDate(log.data)}</td>
                                        <td style={{ fontWeight: '600' }}>{log.usuario}</td>
                                        <td>{log.acao}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="3" style={{textAlign:'center', padding: '20px'}}>Nenhum log encontrado.</td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>

                        <div className="modal-footer" style={{marginTop: '20px'}}>
                            <button className="btn-outline" onClick={() => setModalLogsOpen(false)}>Fechar</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Administracao;