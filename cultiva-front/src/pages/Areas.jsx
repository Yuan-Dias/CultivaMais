import { useState, useEffect } from 'react';
import '../App.css';
import { Trash2, Pencil, Plus, MapPin, Sprout, Ruler } from 'lucide-react';

const Areas = () => {
  const [areas, setAreas] = useState([]);
  const [modalAberto, setModalAberto] = useState(false); // Controla se o modal está visível
  
  // Estados de Edição/Criação
  const [editandoId, setEditandoId] = useState(null);
  const [novaArea, setNovaArea] = useState({
    nomeArea: '', localizacaoArea: '', tamanhoArea: '', tipoSolo: 'ARGILOSO',
    latitudeArea: -23.5, longitudeArea: -46.6
  });

  // Estados de Visualização de Cultivos (Lista dentro do cartão)
  const [idAreaSelecionada, setIdAreaSelecionada] = useState(null);
  const [cultivos, setCultivos] = useState([]);

  // --- 1. Carregar Dados (GET) ---
  const carregarAreas = () => {
    fetch('http://localhost:8090/api/areas')
      .then(res => res.json())
      .then(dados => setAreas(dados))
      .catch(err => console.error("Erro:", err));
  };

  useEffect(() => {
    carregarAreas();
  }, []);

  // --- 2. Cálculos para o Resumo (Stats) ---
  const totalHectares = areas.reduce((acc, area) => acc + area.tamanhoArea, 0).toFixed(1);
  const totalCultivosAtivos = areas.reduce((acc, area) => acc + (area.cultivos ? area.cultivos.length : 0), 0);

  // --- 3. Funções de Modal e Formulário ---
  const abrirModal = (area = null) => {
    if (area) {
      // Modo Edição
      setEditandoId(area.idArea);
      setNovaArea({
        nomeArea: area.nomeArea,
        localizacaoArea: area.localizacaoArea,
        tamanhoArea: area.tamanhoArea,
        tipoSolo: area.tipoSolo,
        latitudeArea: area.latitudeArea,
        longitudeArea: area.longitudeArea
      });
    } else {
      // Modo Criação (Limpar)
      setEditandoId(null);
      setNovaArea({ nomeArea: '', localizacaoArea: '', tamanhoArea: '', tipoSolo: 'ARGILOSO', latitudeArea: -23.5, longitudeArea: -46.6 });
    }
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setEditandoId(null);
  };

  // --- 4. Salvar (POST / PUT) ---
  const salvarArea = (e) => {
    e.preventDefault();
    const url = editandoId 
        ? `http://localhost:8090/api/areas/${editandoId}` 
        : 'http://localhost:8090/api/areas';            
    const metodo = editandoId ? 'PUT' : 'POST';

    fetch(url, {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novaArea)
    }).then(res => {
      if (res.ok) {
        alert(editandoId ? 'Área atualizada!' : 'Área criada!');
        carregarAreas();
        fecharModal();
      } else {
        alert('Erro ao salvar.');
      }
    });
  };

  // --- 5. Excluir (DELETE) ---
  const excluirArea = (id, nome) => {
    if (confirm(`Apagar a área "${nome}" e todos os seus cultivos?`)) {
      fetch(`http://localhost:8090/api/areas/${id}`, { method: 'DELETE' })
        .then(res => {
          if (res.ok) carregarAreas();
          else alert('Erro ao excluir.');
        });
    }
  };

  // --- 6. Ver Cultivos (GET) ---
  const verCultivos = (idArea) => {
    if (idArea === idAreaSelecionada) {
      setIdAreaSelecionada(null);
      return;
    }
    fetch(`http://localhost:8090/api/relatorios/colheita/${idArea}`)
      .then(r => r.json())
      .then(d => { setCultivos(d); setIdAreaSelecionada(idArea); });
  };

  return (
    <div className="anime-fade-in">
      
      {/* Cabeçalho + Botão Nova Área */}
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
        <div>
            <h1 className="titulo" style={{textAlign: 'left', margin: 0}}>Áreas de Cultivo</h1>
            <p style={{color: '#666', margin: 0}}>Gerencie as suas terras e monitore a produção.</p>
        </div>
        <button className="btn-primary" onClick={() => abrirModal()}>
            <Plus size={20} /> Nova Área
        </button>
      </div>

      {/* Resumo (Stats) */}
      <div className="stats-grid">
        <div className="stat-card">
            <div className="stat-label">Total de Áreas</div>
            <div className="stat-value">{areas.length}</div>
        </div>
        <div className="stat-card">
            <div className="stat-label">Área Total (ha)</div>
            <div className="stat-value">{totalHectares}</div>
        </div>
        <div className="stat-card">
            <div className="stat-label">Cultivos Ativos</div>
            <div className="stat-value">{totalCultivosAtivos}</div>
        </div>
      </div>

      {/* Grid de Áreas */}
      <div className="grid-areas">
        {areas.map(area => (
          <div key={area.idArea} className="card" style={{position: 'relative'}}>
            
            {/* Ações do Card (Editar/Excluir) */}
            <div style={{position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '8px'}}>
                <button onClick={() => abrirModal(area)} style={{border:'none', background:'none', color:'#1976d2', cursor:'pointer'}} title="Editar">
                    <Pencil size={18}/>
                </button>
                <button onClick={() => excluirArea(area.idArea, area.nomeArea)} style={{border:'none', background:'none', color:'#d32f2f', cursor:'pointer'}} title="Excluir">
                    <Trash2 size={18}/>
                </button>
            </div>

            <div>
              <h3 style={{margin: '0 0 10px 0', color: '#333', fontSize: '1.2rem'}}>{area.nomeArea}</h3>
              
              <div style={{display: 'flex', gap: '15px', color: '#666', fontSize: '0.9rem', marginBottom: '15px'}}>
                <span style={{display: 'flex', alignItems: 'center', gap: '5px'}}><MapPin size={16}/> {area.localizacaoArea}</span>
                <span style={{display: 'flex', alignItems: 'center', gap: '5px'}}><Ruler size={16}/> {area.tamanhoArea} ha</span>
              </div>

              <span className="badge-solo">{area.tipoSolo}</span>
            </div>

            <button 
              className="botao-ver" 
              onClick={() => verCultivos(area.idArea)}
              style={{marginTop: '20px', background: idAreaSelecionada === area.idArea ? '#666' : '#2e7d32'}}
            >
              {idAreaSelecionada === area.idArea ? 'Fechar Cultivos' : `Ver Cultivos (${area.cultivos ? area.cultivos.length : 0})`}
            </button>

            {/* Lista de Cultivos Expandida */}
            {idAreaSelecionada === area.idArea && (
              <div className="lista-cultivos">
                 {cultivos.length === 0 ? <p style={{color:'#999', fontSize:'0.9rem'}}>Vazio.</p> : cultivos.map(c => (
                     <div key={c.idCultivo} style={{borderBottom:'1px solid #eee', padding:'8px 0', display:'flex', alignItems:'center', gap:'10px'}}>
                        <Sprout size={16} color="green"/>
                        <span>{c.planta ? c.planta.nomePopular : '?'}</span>
                     </div>
                 ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* --- MODAL DE CADASTRO/EDIÇÃO (Substitui o formulário fixo antigo) --- */}
      {modalAberto && (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2 style={{marginTop: 0, color: '#2e7d32'}}>{editandoId ? 'Editar Área' : 'Nova Área'}</h2>
                <form onSubmit={salvarArea}>
                    <div className="campo-grupo">
                        <input placeholder="Nome" value={novaArea.nomeArea} onChange={e => setNovaArea({...novaArea, nomeArea: e.target.value})} required style={{flex: 1}} />
                    </div>
                    <div className="campo-grupo">
                        <input placeholder="Localização" value={novaArea.localizacaoArea} onChange={e => setNovaArea({...novaArea, localizacaoArea: e.target.value})} required style={{flex: 1}} />
                    </div>
                    <div className="campo-grupo">
                        <input type="number" placeholder="Tamanho (ha)" value={novaArea.tamanhoArea} onChange={e => setNovaArea({...novaArea, tamanhoArea: e.target.value})} required style={{flex: 1}} />
                        <select value={novaArea.tipoSolo} onChange={e => setNovaArea({...novaArea, tipoSolo: e.target.value})} style={{flex: 1}}>
                            <option value="ARGILOSO">Argiloso</option>
                            <option value="ARENOSO">Arenoso</option>
                            <option value="HUMIFERO">Humífero</option>
                            <option value="CALCARIO">Calcário</option>
                        </select>
                    </div>
                    <div style={{display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end'}}>
                        <button type="button" className="btn-outline" onClick={fecharModal}>Cancelar</button>
                        <button type="submit" className="btn-primary">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};

export default Areas;