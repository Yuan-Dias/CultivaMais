import { useState, useEffect } from 'react';
import '../App.css';
import {
    Plus, Calendar, Trash2, ListTodo, User,
    CheckCircle2, AlertTriangle, Edit2, Ban, StickyNote, ClipboardList
} from 'lucide-react';

const Tarefas = () => {
    // --- 1. ESTADOS ---

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

    // Estados para o Modal de Observação
    const [modalObsAberto, setModalObsAberto] = useState(false);
    const [obsTexto, setObsTexto] = useState('');
    const [tarefaParaConcluir, setTarefaParaConcluir] = useState(null);

    const [modoEdicao, setModoEdicao] = useState(false);
    const [idTarefaEditando, setIdTarefaEditando] = useState(null);

    // ALTERAÇÃO: dataPrazo agora guardará apenas YYYY-MM-DD
    const [novaTarefa, setNovaTarefa] = useState({
        titulo: '', descricao: '', prioridade: 'MEDIA', categoria: '', dataPrazo: '', idResponsavel: ''
    });

    // --- 2. CARREGAMENTO ---

    useEffect(() => {
        if (usuarioLogado && usuarioLogado.idUsuario) {
            carregarDados();
        }
    }, [usuarioLogado]);

    const carregarDados = () => {
        if (!usuarioLogado || !usuarioLogado.idUsuario) return;

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

        fetch('http://localhost:8090/api/usuarios')
            .then(r => r.json())
            .then(data => {
                if(Array.isArray(data)) setUsuarios(data);
            })
            .catch(console.error);
    };

    if (!usuarioLogado) {
        setTimeout(() => window.location.href = '/', 1000);
        return <div style={{padding:20, color: 'red'}}>Acesso Negado. Redirecionando...</div>;
    }

    // --- 3. AÇÕES (CRUD) ---

    const executarRequisicaoConclusao = (tarefa, observacao) => {
        fetch(`http://localhost:8090/api/tarefas/${tarefa.id}/concluir?idUsuarioLogado=${usuarioLogado.idUsuario}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ observacao: observacao })
        }).then(res => {
            if (res.ok) {
                carregarDados();
                setModalObsAberto(false);
                setTarefaParaConcluir(null);
                setObsTexto('');
            }
        });
    };

    const handleCheckConclusao = (tarefa) => {
        if (tarefa.concluida) {
            executarRequisicaoConclusao(tarefa, "");
        } else {
            setTarefaParaConcluir(tarefa);
            setObsTexto('');
            setModalObsAberto(true);
        }
    };

    const confirmarConclusaoModal = (e) => {
        e.preventDefault();
        if (tarefaParaConcluir) {
            executarRequisicaoConclusao(tarefaParaConcluir, obsTexto);
        }
    };

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

        // --- CORREÇÃO AQUI ---
        // Se tiver data, adiciona o horário final do dia (T23:59:59)
        // Isso satisfaz o LocalDateTime do Java sem mudar o visual do Frontend
        let dataFormatadaParaBackend = novaTarefa.dataPrazo;
        if (dataFormatadaParaBackend && !dataFormatadaParaBackend.includes('T')) {
            dataFormatadaParaBackend = dataFormatadaParaBackend + 'T23:59:59';
        }

        const corpo = {
            titulo: novaTarefa.titulo,
            descricao: novaTarefa.descricao,
            prioridade: novaTarefa.prioridade,
            categoria: novaTarefa.categoria,
            dataPrazo: dataFormatadaParaBackend, // Envia a data com hora mágica
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
                if (res.ok) {
                    carregarDados();
                    setModalAberto(false);
                } else {
                    // Mostra o erro real que veio do Java se não for 500 genérico
                    const erro = await res.text();
                    console.error("Erro API:", erro);
                    alert("Erro ao salvar: Verifique se todos os campos estão preenchidos.");
                }
            })
            .catch(err => console.error("Erro de rede:", err));
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

        // ALTERAÇÃO: Pega apenas a parte da data (YYYY-MM-DD) para o input type="date"
        let dataFormatada = '';
        if (tarefa.dataPrazo) {
            dataFormatada = tarefa.dataPrazo.split('T')[0];
        }

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

    // --- LÓGICA DE DATA E RENDERIZAÇÃO ---
    const tarefasPendentes = tarefas.filter(t => !t.concluida && !t.cancelada);
    const tarefasConcluidas = tarefas.filter(t => t.concluida && !t.cancelada);
    const tarefasCanceladas = tarefas.filter(t => t.cancelada);

    const getPriorityClass = (prio) => {
        if (prio === 'ALTA') return 'prio-alta';
        if (prio === 'MEDIA') return 'prio-media';
        return 'prio-baixa';
    };

    // ALTERAÇÃO: isAtrasada agora ignora horas. Compara apenas datas.
    const isAtrasada = (t) => {
        if (t.cancelada || t.concluida || !t.dataPrazo) return false;

        // Data de Hoje (YYYY-MM-DD)
        const hoje = new Date().toISOString().split('T')[0];
        // Data do Prazo (YYYY-MM-DD)
        const prazo = t.dataPrazo.split('T')[0];

        // Se Prazo for menor que Hoje (Ex: 20 < 21), está atrasada.
        // Se for Igual (21 == 21), NÃO está atrasada.
        return prazo < hoje;
    };

    const renderTarefa = (tarefa, tipo) => {
        const souCriador = tarefa.criador && tarefa.criador.idUsuario === usuarioLogado.idUsuario;
        const souAdmin = usuarioLogado.funcao.includes('ADMIN') || usuarioLogado.funcao.includes('EMPRESA');
        const temPermissaoTotal = souCriador || souAdmin;
        const atrasada = isAtrasada(tarefa);

        const estiloCard = tarefa.cancelada
            ? { opacity: 0.6, background: '#f8fafc', borderLeft: '4px solid #94a3b8' }
            : { borderLeft: atrasada ? '4px solid #ef4444' : '4px solid transparent' };

        return (
            <div key={tarefa.id} className={`task-item ${tipo === 'concluida' ? 'completed' : ''}`} style={estiloCard}>

                {!tarefa.cancelada && (
                    <input type="checkbox" className="custom-checkbox"
                           checked={tarefa.concluida}
                           onChange={() => handleCheckConclusao(tarefa)}
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

                    {tarefa.observacaoConclusao && (
                        <div style={{marginTop:'4px', fontSize:'13px', color:'#059669', display:'flex', alignItems:'center', gap:'4px'}}>
                            <StickyNote size={12}/> <strong>Obs:</strong> {tarefa.observacaoConclusao}
                        </div>
                    )}

                    <div className="task-meta" style={{ flexWrap: 'wrap', gap: '12px', marginTop: '8px' }}>

                        {/* ALTERAÇÃO: Exibe apenas a data (sem hora) */}
                        <span className="meta-tag">
                            <Calendar size={14}/>
                            {tarefa.dataPrazo
                                ? new Date(tarefa.dataPrazo).toLocaleDateString('pt-BR')
                                : 'S/P'}
                        </span>

                        <span className="meta-tag" title="Responsável (Executante)">
                            <User size={14}/>
                            Resp: <strong>{tarefa.responsavel ? tarefa.responsavel.nomeUsuario : 'N/A'}</strong>
                        </span>

                        <span className="meta-tag" title="Criador da Tarefa" style={{borderLeft:'1px solid #e2e8f0', paddingLeft:'8px', color:'#64748b'}}>
                            <span style={{fontSize:'10px', textTransform:'uppercase', marginRight:'3px'}}>Criado por:</span>
                            {tarefa.criador ? tarefa.criador.nomeUsuario : 'Sistema'}
                        </span>
                    </div>
                </div>

                <div style={{display:'flex', gap:'5px'}}>
                    {!tarefa.cancelada && !tarefa.concluida && temPermissaoTotal && (
                        <button onClick={() => prepararEdicao(tarefa)} className="btn-icon-sm" title="Editar">
                            <Edit2 size={18} />
                        </button>
                    )}
                    {!tarefa.cancelada && !tarefa.concluida && temPermissaoTotal && (
                        <button onClick={() => cancelarTarefa(tarefa.id)} className="btn-icon-sm warning" title="Cancelar Tarefa">
                            <Ban size={18} color="#f59e0b" />
                        </button>
                    )}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1e293b' }}>Minhas Tarefas</h1>
                <button className="btn-primary" onClick={abrirModalCriacao}><Plus size={20} /> Nova Tarefa</button>
            </div>

            <div className="task-list-container">
                {tarefasPendentes.length === 0 ? (
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

            {tarefasConcluidas.length > 0 && (
                <>
                    <div className="completed-section-title"><CheckCircle2 size={16} /> Concluídas Recentemente</div>
                    <div className="task-list-container">
                        {tarefasConcluidas.map(t => renderTarefa(t, 'concluida'))}
                    </div>
                </>
            )}

            {tarefasCanceladas.length > 0 && (
                <>
                    <div className="completed-section-title" style={{color:'#94a3b8'}}><Ban size={16} /> Canceladas</div>
                    <div className="task-list-container">
                        {tarefasCanceladas.map(t => renderTarefa(t, 'cancelada'))}
                    </div>
                </>
            )}

            {/* MODAL CRIAR/EDITAR */}
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

                                {/* ALTERAÇÃO: Input type="date" (sem hora) */}
                                <div className="form-group">
                                    <label>Prazo (Data)</label>
                                    <input type="date" className="form-input" value={novaTarefa.dataPrazo} onChange={e => setNovaTarefa({...novaTarefa, dataPrazo: e.target.value})} required />
                                </div>

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

            {/* MODAL OBSERVAÇÃO */}
            {modalObsAberto && (
                <div className="modal-modern-overlay">
                    <div className="modal-modern-content" style={{maxWidth: '400px'}}>
                        <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px'}}>
                            <CheckCircle2 color="#16a34a" size={28} />
                            <h2 style={{margin:0, fontSize:'1.25rem'}}>Concluir Tarefa</h2>
                        </div>
                        <p style={{color:'#64748b', marginBottom:'12px', fontSize:'0.9rem'}}>
                            Ótimo trabalho! Deseja adicionar alguma observação final?
                        </p>
                        <form onSubmit={confirmarConclusaoModal}>
                            <div className="form-group">
                                <label>Observação (Opcional)</label>
                                <textarea className="form-input" rows="3" placeholder="Ex: Material utilizado, dificuldades..." value={obsTexto} onChange={e => setObsTexto(e.target.value)} />
                            </div>
                            <div className="modal-footer">
                                <button type="button" onClick={() => setModalObsAberto(false)} className="btn-outline">Cancelar</button>
                                <button type="submit" className="btn-primary" style={{background:'#16a34a', borderColor:'#16a34a'}}>Confirmar Conclusão</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Tarefas;