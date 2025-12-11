import { useState, useEffect } from 'react';
import '../App.css';
import { 
    Trash2, Pencil, Plus, MapPin, Sprout, Ruler, 
    X, Tractor
} from 'lucide-react';

const Areas = () => {
  const [areas, setAreas] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  
  // Estados de Edição/Criação
  const [editandoId, setEditandoId] = useState(null);
  const [novaArea, setNovaArea] = useState({
    nomeArea: '', localizacaoArea: '', tamanhoArea: '', tipoSolo: 'ARGILOSO',
    latitudeArea: -23.5, longitudeArea: -46.6
  });

  // Estados de Visualização de Cultivos (Expansor)
  const [idAreaSelecionada, setIdAreaSelecionada] = useState(null);
  const [cultivos, setCultivos] = useState([]);

  // --- Funções Auxiliares de Estilo ---
  const getBadgeClass = (solo) => {
      const tipo = solo ? solo.toUpperCase() : '';
      if (tipo === 'ARGILOSO') return 'badge-argiloso';
      if (tipo === 'ARENOSO') return 'badge-arenoso';
      if (tipo === 'HUMIFERO') return 'badge-humifero';
      return 'badge-calcario';
  };

  // --- 1. Carregar Dados ---
  const carregarAreas = () => {
    fetch('http://localhost:8090/api/areas')
      .then(res => res.json())
      .then(dados => setAreas(dados))
      .catch(err => console.error("Erro:", err));
  };

  useEffect(() => {
    carregarAreas();
  }, []);

  // --- 2. Cálculos (Resumo no topo) ---
  const totalHectares = areas.reduce((acc, area) => acc + area.tamanhoArea, 0).toFixed(1);
  const totalCultivosAtivos = areas.reduce((acc, area) => acc + (area.cultivos ? area.cultivos.length : 0), 0);

  // --- 3. Controle Modal (Criar/Editar) ---
  const abrirModal = (area = null) => {
    if (area) {
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
      setEditandoId(null);
      setNovaArea({ nomeArea: '', localizacaoArea: '', tamanhoArea: '', tipoSolo: 'ARGILOSO', latitudeArea: -23.5, longitudeArea: -46.6 });
    }
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setEditandoId(null);
  };

  // --- 4. Salvar (POST/PUT) ---
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
        carregarAreas();
        fecharModal();
      } else {
        alert('Erro ao salvar.');
      }
    });
  };

  // --- 5. Excluir ---
  const excluirArea = (id, nome) => {
    if (confirm(`Apagar a área "${nome}"?`)) {
      fetch(`http://localhost:8090/api/areas/${id}`, { method: 'DELETE' })
        .then(res => {
          if (res.ok) carregarAreas();
        });
    }
  };

  // --- 6. Ver Cultivos (Listagem rápida) ---
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
    <div className="animate-fade-in" style={{ padding: '0 10px' }}>
      
      {/* Header da Página */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
           <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Áreas de Cultivo</h1>
           <p style={{ color: '#64748b', marginTop: '4px' }}>Gerencie suas terras e características de solo.</p>
        </div>
        <button className="btn-primary" onClick={() => abrirModal()}>
            <Plus size={20} /> Nova Área
        </button>
      </div>

      {/* Resumo (Stats Row) */}
      <div className="kpi-grid" style={{ marginBottom: '32px' }}>
        <div className="kpi-card">
            <div className="kpi-header">
                <span className="kpi-title">Total de Áreas</span>
                <div className="icon-box bg-green-light"><MapPin size={20} /></div>
            </div>
            <div className="kpi-value">{areas.length}</div>
        </div>
        
        <div className="kpi-card">
            <div className="kpi-header">
                <span className="kpi-title">Área Total</span>
                <div className="icon-box bg-blue-light"><Ruler size={20} /></div>
            </div>
            <div className="kpi-value">{totalHectares} <span style={{fontSize: '1rem', color: '#64748b', fontWeight: 400}}>ha</span></div>
        </div>

        <div className="kpi-card">
            <div className="kpi-header">
                <span className="kpi-title">Em Produção</span>
                <div className="icon-box bg-orange-light"><Tractor size={20} /></div>
            </div>
            <div className="kpi-value">{totalCultivosAtivos}</div>
            <div className="kpi-subtext">Cultivos ativos no momento</div>
        </div>
      </div>

      {/* Grid de Cards das Áreas */}
      <div className="areas-grid">
        {areas.map(area => (
          <div key={area.idArea} className="area-card">
            
            {/* Cabeçalho do Card */}
            <div className="area-card-header">
                <div className="area-title">{area.nomeArea}</div>
                <span className={`badge ${getBadgeClass(area.tipoSolo)}`}>
                    {area.tipoSolo}
                </span>
            </div>

            {/* Corpo do Card */}
            <div className="area-card-body">
                <div className="area-info-row">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MapPin size={16} /> Localização
                    </span>
                    <strong>{area.localizacaoArea}</strong>
                </div>

                <div className="area-info-row">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Ruler size={16} /> Tamanho
                    </span>
                    <strong>{area.tamanhoArea} ha</strong>
                </div>
            </div>

            {/* Área Expansível de Cultivos */}
            {idAreaSelecionada === area.idArea && (
                <div className="cultivos-list-container">
                    <h4 style={{margin: '0 0 10px 0', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase'}}>O que está plantado aqui:</h4>
                    {cultivos.length === 0 ? (
                        <p style={{color:'#94a3b8', fontSize:'0.85rem', fontStyle: 'italic'}}>Área disponível (sem cultivos ativos).</p> 
                    ) : (
                        cultivos.map(c => (
                            <div key={c.idCultivo} className="cultivo-item-mini">
                                <div style={{background: '#dcfce7', padding: '4px', borderRadius: '4px', color: '#16a34a'}}>
                                    <Sprout size={14}/>
                                </div>
                                <span style={{fontWeight: 500}}>{c.planta ? c.planta.nomePopular : 'Planta Desconhecida'}</span>
                                <span style={{fontSize: '0.75rem', color: '#94a3b8', marginLeft: 'auto'}}>
                                    {c.statusCultivo}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Rodapé de Ações */}
            <div className="area-card-actions">
                <button 
                    className="btn-outline" 
                    style={{ flex: 1, justifyContent: 'center', fontSize: '0.85rem' }}
                    onClick={() => verCultivos(area.idArea)}
                >
                    {idAreaSelecionada === area.idArea ? 'Ocultar Detalhes' : 'Ver Detalhes'}
                </button>
                
                <button 
                    className="btn-icon-action" 
                    title="Editar Área"
                    onClick={() => abrirModal(area)}
                >
                    <Pencil size={16} />
                </button>
                
                <button 
                    className="btn-icon-action danger" 
                    title="Excluir Área"
                    onClick={() => excluirArea(area.idArea, area.nomeArea)}
                >
                    <Trash2 size={16} />
                </button>
            </div>

          </div>
        ))}
      </div>

      {/* --- MODAL MODERNO (Cadastro de Área) --- */}
      {modalAberto && (
        <div className="modal-modern-overlay">
            <div className="modal-modern-content">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <h2 className="modal-title">{editandoId ? 'Editar Área' : 'Nova Área'}</h2>
                    <button onClick={fecharModal} style={{border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8'}}>
                        <X size={24} />
                    </button>
                </div>
                <p className="modal-desc">Cadastre as informações do terreno para iniciar o monitoramento.</p>
                
                <form onSubmit={salvarArea}>
                    <div className="form-group">
                        <label className="form-label">Nome da Área</label>
                        <input 
                            className="form-input"
                            placeholder="Ex: Setor Norte" 
                            value={novaArea.nomeArea} 
                            onChange={e => setNovaArea({...novaArea, nomeArea: e.target.value})} 
                            required 
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label className="form-label">Tamanho (ha)</label>
                            <input 
                                type="number" 
                                className="form-input"
                                placeholder="0.0" 
                                value={novaArea.tamanhoArea} 
                                onChange={e => setNovaArea({...novaArea, tamanhoArea: e.target.value})} 
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Tipo de Solo</label>
                            <select 
                                className="form-select"
                                value={novaArea.tipoSolo} 
                                onChange={e => setNovaArea({...novaArea, tipoSolo: e.target.value})}
                            >
                                <option value="ARGILOSO">Argiloso</option>
                                <option value="ARENOSO">Arenoso</option>
                                <option value="HUMIFERO">Humífero</option>
                                <option value="CALCARIO">Calcário</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Localização</label>
                        <input 
                            className="form-input"
                            placeholder="Referência geográfica..." 
                            value={novaArea.localizacaoArea} 
                            onChange={e => setNovaArea({...novaArea, localizacaoArea: e.target.value})} 
                            required 
                        />
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-outline" onClick={fecharModal}>Cancelar</button>
                        <button type="submit" className="btn-primary">Salvar Área</button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};

export default Areas;