import { useState, useEffect } from 'react';
import '../App.css';
import { Trash2, Plus, Sprout, Clock, Tag, Pencil } from 'lucide-react'; // <--- Adicionado Pencil

const Plantas = () => {
  const [plantas, setPlantas] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  
  // Estados de Edição
  const [editandoId, setEditandoId] = useState(null);
  const [novaPlanta, setNovaPlanta] = useState({
    nomePopular: '',
    nomeCientifico: '',
    tipoPlanta: 'HORTALICA',
    cicloMedioDias: '',
    solosRecomendados: ['ARGILOSO']
  });

  // --- 1. Carregar Dados ---
  const carregarPlantas = () => {
    fetch('http://localhost:8080/api/plantas')
      .then(res => res.json())
      .then(dados => setPlantas(dados))
      .catch(err => console.error("Erro ao buscar plantas:", err));
  };

  useEffect(() => {
    carregarPlantas();
  }, []);

  // --- 2. Cálculos de Resumo ---
  const mediaCiclo = plantas.length > 0 
    ? Math.round(plantas.reduce((acc, p) => acc + p.cicloMedioDias, 0) / plantas.length) 
    : 0;

  // --- 3. Funções de Modal (Criação vs Edição) ---
  const abrirModal = (planta = null) => {
    if (planta) {
      // MODO EDIÇÃO: Preenche com os dados existentes
      setEditandoId(planta.idPlanta);
      setNovaPlanta({
        nomePopular: planta.nomePopular,
        nomeCientifico: planta.nomeCientifico || '',
        tipoPlanta: planta.tipoPlanta,
        cicloMedioDias: planta.cicloMedioDias,
        solosRecomendados: planta.solosRecomendados || ['ARGILOSO']
      });
    } else {
      // MODO CRIAÇÃO: Limpa o formulário
      setEditandoId(null);
      setNovaPlanta({ nomePopular: '', nomeCientifico: '', tipoPlanta: 'HORTALICA', cicloMedioDias: '', solosRecomendados: ['ARGILOSO'] });
    }
    setModalAberto(true);
  };

  // --- 4. Salvar (POST/PUT) ---
  const salvarPlanta = (e) => {
    e.preventDefault();
    
    const url = editandoId 
        ? `http://localhost:8080/api/plantas/${editandoId}` // Edição
        : 'http://localhost:8080/api/plantas';            // Criação
    
    const metodo = editandoId ? 'PUT' : 'POST';

    fetch(url, {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novaPlanta)
    }).then(res => {
      if (res.ok) {
        alert(editandoId ? 'Planta atualizada!' : 'Planta cadastrada! 🌱');
        carregarPlantas();
        setModalAberto(false);
        setEditandoId(null);
      } else {
        alert('Erro ao salvar planta.');
      }
    });
  };

  // --- 5. Excluir (DELETE) ---
  const excluirPlanta = (id, nome) => {
    if (confirm(`Tem a certeza que deseja remover a planta "${nome}"?`)) {
        fetch(`http://localhost:8080/api/plantas/${id}`, {
            method: 'DELETE'
        }).then(res => {
            if (res.ok) {
                carregarPlantas();
            } else {
                alert('Erro ao remover. Verifique se esta planta está em uso.');
            }
        });
    }
  };

  // Helper para cor do badge baseada no tipo
  const getCorTipo = (tipo) => {
      const cores = {
          'HORTALICA': '#e8f5e9', // Verde claro
          'FRUTA': '#fff3e0',     // Laranja claro
          'GRAO': '#e3f2fd',      // Azul claro
          'LEGUME': '#f3e5f5'     // Roxo claro
      };
      return cores[tipo] || '#eee';
  };

  const getCorTextoTipo = (tipo) => {
      const cores = {
          'HORTALICA': '#1b5e20',
          'FRUTA': '#e65100',
          'GRAO': '#0d47a1',
          'LEGUME': '#4a148c'
      };
      return cores[tipo] || '#333';
  };

  return (
    <div className="anime-fade-in">
      
      {/* Cabeçalho */}
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
        <div>
            <h1 className="titulo" style={{textAlign: 'left', margin: 0}}>Catálogo de Plantas</h1>
            <p style={{color: '#666', margin: 0}}>Registo das espécies disponíveis para cultivo.</p>
        </div>
        {/* Botão chama abrirModal vazio para criar novo */}
        <button className="btn-primary" onClick={() => abrirModal()}>
            <Plus size={20} /> Nova Planta
        </button>
      </div>

      {/* Resumo (Stats) */}
      <div className="stats-grid">
        <div className="stat-card">
            <div className="stat-label">Total de Espécies</div>
            <div className="stat-value">{plantas.length}</div>
        </div>
        <div className="stat-card">
            <div className="stat-label">Ciclo Médio (Dias)</div>
            <div className="stat-value">{mediaCiclo}</div>
        </div>
      </div>

      {/* Grid de Plantas */}
      <div className="grid-areas">
        {plantas.map(planta => (
          <div key={planta.idPlanta} className="card" style={{position: 'relative', borderLeft: `6px solid ${getCorTextoTipo(planta.tipoPlanta)}`}}>
            
            {/* --- BOTÕES DE AÇÃO (NOVO) --- */}
            <div style={{position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '8px'}}>
                <button 
                    onClick={() => abrirModal(planta)} 
                    style={{border: 'none', background: 'transparent', color: '#1976d2', cursor: 'pointer'}}
                    title="Editar Planta"
                >
                    <Pencil size={18} />
                </button>
                <button 
                    onClick={() => excluirPlanta(planta.idPlanta, planta.nomePopular)}
                    style={{border: 'none', background: 'transparent', color: '#d32f2f', cursor: 'pointer'}}
                    title="Excluir Planta"
                >
                    <Trash2 size={18} />
                </button>
            </div>

            <div>
              <h3 style={{ margin: '0 0 5px 0', color: '#333', fontSize: '1.2rem', paddingRight: '60px' }}>{planta.nomePopular}</h3>
              <p style={{fontStyle: 'italic', color: '#666', marginBottom: '15px', fontSize: '0.9rem'}}>
                {planta.nomeCientifico || 'Nome científico não informado'}
              </p>
              
              <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                  <span className="badge-solo" style={{backgroundColor: '#f5f5f5', color: '#555', display: 'flex', alignItems: 'center', gap: '4px'}}>
                    <Clock size={14}/> {planta.cicloMedioDias} dias
                  </span>
                  <span className="badge-solo" style={{
                      backgroundColor: getCorTipo(planta.tipoPlanta), 
                      color: getCorTextoTipo(planta.tipoPlanta),
                      display: 'flex', alignItems: 'center', gap: '4px'
                  }}>
                    <Tag size={14}/> {planta.tipoPlanta}
                  </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- MODAL DE CADASTRO/EDIÇÃO --- */}
      {modalAberto && (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2 style={{marginTop: 0, color: '#2e7d32'}}>
                    {editandoId ? 'Editar Planta' : 'Nova Planta'}
                </h2>
                <form onSubmit={salvarPlanta}>
                    <div className="campo-grupo">
                        <input 
                            placeholder="Nome Popular (Ex: Alface)" 
                            value={novaPlanta.nomePopular} 
                            onChange={e => setNovaPlanta({...novaPlanta, nomePopular: e.target.value})} 
                            required 
                            style={{flex: 1}}
                        />
                    </div>
                    <div className="campo-grupo">
                        <input 
                            placeholder="Nome Científico (Opcional)" 
                            value={novaPlanta.nomeCientifico} 
                            onChange={e => setNovaPlanta({...novaPlanta, nomeCientifico: e.target.value})} 
                            style={{flex: 1}}
                        />
                    </div>

                    <div className="campo-grupo">
                        <div style={{flex: 1}}>
                            <label style={{fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '5px'}}>Ciclo (dias)</label>
                            <input 
                                type="number" 
                                placeholder="Ex: 90" 
                                value={novaPlanta.cicloMedioDias} 
                                onChange={e => setNovaPlanta({...novaPlanta, cicloMedioDias: e.target.value})} 
                                required 
                                style={{width: '100%'}}
                            />
                        </div>
                        
                        <div style={{flex: 1}}>
                            <label style={{fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '5px'}}>Tipo</label>
                            <select 
                                value={novaPlanta.tipoPlanta} 
                                onChange={e => setNovaPlanta({...novaPlanta, tipoPlanta: e.target.value})}
                                style={{width: '100%'}}
                            >
                                <option value="HORTALICA">Hortaliça</option>
                                <option value="FRUTA">Fruta</option>
                                <option value="GRAO">Grão</option>
                                <option value="LEGUME">Legume</option>
                            </select>
                        </div>
                    </div>
                    
                    <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px'}}>
                        <button type="button" className="btn-outline" onClick={() => setModalAberto(false)}>Cancelar</button>
                        <button type="submit" className="btn-primary">
                            {editandoId ? 'Atualizar' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};

export default Plantas;