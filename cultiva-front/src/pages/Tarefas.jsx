import { useState, useEffect } from 'react';
import '../App.css';
import { 
    Plus, Calendar, Trash2, ListTodo, User, 
    CheckCircle2, Clock, AlertCircle, Tag 
} from 'lucide-react';

const Tarefas = () => {
  // Removi o 'tarefas' original para sumir o erro de variável não usada
  // Agora usamos apenas o filtradas para controlar a lista
  const [tarefasFiltradas, setTarefasFiltradas] = useState([]);
  
  const [usuarios, setUsuarios] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  
  // --- SIMULAÇÃO DE USUÁRIO LOGADO ---
  const USUARIO_ATUAL_MOCK = {
      id: 1, // ID do usuário logado
      funcao: 'ADMIN' // Mude para 'COMUM' para testar a filtragem
  };

  // Estado do Formulário
  const [novaTarefa, setNovaTarefa] = useState({
    titulo: '',
    descricao: '',
    prioridade: 'MEDIA',
    categoria: '',
    dataPrazo: '',
    idResponsavel: '' 
  });

  // --- 1. Definição da Lógica de Filtro (Movi para cima!) ---
  const filtrarTarefasPorUsuario = (todasTarefas) => {
      // Se for ADMIN, vê tudo.
      if (USUARIO_ATUAL_MOCK.funcao === 'ADMIN') {
          setTarefasFiltradas(todasTarefas);
      } else {
          // Se for COMUM, vê apenas as atribuídas a ele
          const minhas = todasTarefas.filter(t => 
              t.responsavel && t.responsavel.idUsuario === USUARIO_ATUAL_MOCK.id
          );
          setTarefasFiltradas(minhas);
      }
  };

  // --- 2. Carregar Dados (Agora chama a função que já existe acima) ---
  const carregarDados = () => {
    // Busca as tarefas
    fetch('http://localhost:8090/api/tarefas')
      .then(r => r.json())
      .then(data => {
          // Aqui chamamos o filtro passando os dados brutos da API
          filtrarTarefasPorUsuario(data);
      })
      .catch(err => console.error("Erro ao buscar tarefas:", err));

    // Busca os usuários
    fetch('http://localhost:8090/api/usuarios')
      .then(r => r.json())
      .then(setUsuarios)
      .catch(err => console.error("Erro ao buscar usuários:", err));
  };

  useEffect(() => {
    carregarDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- 3. Salvar Tarefa ---
  const salvarTarefa = (e) => {
    e.preventDefault();
    
    // Regra: Se não for admin, atribui a tarefa a si mesmo automaticamente
    const responsavelFinal = USUARIO_ATUAL_MOCK.funcao === 'ADMIN' 
        ? novaTarefa.idResponsavel 
        : USUARIO_ATUAL_MOCK.id;

    const url = `http://localhost:8090/api/tarefas?idResponsavel=${responsavelFinal}`;
    
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo: novaTarefa.titulo,
        descricao: novaTarefa.descricao,
        prioridade: novaTarefa.prioridade,
        categoria: novaTarefa.categoria,
        dataPrazo: novaTarefa.dataPrazo
      }) 
    }).then(res => {
      if (res.ok) {
        carregarDados();
        setModalAberto(false);
        setNovaTarefa({ titulo: '', descricao: '', prioridade: 'MEDIA', categoria: '', dataPrazo: '', idResponsavel: '' });
      } else {
        alert('Erro ao salvar tarefa.');
      }
    });
  };

  // --- 4. Alternar Conclusão ---
  const toggleConclusao = (id) => {
    fetch(`http://localhost:8090/api/tarefas/${id}/concluir`, { method: 'PUT' })
      .then(res => {
        if (res.ok) carregarDados();
      });
  };

  // --- 5. Excluir Tarefa ---
  const excluirTarefa = (id) => {
    if (confirm('Tem a certeza que deseja apagar esta tarefa?')) {
      fetch(`http://localhost:8090/api/tarefas/${id}`, { method: 'DELETE' })
        .then(res => { if(res.ok) carregarDados(); });
    }
  };

  // --- Separação Visual ---
  const tarefasPendentes = tarefasFiltradas.filter(t => !t.concluida);
  const tarefasConcluidas = tarefasFiltradas.filter(t => t.concluida);

  const statsPendentes = tarefasPendentes.length;
  const statsAltaPrio = tarefasPendentes.filter(t => t.prioridade === 'ALTA').length;

  const getPriorityClass = (prio) => {
      if (prio === 'ALTA') return 'prio-alta';
      if (prio === 'MEDIA') return 'prio-media';
      return 'prio-baixa';
  };

  return (
    <div className="animate-fade-in" style={{ padding: '0 10px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
           <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Tarefas e Alertas</h1>
           <p style={{ color: '#64748b', marginTop: '4px' }}>
               {USUARIO_ATUAL_MOCK.funcao === 'ADMIN' 
                   ? 'Visão geral de todas as atividades.' 
                   : 'Gerencie suas atividades diárias.'}
           </p>
        </div>
        <button className="btn-primary" onClick={() => setModalAberto(true)}>
            <Plus size={20} /> Nova Tarefa
        </button>
      </div>

      {/* Resumo (Stats) */}
      <div className="kpi-grid" style={{ marginBottom: '32px' }}>
        <div className="kpi-card">
            <div className="kpi-header">
                <span className="kpi-title">Pendentes</span>
                <div className="icon-box bg-orange-light"><Clock size={20} /></div>
            </div>
            <div className="kpi-value">{statsPendentes}</div>
            <div className="kpi-subtext">Tarefas a fazer</div>
        </div>
        <div className="kpi-card">
            <div className="kpi-header">
                <span className="kpi-title">Alta Prioridade</span>
                <div className="icon-box bg-red-light"><AlertCircle size={20} /></div>
            </div>
            <div className="kpi-value" style={{color: statsAltaPrio > 0 ? '#dc2626' : 'inherit'}}>{statsAltaPrio}</div>
            <div className="kpi-subtext">Requerem atenção</div>
        </div>
        <div className="kpi-card">
            <div className="kpi-header">
                <span className="kpi-title">Concluídas</span>
                <div className="icon-box bg-green-light"><CheckCircle2 size={20} /></div>
            </div>
            <div className="kpi-value">{tarefasConcluidas.length}</div>
            <div className="kpi-subtext">Total histórico</div>
        </div>
      </div>

      {/* --- LISTA DE TAREFAS PENDENTES --- */}
      <div className="task-list-container">
        {tarefasPendentes.length === 0 ? (
            <div style={{textAlign:'center', padding:'40px', background:'white', borderRadius:'12px', border:'1px dashed #e2e8f0', color:'#94a3b8'}}>
                <ListTodo size={48} style={{marginBottom:'16px', opacity:0.5}} />
                <p>Nenhuma tarefa pendente. Bom trabalho!</p>
            </div>
        ) : (
            tarefasPendentes.map(tarefa => (
                <div key={tarefa.id} className="task-item">
                    <input 
                        type="checkbox" 
                        className="custom-checkbox"
                        checked={tarefa.concluida} 
                        onChange={() => toggleConclusao(tarefa.id)}
                    />
                    
                    <div className="task-content">
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                            <h4 className="task-title">{tarefa.titulo}</h4>
                            <span className={`priority-badge ${getPriorityClass(tarefa.prioridade)}`}>
                                {tarefa.prioridade}
                            </span>
                        </div>
                        
                        <p className="task-desc">{tarefa.descricao || 'Sem descrição.'}</p>
                        
                        <div className="task-meta">
                            <span className="meta-tag">
                                <Calendar size={14}/> 
                                {tarefa.dataPrazo ? new Date(tarefa.dataPrazo).toLocaleString() : 'Sem prazo'}
                            </span>
                            <span className="meta-tag">
                                <Tag size={14}/> {tarefa.categoria || 'Geral'}
                            </span>
                            
                            {USUARIO_ATUAL_MOCK.funcao === 'ADMIN' && (
                                <span className="meta-tag" style={{backgroundColor: '#eff6ff', color: '#1e40af'}}>
                                    <User size={14}/> 
                                    {tarefa.responsavel ? tarefa.responsavel.nomeUsuario : 'Sem dono'}
                                </span>
                            )}
                        </div>
                    </div>

                    <button onClick={() => excluirTarefa(tarefa.id)} className="btn-icon-sm danger" title="Excluir">
                        <Trash2 size={18} />
                    </button>
                </div>
            ))
        )}
      </div>

      {/* --- LISTA DE TAREFAS CONCLUÍDAS --- */}
      {tarefasConcluidas.length > 0 && (
          <>
            <div className="completed-section-title">
                <CheckCircle2 size={16} /> Concluídas
            </div>
            
            <div className="task-list-container">
                {tarefasConcluidas.map(tarefa => (
                    <div key={tarefa.id} className="task-item completed">
                        <input 
                            type="checkbox" 
                            className="custom-checkbox"
                            checked={tarefa.concluida} 
                            onChange={() => toggleConclusao(tarefa.id)}
                        />
                        <div className="task-content">
                            <h4 className="task-title">{tarefa.titulo}</h4>
                            <div className="task-meta">
                                <span className="meta-tag">Concluída</span>
                                <span className="meta-tag">{tarefa.categoria}</span>
                            </div>
                        </div>
                        <button onClick={() => excluirTarefa(tarefa.id)} className="btn-icon-sm" title="Excluir">
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
          </>
      )}

      {/* --- MODAL DE CADASTRO --- */}
      {modalAberto && (
        <div className="modal-modern-overlay">
            <div className="modal-modern-content">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <h2 className="modal-title">Nova Tarefa</h2>
                    <button onClick={() => setModalAberto(false)} style={{border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8'}}>
                        <Plus size={24} style={{transform: 'rotate(45deg)'}} />
                    </button>
                </div>
                <p className="modal-desc">Descreva a atividade e defina um prazo.</p>

                <form onSubmit={salvarTarefa}>
                    <div className="form-group">
                        <label className="form-label">Título</label>
                        <input className="form-input" placeholder="Ex: Comprar Adubo" 
                            value={novaTarefa.titulo} onChange={e => setNovaTarefa({...novaTarefa, titulo: e.target.value})} required />
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Descrição</label>
                        <textarea className="form-input" rows="3" placeholder="Detalhes..." 
                            value={novaTarefa.descricao} onChange={e => setNovaTarefa({...novaTarefa, descricao: e.target.value})} />
                    </div>

                    {/* Exibe seleção de responsável APENAS SE FOR ADMIN */}
                    {USUARIO_ATUAL_MOCK.funcao === 'ADMIN' && (
                        <div className="form-group">
                            <label className="form-label">Atribuir a:</label>
                            <select className="form-select" value={novaTarefa.idResponsavel} onChange={e => setNovaTarefa({...novaTarefa, idResponsavel: e.target.value})}>
                                <option value="">-- Selecione um Responsável --</option>
                                {usuarios.map(u => (
                                    <option key={u.idUsuario} value={u.idUsuario}>
                                        {u.nomeUsuario} ({u.funcao})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                        <div className="form-group">
                            <label className="form-label">Categoria</label>
                            <input className="form-input" placeholder="Ex: Compras" 
                                value={novaTarefa.categoria} onChange={e => setNovaTarefa({...novaTarefa, categoria: e.target.value})} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Prioridade</label>
                            <select className="form-select" value={novaTarefa.prioridade} onChange={e => setNovaTarefa({...novaTarefa, prioridade: e.target.value})}>
                                <option value="BAIXA">Baixa</option>
                                <option value="MEDIA">Média</option>
                                <option value="ALTO">Alta</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Prazo Limite</label>
                        <input type="datetime-local" className="form-input" 
                            value={novaTarefa.dataPrazo} onChange={e => setNovaTarefa({...novaTarefa, dataPrazo: e.target.value})} required />
                    </div>
                    
                    <div className="modal-footer">
                        <button type="button" className="btn-outline" onClick={() => setModalAberto(false)}>Cancelar</button>
                        <button type="submit" className="btn-primary">Salvar Tarefa</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default Tarefas;