import { useState, useEffect } from 'react';
import '../App.css';
import { Plus, Calendar, Trash2, ListTodo, User } from 'lucide-react';

const Tarefas = () => {
  const [tarefas, setTarefas] = useState([]);
  const [usuarios, setUsuarios] = useState([]); // Lista de utilizadores para o select
  const [modalAberto, setModalAberto] = useState(false);
  
  // Estado do Formulário
  const [novaTarefa, setNovaTarefa] = useState({
    titulo: '',
    descricao: '',
    prioridade: 'MEDIA',
    categoria: '',
    dataPrazo: '',
    idResponsavel: '' // Novo campo para vincular usuário
  });

  // --- 1. Carregar Dados ---
  const carregarDados = () => {
    // Busca as tarefas
    fetch('http://localhost:8090/api/tarefas')
      .then(r => r.json())
      .then(setTarefas)
      .catch(err => console.error("Erro ao buscar tarefas:", err));

    // Busca os usuários para preencher o dropdown
    fetch('http://localhost:8090/api/usuarios')
      .then(r => r.json())
      .then(setUsuarios)
      .catch(err => console.error("Erro ao buscar usuários:", err));
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // --- 2. Salvar Tarefa (POST) ---
  const salvarTarefa = (e) => {
    e.preventDefault();
    
    // O ID do responsável vai na URL (Query Param), o resto vai no JSON (Body)
    // Nota: Se idResponsavel for vazio, o Java vai entender como null (tarefa sem dono)
    const url = `http://localhost:8090/api/tarefas?idResponsavel=${novaTarefa.idResponsavel}`;
    
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
        carregarDados(); // Recarrega a lista
        setModalAberto(false); // Fecha o modal
        // Limpa o formulário
        setNovaTarefa({ titulo: '', descricao: '', prioridade: 'MEDIA', categoria: '', dataPrazo: '', idResponsavel: '' });
      } else {
        alert('Erro ao salvar tarefa. Verifique os dados.');
      }
    });
  };

  // --- 3. Alternar Conclusão (PUT) ---
  const toggleConclusao = (id) => {
    fetch(`http://localhost:8090/api/tarefas/${id}/concluir`, { method: 'PUT' })
      .then(res => {
        if (res.ok) carregarDados();
      });
  };

  // --- 4. Excluir Tarefa (DELETE) ---
  const excluirTarefa = (id) => {
    if (confirm('Tem a certeza que deseja apagar esta tarefa?')) {
      fetch(`http://localhost:8090/api/tarefas/${id}`, { method: 'DELETE' })
        .then(res => { if(res.ok) carregarDados(); });
    }
  };

  // Cálculos para o Resumo
  const pendentes = tarefas.filter(t => !t.concluida).length;
  const concluidasTotal = tarefas.filter(t => t.concluida).length;
  const altaPrioridade = tarefas.filter(t => t.prioridade === 'ALTA' && !t.concluida).length;

  const getBadgeStyle = (prio) => {
    if (prio === 'ALTA') return { backgroundColor: '#fee2e2', color: '#dc2626' };
    if (prio === 'MEDIA') return { backgroundColor: '#ffedd5', color: '#ea580c' };
    return { backgroundColor: '#dcfce7', color: '#166534' };
  };

  return (
    <div className="lovable-container animate-fade-in">
      
      {/* Header */}
      <div className="lovable-header">
        <div>
          <h1 className="lovable-title">Tarefas</h1>
          <p className="lovable-subtitle">Atribua e gerencie atividades da equipa.</p>
        </div>
        
        {/* Botão Nova Tarefa */}
        <button className="btn-lovable-primary" onClick={() => setModalAberto(true)}>
          <Plus size={18} /> Nova Tarefa
        </button>
      </div>

      {/* Resumo (Stats) */}
      <div className="stats-grid">
        <div className="lovable-card">
            <div className="text-muted" style={{fontSize:'0.875rem'}}>Pendentes</div>
            <div className="stat-value" style={{color: '#eab308'}}>{pendentes}</div>
        </div>
        <div className="lovable-card">
            <div className="text-muted" style={{fontSize:'0.875rem'}}>Concluídas</div>
            <div className="stat-value" style={{color: '#16a34a'}}>{concluidasTotal}</div>
        </div>
        <div className="lovable-card">
            <div className="text-muted" style={{fontSize:'0.875rem'}}>Prioridade Alta</div>
            <div className="stat-value" style={{color: '#dc2626'}}>{altaPrioridade}</div>
        </div>
      </div>

      {/* Lista de Tarefas */}
      <div className="lovable-card" style={{padding: '0'}}>
        <div style={{padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display:'flex', alignItems:'center', gap:'10px'}}>
            <ListTodo size={20} className="text-muted"/> 
            <h3 className="card-title">Lista de Atividades</h3>
        </div>
        
        <div style={{padding: '1rem'}}>
            {tarefas.length === 0 ? (
                <p style={{textAlign:'center', color:'#999', padding:'2rem'}}>Nenhuma tarefa cadastrada.</p>
            ) : (
                tarefas.map(tarefa => (
                    <div key={tarefa.id} style={{
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '1rem', 
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background 0.2s'
                    }}>
                        
                        {/* Lado Esquerdo: Checkbox e Textos */}
                        <div style={{display: 'flex', alignItems: 'flex-start', gap: '1rem'}}>
                            <input 
                                type="checkbox" 
                                className="checkbox-input" 
                                checked={tarefa.concluida} 
                                onChange={() => toggleConclusao(tarefa.id)}
                                style={{marginTop: '5px'}}
                            />
                            <div style={{opacity: tarefa.concluida ? 0.5 : 1, textDecoration: tarefa.concluida ? 'line-through' : 'none'}}>
                                <h4 style={{margin: '0 0 4px 0', fontSize: '1rem', color: '#0f172a'}}>{tarefa.titulo}</h4>
                                <p style={{margin: 0, fontSize: '0.875rem', color: '#64748b'}}>{tarefa.descricao}</p>
                                
                                <div style={{display: 'flex', gap: '10px', marginTop: '8px', fontSize: '0.75rem', color: '#64748b', flexWrap: 'wrap'}}>
                                    <span style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                                        <Calendar size={12}/> {tarefa.dataPrazo ? new Date(tarefa.dataPrazo).toLocaleDateString() : 'Sem prazo'}
                                    </span>
                                    <span style={{background:'#f1f5f9', padding:'2px 8px', borderRadius:'4px'}}>
                                        {tarefa.categoria}
                                    </span>
                                    
                                    {/* MOSTRA QUEM É O RESPONSÁVEL */}
                                    {tarefa.responsavel ? (
                                        <span style={{display: 'flex', alignItems: 'center', gap: '4px', background:'#eff6ff', color:'#1e40af', padding:'2px 8px', borderRadius:'4px'}}>
                                            <User size={12}/> {tarefa.responsavel.nomeUsuario}
                                        </span>
                                    ) : (
                                        <span style={{display: 'flex', alignItems: 'center', gap: '4px', background:'#f1f5f9', padding:'2px 8px', borderRadius:'4px'}}>
                                            <User size={12}/> Sem responsável
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Lado Direito: Badge e Botão Excluir */}
                        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px'}}>
                            <span className="badge" style={getBadgeStyle(tarefa.prioridade)}>
                                {tarefa.prioridade}
                            </span>
                            
                            <button 
                                onClick={() => excluirTarefa(tarefa.id)}
                                style={{border: 'none', background: 'transparent', color: '#cbd5e1', cursor: 'pointer'}}
                                title="Excluir"
                            >
                                <Trash2 size={16} className="hover:text-red-500" />
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>

      {/* --- MODAL DE CADASTRO --- */}
      {modalAberto && (
        <div className="modal-overlay">
            <div className="modal-content-modern">
                <h2 style={{marginTop: 0, marginBottom: '1.5rem', color: '#2e7d32'}}>Nova Tarefa</h2>
                <form onSubmit={salvarTarefa}>
                    <div className="form-group">
                        <label className="form-label">Título</label>
                        <input className="form-input" placeholder="Ex: Comprar Adubo" 
                            value={novaTarefa.titulo} onChange={e => setNovaTarefa({...novaTarefa, titulo: e.target.value})} required />
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Descrição</label>
                        <input className="form-input" placeholder="Detalhes..." 
                            value={novaTarefa.descricao} onChange={e => setNovaTarefa({...novaTarefa, descricao: e.target.value})} />
                    </div>

                    {/* SELECT DE RESPONSÁVEL */}
                    <div className="form-group">
                        <label className="form-label">Atribuir a:</label>
                        <select className="form-input" value={novaTarefa.idResponsavel} onChange={e => setNovaTarefa({...novaTarefa, idResponsavel: e.target.value})}>
                            <option value="">-- Selecione um Responsável --</option>
                            {usuarios.map(u => (
                                <option key={u.idUsuario} value={u.idUsuario}>
                                    {u.nomeUsuario} ({u.funcao})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                        <div className="form-group">
                            <label className="form-label">Categoria</label>
                            <input className="form-input" placeholder="Ex: Compras" 
                                value={novaTarefa.categoria} onChange={e => setNovaTarefa({...novaTarefa, categoria: e.target.value})} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Prioridade</label>
                            <select className="form-input" value={novaTarefa.prioridade} onChange={e => setNovaTarefa({...novaTarefa, prioridade: e.target.value})}>
                                <option value="BAIXA">Baixa</option>
                                <option value="MEDIA">Média</option>
                                <option value="ALTO">Alta</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Prazo</label>
                        <input type="datetime-local" className="form-input" 
                            value={novaTarefa.dataPrazo} onChange={e => setNovaTarefa({...novaTarefa, dataPrazo: e.target.value})} required />
                    </div>
                    
                    <div style={{display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem'}}>
                        <button type="button" className="btn-lovable-outline" onClick={() => setModalAberto(false)}>Cancelar</button>
                        <button type="submit" className="btn-lovable-primary">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default Tarefas;