import { useState, useEffect } from 'react';
import '../App.css';
import {
    Plus, Calendar, Trash2, ListTodo, User,
    CheckCircle2, AlertTriangle, Edit2, Ban, StickyNote, ClipboardList
} from 'lucide-react';

const Tarefas = () => {
    // --- 1. ESTADOS ---

    // Inicializa lendo do localStorage para garantir rapidez
    const [usuarioLogado] = useState(() => {
        try {
            const dados = localStorage.getItem('usuarioLogado');
            return dados ? JSON.parse(dados) : null;
        } catch (e) {
            console.error(e);
            return null;
        }
    });

    const [tarefas, setTarefas] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [modalAberto, setModalAberto] = useState(false);

    // Controle de Edição
    const [modoEdicao, setModoEdicao] = useState(false);
    const [idTarefaEditando, setIdTarefaEditando] = useState(null);

    const [novaTarefa, setNovaTarefa] = useState({
        titulo: '', descricao: '', prioridade: 'MEDIA', categoria: '', dataPrazo: '', idResponsavel: ''
    });

    // --- 2. CARREGAMENTO SEGURO ---

    useEffect(() => {
        // Só chama o carregamento se o usuário existir
        if (usuarioLogado && usuarioLogado.idUsuario) {
            carregarDados();
        }
    }, [usuarioLogado]); // Dependência: recarrega se o usuário mudar

    const carregarDados = () => {
        // BLINDAGEM: Se não tiver ID, para tudo (Evita erro 400)
        if (!usuarioLogado || !usuarioLogado.idUsuario) {
            console.warn("Tentativa de carregar dados sem usuário logado.");
            return;
        }

        const url = `http://localhost:8090/api/tarefas?idUsuario=${usuarioLogado.idUsuario}&funcao=${usuarioLogado.funcao}`;

        fetch(url)
            .then(res => {
                if(!res.ok) throw new Error("Erro na resposta da API");
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) setTarefas(data);
                else setTarefas([]);
            })
            .catch(err => {
                console.error("Erro ao buscar tarefas:", err);
                setTarefas([]);
            });

        // Carrega lista de usuários para o Select
        fetch('http://localhost:8090/api/usuarios')
            .then(r => r.json())
            .then(data => {
                if(Array.isArray(data)) setUsuarios(data);
            })
            .catch(console.error);
    };

    // --- SE NÃO TIVER USUÁRIO, MOSTRA MSG E REDIRECIONA ---
    if (!usuarioLogado) {
        setTimeout(() => window.location.href = '/', 1000);
        return <div style={{padding:20, color: 'red'}}>Acesso Negado. Redirecionando...</div>;
    }

    // --- 3. AÇÕES (CRUD) ---

    // CONCLUIR COM OBSERVAÇÃO
    const toggleConclusao = (tarefa) => {
        let obs = "";

        if (!tarefa.concluida) {
            obs = window.prompt("Deseja adicionar uma observação sobre a conclusão? (Ex: Quantidade usada, problemas...)");
            if (obs === null) return;
        }

        fetch(`http://localhost:8090/api/tarefas/${tarefa.id}/concluir?idUsuarioLogado=${usuarioLogado.idUsuario}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ observacao: obs })
        }).then(res => { if (res.ok) carregarDados(); });
    };

    // CANCELAR TAREFA
    const cancelarTarefa = (id) => {
        if (window.confirm('Deseja CANCELAR esta tarefa? Ela ficará inativa no sistema.')) {
            fetch(`http://localhost:8090/api/tarefas/${id}/cancelar?idUsuarioLogado=${usuarioLogado.idUsuario}`, {
                method: 'PUT'
            }).then(res => {
                if(res.ok) carregarDados();
                else alert("Apenas o Criador ou Admin pode cancelar.");
            });
        }
    };

    const excluirTarefa = (id) => {
        if (window.confirm('Excluir definitivamente?')) {
            fetch(`http://localhost:8090/api/tarefas/${id}?idUsuarioLogado=${usuarioLogado.idUsuario}`, { method: 'DELETE' })
                .then(res => {
                    if(res.ok) carregarDados();
                    else alert("Permissão negada.");
                });
        }
    };

    const salvarTarefa = (e) => {
        e.preventDefault();
        const responsavelFinal = novaTarefa.idResponsavel || usuarioLogado.idUsuario;
        let url, method;

        const corpo = {
            titulo: novaTarefa.titulo,
            descricao: novaTarefa.descricao,
            prioridade: novaTarefa.prioridade,
            categoria: novaTarefa.categoria,
            dataPrazo: novaTarefa.dataPrazo,
            responsavel: { idUsuario: responsavelFinal }
        };

        if (modoEdicao) {
            url = `http://localhost:8090/api/tarefas/${idTarefaEditando}?idUsuarioLogado=${usuarioLogado.idUsuario}`;
            method = 'PUT';
        } else {
            url = `http://localhost:8090/api/tarefas?idResponsavel=${responsavelFinal}&idCriador=${usuarioLogado.idUsuario}`;
            method = 'POST';
        }

        fetch(url, { method: method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) })
            .then(async res => {
                if (res.ok) { carregarDados(); setModalAberto(false); }
                else { const erro = await res.text(); alert("Erro: " + erro); }
            });
    };

    // --- UTILS DE PREPARAÇÃO ---
    const abrirModalCriacao = () => {
        setModoEdicao(false);
        setNovaTarefa({ titulo: '', descricao: '', prioridade: 'MEDIA', categoria: '', dataPrazo: '', idResponsavel: usuarioLogado.idUsuario });
        setModalAberto(true);
    };

    const prepararEdicao = (tarefa) => {
        setModoEdicao(true);
        setIdTarefaEditando(tarefa.id);
        let dataFormatada = tarefa.dataPrazo ? tarefa.dataPrazo.substring(0, 16) : '';
        setNovaTarefa({
            titulo: tarefa.titulo,
            descricao: tarefa.descricao,
            prioridade: tarefa.prioridade,
            categoria: tarefa.categoria,
            dataPrazo: dataFormatada,
            idResponsavel: tarefa.responsavel ? tarefa.responsavel.idUsuario : usuarioLogado.idUsuario
        });
        setModalAberto(true);
    };

    // --- RENDERIZAÇÃO ---
    // Filtros
    const tarefasPendentes = tarefas.filter(t => !t.concluida && !t.cancelada);
    const tarefasConcluidas = tarefas.filter(t => t.concluida && !t.cancelada);
    const tarefasCanceladas = tarefas.filter(t => t.cancelada);

    const getPriorityClass = (prio) => {
        if (prio === 'ALTA') return 'prio-alta';
        if (prio === 'MEDIA') return 'prio-media';
        return 'prio-baixa';
    };

    const isAtrasada = (t) => !t.cancelada && !t.concluida && t.dataPrazo && new Date() > new Date(t.dataPrazo);

    const renderTarefa = (tarefa, tipo) => {
        const souCriador = tarefa.criador && tarefa.criador.idUsuario === usuarioLogado.idUsuario;
        const souAdmin = usuarioLogado.funcao.includes('ADMIN') || usuarioLogado.funcao.includes('EMPRESA');

        // Permissão Suprema: Criador ou Admin pode fazer tudo (Editar, Excluir, Cancelar)
        const temPermissaoTotal = souCriador || souAdmin;

        const atrasada = isAtrasada(tarefa);

        // Estilo especial se for cancelada (cinza e riscada)
        const estiloCard = tarefa.cancelada
            ? { opacity: 0.6, background: '#f8fafc', borderLeft: '4px solid #94a3b8' }
            : { borderLeft: atrasada ? '4px solid #ef4444' : '4px solid transparent' };

        return (
            <div key={tarefa.id} className={`task-item ${tipo === 'concluida' ? 'completed' : ''}`} style={estiloCard}>

                {/* Checkbox só funciona se não for cancelada */}
                {!tarefa.cancelada && (
                    <input type="checkbox" className="custom-checkbox"
                           checked={tarefa.concluida}
                           onChange={() => toggleConclusao(tarefa)}
                    />
                )}

                <div className="task-content">
                    <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
                        <h4 className="task-title" style={{textDecoration: tarefa.cancelada ? 'line-through' : 'none', color: '#1e293b'}}>
                            {tarefa.titulo}
                        </h4>

                        {!tarefa.cancelada && <span className={`priority-badge ${getPriorityClass(tarefa.prioridade)}`}>{tarefa.prioridade}</span>}
                        {atrasada && <span style={{color:'#dc2626', fontSize:'12px', display:'flex', alignItems:'center'}}><AlertTriangle size={12}/> Atrasada</span>}
                        {tarefa.cancelada && <span style={{background:'#e2e8f0', padding:'2px 6px', borderRadius:'4px', fontSize:'11px', fontWeight:'bold', color:'#64748b'}}>CANCELADA</span>}
                    </div>

                    <p className="task-desc">{tarefa.descricao}</p>

                    {/* Exibe Observação se tiver */}
                    {tarefa.observacaoConclusao && (
                        <div style={{marginTop:'4px', fontSize:'13px', color:'#059669', display:'flex', alignItems:'center', gap:'4px'}}>
                            <StickyNote size={12}/> <strong>Obs:</strong> {tarefa.observacaoConclusao}
                        </div>
                    )}

                    <div className="task-meta">
                        <span className="meta-tag"><Calendar size={14}/> {tarefa.dataPrazo ? new Date(tarefa.dataPrazo).toLocaleString() : 'S/P'}</span>
                        <span className="meta-tag"><User size={14}/> {tarefa.responsavel ? tarefa.responsavel.nomeUsuario : 'Eu'}</span>
                    </div>
                </div>

                <div style={{display:'flex', gap:'5px'}}>

                    {/* Botão EDITAR: Só se ativo e tiver permissão */}
                    {!tarefa.cancelada && !tarefa.concluida && temPermissaoTotal && (
                        <button onClick={() => prepararEdicao(tarefa)} className="btn-icon-sm" title="Editar">
                            <Edit2 size={18} />
                        </button>
                    )}

                    {/* Botão CANCELAR: Só se ativo e tiver permissão */}
                    {!tarefa.cancelada && !tarefa.concluida && temPermissaoTotal && (
                        <button onClick={() => cancelarTarefa(tarefa.id)} className="btn-icon-sm warning" title="Cancelar Tarefa">
                            <Ban size={18} color="#f59e0b" />
                        </button>
                    )}

                    {/* Botão EXCLUIR: Permissão Total */}
                    {temPermissaoTotal && (
                        <button onClick={() => excluirTarefa(tarefa.id)} className="btn-icon-sm danger" title="Excluir Definitivamente">
                            <Trash2 size={18} />
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="animate-fade-in" style={{ padding: '0 10px' }}>
            {/* Header Limpo - Sem nome do usuário */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1e293b' }}>Minhas Tarefas</h1>
                <button className="btn-primary" onClick={abrirModalCriacao}><Plus size={20} /> Nova Tarefa</button>
            </div>

            {/* LISTA PENDENTES */}
            <div className="task-list-container">
                {tarefasPendentes.length === 0 ? (
                    // --- ÁREA "NENHUMA PENDÊNCIA" DESIGN NOVO ---
                    <div style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        padding: '40px 20px', background: '#f8fafc', borderRadius: '12px', border: '2px dashed #e2e8f0'
                    }}>
                        <ClipboardList size={48} color="#cbd5e1" strokeWidth={1.5} style={{marginBottom:'16px'}} />
                        <h3 style={{color:'#64748b', fontSize:'1.1rem', marginBottom:'4px'}}>Tudo limpo por aqui!</h3>
                        <p style={{color:'#94a3b8', fontSize:'0.9rem'}}>Nenhuma tarefa pendente no momento.</p>
                    </div>
                ) : (
                    tarefasPendentes.map(t => renderTarefa(t, 'pendente'))
                )}
            </div>

            {/* LISTA CONCLUÍDAS */}
            {tarefasConcluidas.length > 0 && (
                <>
                    <div className="completed-section-title"><CheckCircle2 size={16} /> Concluídas Recentemente</div>
                    <div className="task-list-container">
                        {tarefasConcluidas.map(t => renderTarefa(t, 'concluida'))}
                    </div>
                </>
            )}

            {/* LISTA CANCELADAS */}
            {tarefasCanceladas.length > 0 && (
                <>
                    <div className="completed-section-title" style={{color:'#94a3b8'}}><Ban size={16} /> Canceladas</div>
                    <div className="task-list-container">
                        {tarefasCanceladas.map(t => renderTarefa(t, 'cancelada'))}
                    </div>
                </>
            )}

            {modalAberto && (
                <div className="modal-modern-overlay">
                    <div className="modal-modern-content">
                        <h2>{modoEdicao ? 'Editar' : 'Nova'} Tarefa</h2>
                        <form onSubmit={salvarTarefa}>
                            <div className="form-group"><label>Título</label><input className="form-input" value={novaTarefa.titulo} onChange={e => setNovaTarefa({...novaTarefa, titulo: e.target.value})} required /></div>
                            <div className="form-group"><label>Descrição</label><textarea className="form-input" value={novaTarefa.descricao} onChange={e => setNovaTarefa({...novaTarefa, descricao: e.target.value})} /></div>
                            <div className="form-group"><label>Responsável</label>
                                <select className="form-select" value={novaTarefa.idResponsavel} onChange={e => setNovaTarefa({...novaTarefa, idResponsavel: e.target.value})}>
                                    <option value={usuarioLogado.idUsuario}>Eu mesmo</option>
                                    {usuarios.filter(u => u.idUsuario !== usuarioLogado.idUsuario).map(u => <option key={u.idUsuario} value={u.idUsuario}>{u.nomeUsuario}</option>)}
                                </select>
                            </div>
                            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
                                <div className="form-group"><label>Prazo</label><input type="datetime-local" className="form-input" value={novaTarefa.dataPrazo} onChange={e => setNovaTarefa({...novaTarefa, dataPrazo: e.target.value})} required /></div>
                                <div className="form-group"><label>Prioridade</label>
                                    <select className="form-select" value={novaTarefa.prioridade} onChange={e => setNovaTarefa({...novaTarefa, prioridade: e.target.value})}>
                                        <option value="MEDIA">Média</option><option value="ALTA">Alta</option><option value="BAIXA">Baixa</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group"><label>Categoria</label><input className="form-input" value={novaTarefa.categoria} onChange={e => setNovaTarefa({...novaTarefa, categoria: e.target.value})} /></div>
                            <div className="modal-footer">
                                <button type="button" onClick={() => setModalAberto(false)} className="btn-outline">Cancelar</button>
                                <button type="submit" className="btn-primary">Salvar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Tarefas;