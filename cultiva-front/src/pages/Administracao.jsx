import React, { useState, useEffect, useMemo, useRef } from 'react';
import { userService, authService } from '../services/api';
import '../App.css';
import {
    UserPlus, Trash2, Search, Edit, Ban, CheckCircle,
    X, ShieldAlert, FileText, Key,
    Users, Activity, Lock, ChevronDown, ChevronUp, Calendar
} from 'lucide-react';

const TIPOS_USUARIO = {
    ADMINISTRADOR: "Administrador",
    GERENTE_PRODUCAO: "Gerente de Produção",
    ENGENHEIRO_AGRONOMO: "Engenheiro Agrônomo",
    TECNICO_AGRICOLA: "Técnico Agrícola",
    OPERADOR_MAQUINAS: "Operador de Máquinas"
};

const Administracao = () => {
    const searchInputRef = useRef(null);

    // --- ESTADOS ---
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [termoBusca, setTermoBusca] = useState('');

    const [modalAberta, setModalAberta] = useState(false);
    const [usuarioEmEdicao, setUsuarioEmEdicao] = useState(null);
    const [formData, setFormData] = useState({ nome: '', email: '', tipo: 'TECNICO_AGRICOLA' });

    const [modalCodigo, setModalCodigo] = useState(false);
    const [codigoGerado, setCodigoGerado] = useState('');
    const [usuarioNomeCodigo, setUsuarioNomeCodigo] = useState('');

    const [logs, setLogs] = useState([]);
    const [modalLogsOpen, setModalLogsOpen] = useState(false);
    const [loadingLogs, setLoadingLogs] = useState(false);

    // Filtros
    const [filtroLogUsuario, setFiltroLogUsuario] = useState('');
    const [filtroLogAcao, setFiltroLogAcao] = useState('');
    const [filtroDataInicio, setFiltroDataInicio] = useState('');
    const [filtroDataFim, setFiltroDataFim] = useState('');
    const [datasExpandidas, setDatasExpandidas] = useState({});

    // --- BUSCAR USUÁRIOS ---
    const fetchUsuarios = async () => {
        setLoading(true);
        try {
            const dados = await userService.listar();
            const dadosFormatados = dados.map(u => ({
                ...u,
                id: u.idUsuario || u.id,
                nome: u.nomeUsuario || u.nome,
                tipo: u.funcao || u.tipo || 'TECNICO_AGRICOLA'
            }));
            setUsuarios(dadosFormatados);
        } catch (error) {
            console.error("Erro ao buscar usuários:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- BUSCAR LOGS (COM LIMPEZA REFINADA) ---
    const fetchLogs = async () => {
        setLoadingLogs(true);
        try {
            let dadosLogs = [];
            if (userService.listarLogs) {
                const rawLogs = await userService.listarLogs();
                dadosLogs = rawLogs.map(log => ({
                    id: log.id || Math.random(),
                    dataHora: log.dataHora || log.data || new Date().toISOString(),
                    usuarioIdentificador: log.usuario || log.nomeUsuario || log.username,
                    acao: log.acao || log.descricao || 'Ação registrada'
                }));
            } else {
                // Mock para testes
                dadosLogs = [
                    { id: 1, dataHora: new Date().toISOString(), usuarioIdentificador: 'Sistema', acao: 'Gerou código para: yuan@operador' },
                    { id: 2, dataHora: new Date().toISOString(), usuarioIdentificador: '3', acao: 'Solicitou código de recuperação' }
                ];
            }

            // Ordenar: Mais recente primeiro
            dadosLogs.sort((a, b) => {
                const dataA = new Date(Array.isArray(a.dataHora) ? new Date(...a.dataHora) : a.dataHora);
                const dataB = new Date(Array.isArray(b.dataHora) ? new Date(...b.dataHora) : b.dataHora);
                return dataB - dataA;
            });

            // --- FILTRO DE LIMPEZA ---
            const logsLimpos = dadosLogs.filter((log, index, self) => {
                const acaoLower = log.acao.toLowerCase();
                const usuarioLower = String(log.usuarioIdentificador).toLowerCase();

                // 1. REMOVER AÇÕES TÉCNICAS DO SISTEMA (MAS MANTER BLOQUEIOS/STATUS)
                if (usuarioLower === 'sistema' || usuarioLower === 'system') {
                    // Se a ação for especificamente sobre status, permitimos passar
                    if (acaoLower.includes('bloqueou') || acaoLower.includes('desbloqueou') || acaoLower.includes('status')) {
                        return true;
                    }

                    const acoesTecnicasIgnorar = [
                        'processou',
                        'gerou código',
                        'gerou codigo',
                        'envio de email',
                        'tarefa agendada'
                    ];

                    // Se for apenas "Atualizou" genérico sem contexto de usuário alvo, pode ser ruído,
                    // mas se tiver ID ou Nome, é melhor manter para auditoria.
                    if (acoesTecnicasIgnorar.some(termo => acaoLower.includes(termo))) {
                        return false;
                    }
                }

                // 2. REMOVER DUPLICATAS DE LOGIN
                if (index > 0) {
                    const logAnterior = self[index - 1];
                    if (log.usuarioIdentificador === logAnterior.usuarioIdentificador &&
                        acaoLower.includes('login') && logAnterior.acao.toLowerCase().includes('login')) {
                        return false;
                    }
                }

                return true;
            });

            setLogs(logsLimpos);

            // Expandir data de hoje
            if (logsLimpos.length > 0) {
                const hoje = formatarDataSimples(logsLimpos[0].dataHora);
                setDatasExpandidas({ [hoje]: true });
            }

            setModalLogsOpen(true);
        } catch (error) {
            console.error("Erro ao buscar logs:", error);
            alert("Não foi possível carregar o histórico.");
        } finally {
            setLoadingLogs(false);
        }
    };

    useEffect(() => {
        fetchUsuarios();
    }, []);

    // --- FORMATADORES ---
    const formatarDataSimples = (dataInput) => {
        if (!dataInput) return "Data Desconhecida";
        try {
            let dataObj;
            if (Array.isArray(dataInput)) {
                dataObj = new Date(dataInput[0], dataInput[1] - 1, dataInput[2]);
            } else {
                dataObj = new Date(dataInput);
            }
            return dataObj.toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch (e) { return "Data Inválida"; }
    };

    const formatarHora = (dataInput) => {
        try {
            let dataObj;
            if (Array.isArray(dataInput)) {
                dataObj = new Date(dataInput[0], dataInput[1]-1, dataInput[2], dataInput[3]||0, dataInput[4]||0);
            } else {
                dataObj = new Date(dataInput);
            }
            return dataObj.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });
        } catch (e) { return "--:--"; }
    };

    const resolverNomeAtor = (identificador) => {
        if (!identificador) return "Usuário";
        const identStr = String(identificador).toLowerCase();

        if (identStr === 'admin') return 'Administrador';

        const usuarioEncontrado = usuarios.find(u =>
            String(u.id) === identStr ||
            (u.email && u.email.toLowerCase() === identStr) ||
            (u.nome && u.nome.toLowerCase() === identStr)
        );

        return usuarioEncontrado ? usuarioEncontrado.nome : identificador;
    };

    const formatarMensagemLog = (acao) => {
        // Remove "usuário" duplicado e substitui ID por nome
        const regexId = /(?:usuário\s+)?(?:ID:|id)\s*(\d+)/i;
        const match = acao.match(regexId);
        let acaoFormatada = acao;

        if (match && usuarios.length > 0) {
            const idAlvo = parseInt(match[1]);
            const usuarioAlvo = usuarios.find(u => u.id === idAlvo);
            if (usuarioAlvo) {
                // Se a mensagem original for genérica "Atualizou usuário ID:...", podemos tentar inferir
                // mas é mais seguro apenas colocar o nome.
                acaoFormatada = acao.replace(match[0], `"${usuarioAlvo.nome}"`);
            }
        }

        acaoFormatada = acaoFormatada.replace(/usuário\s+o\s+usuário/gi, 'o usuário');
        return acaoFormatada;
    };

    // --- AGRUPAMENTO ---
    const logsAgrupados = useMemo(() => {
        return logs.filter(log => {
            let dataLog;
            if (Array.isArray(log.dataHora)) {
                dataLog = new Date(log.dataHora[0], log.dataHora[1]-1, log.dataHora[2]);
            } else {
                dataLog = new Date(log.dataHora);
            }
            dataLog.setHours(0,0,0,0);

            if (filtroDataInicio) {
                const dInicio = new Date(filtroDataInicio);
                dInicio.setHours(0,0,0,0);
                dInicio.setDate(dInicio.getDate() + 1); // Ajuste de fuso
                if (dataLog < new Date(filtroDataInicio)) return false;
            }
            if (filtroDataFim) {
                const dFim = new Date(filtroDataFim);
                if (dataLog > dFim) return false;
            }

            const atorNome = resolverNomeAtor(log.usuarioIdentificador);
            const matchUser = String(atorNome).toLowerCase().includes(filtroLogUsuario.toLowerCase());

            const acaoFormatada = formatarMensagemLog(log.acao);
            const matchAcao = acaoFormatada.toLowerCase().includes(filtroLogAcao.toLowerCase());

            return matchUser && matchAcao;
        }).reduce((grupos, log) => {
            const dataStr = formatarDataSimples(log.dataHora);
            if (!grupos[dataStr]) grupos[dataStr] = [];
            grupos[dataStr].push(log);
            return grupos;
        }, {});
    }, [logs, filtroLogUsuario, filtroLogAcao, filtroDataInicio, filtroDataFim, usuarios]);

    const toggleData = (dataStr) => {
        setDatasExpandidas(prev => ({ ...prev, [dataStr]: !prev[dataStr] }));
    };

    // --- UI HELPERS ---
    const focarBuscaUsuario = () => searchInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }) || searchInputRef.current?.focus();
    const abrirModalCriacao = () => { setUsuarioEmEdicao(null); setFormData({ nome: '', email: '', tipo: 'TECNICO_AGRICOLA' }); setModalAberta(true); };
    const abrirModalEdicao = (user) => { setUsuarioEmEdicao(user); setFormData({ nome: user.nome, email: user.email, tipo: user.tipo }); setModalAberta(true); };
    const fecharModal = () => { setModalAberta(false); setUsuarioEmEdicao(null); };
    const getIniciais = (nome) => nome ? nome.substring(0, 2).toUpperCase() : '??';

    // --- AÇÕES DO SISTEMA ---
    const handleSalvar = async () => {
        if (!formData.nome || !formData.email) return alert("Preencha todos os campos.");
        try {
            // Aqui mantemos 'atualizar' normal, pois é uma edição de dados cadastrais
            usuarioEmEdicao ? await userService.atualizar(usuarioEmEdicao.id, formData) : await userService.criar(formData);
            await fetchUsuarios();
            fecharModal();
        } catch (error) { alert("Erro ao salvar: " + error.message); }
    };

    // CORREÇÃO: Função toggleStatus aprimorada
    const toggleStatus = async (user) => {
        const usuarioLogado = authService.obterUsuarioLogado();
        if ((usuarioLogado?.idUsuario || usuarioLogado?.id) === user.id) return alert("Você não pode bloquear a si mesmo.");

        const novoStatus = !user.ativo;
        const acaoTexto = novoStatus ? 'Desbloquear' : 'Bloquear';

        try {
            // Enviamos parâmetros extras para tentar forçar o log correto no backend.
            // Se o backend suportar 'acao' ou 'contexto', ele registrará corretamente.
            await userService.atualizar(user.id, {
                ativo: novoStatus,
                // Flag de metadados para o backend diferenciar 'Edição' de 'Bloqueio'
                contexto: 'alteracao_status',
                acaoLog: acaoTexto
            });

            fetchUsuarios();
        } catch (error) {
            alert(`Erro ao ${acaoTexto.toLowerCase()} usuário.`);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Remover usuário permanentemente?')) return;
        try { await userService.excluir(id); fetchUsuarios(); } catch (error) { alert("Erro ao excluir usuário."); }
    };

    const handleGerarCodigoSenha = async (user) => {
        try {
            const resposta = await userService.gerarCodigo(user.email);
            setCodigoGerado(typeof resposta === 'object' ? resposta.codigo : resposta);
            setUsuarioNomeCodigo(user.nome);
            setModalCodigo(true);
        } catch (error) { alert("Erro ao gerar código."); }
    };

    const handleLogoutGeral = () => { if(window.confirm("Desconectar TODOS os usuários?")) alert("Comando enviado."); };

    const usuariosFiltrados = usuarios.filter(u =>
        (u.nome && u.nome.toLowerCase().includes(termoBusca.toLowerCase())) ||
        (u.email && u.email.toLowerCase().includes(termoBusca.toLowerCase()))
    );

    return (
        <div className="main-content animate-fade-in" style={{ paddingTop: '10px' }}>
            <div className="stat-header" style={{ marginBottom: '32px' }}>
                <div><h2 className="dashboard-title">Administração</h2><p className="dashboard-subtitle">Gestão de acessos e segurança.</p></div>
                <button className="botao-ver" style={{ width: 'auto', display: 'flex', gap: '8px' }} onClick={abrirModalCriacao}><UserPlus size={18} /> Novo Usuário</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <div onClick={focarBuscaUsuario} className="hover:shadow-lg hover:scale-[1.02]" style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', borderLeft: '4px solid #3b82f6', cursor: 'pointer', transition: 'transform 0.2s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div><h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#334155', margin: 0 }}>Gerenciar Usuários</h3><p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>Buscar e editar equipe.</p></div>
                        <div style={{ background: '#dbeafe', padding: '10px', borderRadius: '50%', color: '#2563eb' }}><Users size={24} /></div>
                    </div>
                </div>
                <div onClick={fetchLogs} className="hover:shadow-lg hover:scale-[1.02]" style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', borderLeft: '4px solid #22c55e', cursor: 'pointer', transition: 'transform 0.2s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div><h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#334155', margin: 0 }}>Histórico de Logs</h3><p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>Auditoria de ações.</p></div>
                        <div style={{ background: '#dcfce7', padding: '10px', borderRadius: '50%', color: '#16a34a' }}><Activity size={24} /></div>
                    </div>
                </div>
                <div onClick={handleLogoutGeral} className="hover:shadow-lg hover:scale-[1.02]" style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', borderLeft: '4px solid #f97316', cursor: 'pointer', transition: 'transform 0.2s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div><h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#334155', margin: 0 }}>Segurança Global</h3><p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>Controle de sessão.</p></div>
                        <div style={{ background: '#ffedd5', padding: '10px', borderRadius: '50%', color: '#ea580c' }}><Lock size={24} /></div>
                    </div>
                </div>
            </div>

            <div className="filter-card">
                <div className="filter-title"><Search size={18} className="text-muted" style={{ marginRight: '8px' }} /> Filtrar Equipe</div>
                <input ref={searchInputRef} type="text" placeholder="Buscar por nome ou e-mail..." className="form-input" value={termoBusca} onChange={(e) => setTermoBusca(e.target.value)} />
            </div>

            {loading ? <div style={{ textAlign: 'center', padding: '40px' }}>Carregando...</div> : (
                <div className="users-grid">
                    {usuariosFiltrados.map((user) => (
                        <div key={user.id} className="user-card" style={{ opacity: user.ativo ? 1 : 0.6 }}>
                            <button className="btn-delete-user" onClick={() => handleDelete(user.id)} title="Excluir"><Trash2 size={18} /></button>
                            <div className={`user-avatar-lg ${user.tipo === 'ADMINISTRADOR' ? 'avatar-admin' : 'avatar-tecnico'}`}>{getIniciais(user.nome)}</div>
                            <div className="user-info-content" style={{ width: '100%' }}>
                                <h3>{user.nome}</h3>
                                <span className="user-email">{user.email}</span>
                                <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                                    <span className={`role-badge ${user.tipo === 'ADMINISTRADOR' ? 'role-admin' : 'role-tecnico'}`}>{TIPOS_USUARIO[user.tipo] || user.tipo}</span>
                                    {!user.ativo && <span className="role-badge" style={{ background: '#f1f5f9', color: '#94a3b8', border: '1px solid #e2e8f0' }}>BLOQUEADO</span>}
                                </div>
                                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '8px' }}>
                                    <button className="btn-outline" style={{ padding: '6px' }} onClick={() => abrirModalEdicao(user)} title="Editar"><Edit size={18} color="#64748b" /></button>
                                    <button className="btn-outline" style={{ padding: '6px' }} onClick={() => handleGerarCodigoSenha(user)} title="Gerar Código"><Key size={18} color="#eab308" /></button>
                                    <button className="btn-outline" style={{ padding: '6px' }} onClick={() => toggleStatus(user)} title={user.ativo ? "Bloquear" : "Desbloquear"}>{user.ativo ? <Ban size={18} color="#ef4444" /> : <CheckCircle size={18} color="#16a34a" />}</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {modalAberta && (
                <div className="modal-modern-overlay">
                    <div className="modal-modern-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h2 className="modal-title">{usuarioEmEdicao ? 'Editar Usuário' : 'Novo Usuário'}</h2>
                            <button onClick={fecharModal} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={24} color="#64748b" /></button>
                        </div>
                        <div className="form-group"><label className="form-label">Nome</label><input className="form-input" value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} /></div>
                        <div className="form-group"><label className="form-label">E-mail</label><input className="form-input" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} /></div>
                        <div className="form-group">
                            <label className="form-label">Função</label>
                            <select className="form-select" value={formData.tipo} onChange={(e) => setFormData({...formData, tipo: e.target.value})}>
                                {Object.entries(TIPOS_USUARIO).map(([key, label]) => (<option key={key} value={key}>{label}</option>))}
                            </select>
                        </div>
                        <div className="modal-footer"><button className="btn-outline" onClick={fecharModal}>Cancelar</button><button className="botao-ver" onClick={handleSalvar}>Salvar</button></div>
                    </div>
                </div>
            )}

            {modalCodigo && (
                <div className="modal-modern-overlay">
                    <div className="modal-modern-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
                        <h2 className="modal-title">Código para {usuarioNomeCodigo}</h2>
                        <div style={{ margin: '20px 0', fontSize: '2rem', fontWeight: 'bold', letterSpacing: '4px', color: '#166534' }}>{codigoGerado}</div>
                        <button className="botao-ver" onClick={() => setModalCodigo(false)}>Fechar</button>
                    </div>
                </div>
            )}

            {modalLogsOpen && (
                <div className="modal-modern-overlay">
                    <div className="modal-modern-content" style={{ maxWidth: '900px', width: '95%', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexShrink: 0 }}>
                            <div style={{display:'flex', alignItems:'center', gap: '10px'}}><FileText size={24} color="#0f172a" /><div><h2 className="modal-title">Logs de Atividades</h2><p className="modal-desc" style={{margin:0}}>Auditoria e rastreabilidade.</p></div></div>
                            <button onClick={() => setModalLogsOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={24} color="#64748b" /></button>
                        </div>

                        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #e2e8f0', flexShrink: 0 }}>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
                                <div style={{flex: 1, minWidth: '180px'}}>
                                    <label style={{fontSize: '0.75rem', color:'#64748b', fontWeight:'700', textTransform: 'uppercase'}}>Quem (Ator)</label>
                                    <div style={{position:'relative', display: 'flex', alignItems:'center'}}><Search size={16} style={{position:'absolute', left: 10, color:'#94a3b8'}} /><input type="text" className="form-input" style={{paddingLeft: '32px', marginTop: '4px'}} placeholder="Nome..." value={filtroLogUsuario} onChange={(e) => setFiltroLogUsuario(e.target.value)} /></div>
                                </div>
                                <div style={{flex: 1.5, minWidth: '200px'}}>
                                    <label style={{fontSize: '0.75rem', color:'#64748b', fontWeight:'700', textTransform: 'uppercase'}}>O que (Ação/Alvo)</label>
                                    <div style={{position:'relative', display: 'flex', alignItems:'center'}}><Activity size={16} style={{position:'absolute', left: 10, color:'#94a3b8'}} /><input type="text" className="form-input" style={{paddingLeft: '32px', marginTop: '4px'}} placeholder="Ex: Bloqueou, Login, ID..." value={filtroLogAcao} onChange={(e) => setFiltroLogAcao(e.target.value)} /></div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                                <div style={{flex: 1}}><label style={{fontSize: '0.75rem', color:'#64748b', fontWeight:'700', textTransform: 'uppercase'}}>De</label><div style={{position:'relative'}}><Calendar size={16} style={{position:'absolute', left: 10, top: '50%', transform: 'translateY(-30%)', color:'#94a3b8'}} /><input type="date" className="form-input" style={{paddingLeft: '32px', marginTop: '4px'}} value={filtroDataInicio} onChange={(e) => setFiltroDataInicio(e.target.value)} /></div></div>
                                <div style={{flex: 1}}><label style={{fontSize: '0.75rem', color:'#64748b', fontWeight:'700', textTransform: 'uppercase'}}>Até</label><div style={{position:'relative'}}><Calendar size={16} style={{position:'absolute', left: 10, top: '50%', transform: 'translateY(-30%)', color:'#94a3b8'}} /><input type="date" className="form-input" style={{paddingLeft: '32px', marginTop: '4px'}} value={filtroDataFim} onChange={(e) => setFiltroDataFim(e.target.value)} /></div></div>
                            </div>
                        </div>

                        <div className="log-list-container" style={{ overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
                            {Object.keys(logsAgrupados).length === 0 ? (
                                <div style={{textAlign:'center', padding: '40px', color: '#94a3b8'}}><ShieldAlert size={40} style={{opacity: 0.2, marginBottom: 10}}/><p>Nenhum registro encontrado.</p></div>
                            ) : (
                                Object.keys(logsAgrupados).map((data) => (
                                    <div key={data} style={{ marginBottom: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                                        <button onClick={() => toggleData(data)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f1f5f9', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                                            <span style={{ fontWeight: '600', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>📅 {data} <span style={{ fontSize: '0.75rem', fontWeight: 'normal', background: 'white', padding: '2px 8px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>{logsAgrupados[data].length}</span></span>
                                            {datasExpandidas[data] ? <ChevronUp size={18} color="#64748b"/> : <ChevronDown size={18} color="#64748b"/>}
                                        </button>
                                        {datasExpandidas[data] && (
                                            <div style={{ background: 'white' }}>
                                                {logsAgrupados[data].map((log) => {
                                                    const atorNome = resolverNomeAtor(log.usuarioIdentificador);
                                                    return (
                                                        <div key={log.id} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
                                                            <div style={{ width: '60px', fontSize: '0.8rem', fontFamily: 'monospace', color: '#64748b' }}>{formatarHora(log.dataHora)}</div>
                                                            <div style={{ width: '160px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: atorNome === 'Usuário' ? '#f1f5f9' : '#dcfce7', color: atorNome === 'Usuário' ? '#94a3b8' : '#166534', fontSize: '0.7rem', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>{atorNome.substring(0,2).toUpperCase()}</div>
                                                                <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={atorNome}>{atorNome}</span>
                                                            </div>
                                                            <div style={{ flex: 1, fontSize: '0.9rem', color: '#475569', paddingLeft: '12px', borderLeft: '1px solid #f1f5f9' }}>{formatarMensagemLog(log.acao, atorNome)}</div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="modal-footer" style={{marginTop: '16px', flexShrink: 0}}><button className="botao-ver" onClick={() => setModalLogsOpen(false)}>Fechar</button></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Administracao;