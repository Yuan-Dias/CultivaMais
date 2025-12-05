import { useState, useEffect } from 'react';
import '../App.css';
import { Trash2, Plus, Sprout, Clock, Tag, Pencil } from 'lucide-react';

const Cultivos = () => {
  const [cultivos, setCultivos] = useState([]);
  const [areas, setAreas] = useState([]);
  const [plantas, setPlantas] = useState([]);

  const [editandoId, setEditandoId] = useState(null);
  const [novoCultivo, setNovoCultivo] = useState({
    idArea: '', 
    idPlanta: '', 
    quantidade: '', 
    dataPlantio: '',
    statusCultivo: 'ATIVO',
    estadoPlanta: 'SAUDAVEL',
    observacaoCultivo: ''
  });

  const [modalAberto, setModalAberto] = useState(false);

  const [acaoEvento, setAcaoEvento] = useState(null);
  const [dadosEvento, setDadosEvento] = useState({
    volume: '', metodo: 'GOTEJAMENTO',
    nome: '', nivel: 'BAIXO',
    obs: '', dataHora: ''          
  });

  const carregarTudo = () => {
    fetch('http://localhost:8090/api/areas').then(r => r.json()).then(setAreas);
    fetch('http://localhost:8090/api/plantas').then(r => r.json()).then(setPlantas);
    fetch('http://localhost:8090/api/cultivos').then(r => r.json()).then(setCultivos);
  };

  useEffect(() => {
    carregarTudo();
  }, []);

  const abrirModal = (cultivo = null) => {
    if (cultivo) {
      setEditandoId(cultivo.idCultivo);
      setNovoCultivo({
        idArea: cultivo.areaCultivo?.idArea || '',
        idPlanta: cultivo.plantaCultivada?.idPlanta || '',
        quantidade: cultivo.quantidadePlantada,
        dataPlantio: cultivo.dataPlantio,
        statusCultivo: cultivo.statusCultivo,
        estadoPlanta: cultivo.estadoPlanta,
        observacaoCultivo: cultivo.observacaoCultivo || ''
      });
    } else {
      setEditandoId(null);
      setNovoCultivo({ 
        idArea: '', idPlanta: '', quantidade: '', dataPlantio: '', 
        statusCultivo: 'ATIVO', estadoPlanta: 'SAUDAVEL', observacaoCultivo: '' 
      });
    }
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setEditandoId(null);
  };

  const salvarCultivo = (e) => {
    e.preventDefault();
    
    if (editandoId) {

      const corpoAtualizacao = {
        quantidadePlantada: novoCultivo.quantidade,
        dataPlantio: novoCultivo.dataPlantio,
        statusCultivo: novoCultivo.statusCultivo,
        estadoPlanta: novoCultivo.estadoPlanta,
        observacaoCultivo: novoCultivo.observacaoCultivo
      };

      fetch(`http://localhost:8090/api/cultivos/${editandoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corpoAtualizacao)
      }).then(handleResponse);

    } else {
      const url = `http://localhost:8090/api/cultivos?idPlanta=${novoCultivo.idPlanta}&idArea=${novoCultivo.idArea}&quantidadePlantada=${novoCultivo.quantidade}&dataPlantio=${novoCultivo.dataPlantio}`;
      fetch(url, { method: 'POST' }).then(handleResponse);
    }
  };

  const handleResponse = (res) => {
    if (res.ok) {
      alert(editandoId ? 'Cultivo atualizado!' : 'Cultivo iniciado com sucesso! 🚜');
      carregarTudo();
      fecharModal();
    } else {
      alert('Erro ao salvar. Verifique os dados.');
    }
  };

  const salvarEvento = (e) => {
    e.preventDefault();
    let url = '';
    if (acaoEvento.tipo === 'IRRIGACAO') {
      url = `http://localhost:8090/api/eventos/irrigacao?cultivoId=${acaoEvento.id}&volume=${dadosEvento.volume}&metodo=${dadosEvento.metodo}&obs=${dadosEvento.obs}&dataHora=${dadosEvento.dataHora}`;
    } else {
      url = `http://localhost:8090/api/eventos/praga?cultivoId=${acaoEvento.id}&nome=${dadosEvento.nome}&nivel=${dadosEvento.nivel}&obs=${dadosEvento.obs}&dataHora=${dadosEvento.dataHora}`;
    }

    fetch(url, { method: 'POST' })
      .then(res => {
        if (res.ok) {
          alert(acaoEvento.tipo === 'IRRIGACAO' ? 'Irrigação registada! 💧' : 'Praga reportada! 🐛');
          setAcaoEvento(null);
          setDadosEvento({ volume: '', metodo: 'GOTEJAMENTO', nome: '', nivel: 'BAIXO', obs: '', dataHora: '' });
        } else {
          alert('Erro ao registar evento.');
        }
      })
      .catch(err => alert("Erro de conexão: " + err));
  };

  const abrirEvento = (tipo, idCultivo) => {
    setAcaoEvento({ tipo, id: idCultivo });
    const agora = new Date();
    agora.setMinutes(agora.getMinutes() - agora.getTimezoneOffset());
    setDadosEvento(prev => ({ ...prev, dataHora: agora.toISOString().slice(0, 16) }));
  };

  const excluirCultivo = (id) => {
    if (confirm("Tem a certeza que deseja remover este cultivo e todo o seu histórico?")) {
        fetch(`http://localhost:8090/api/cultivos/${id}`, { method: 'DELETE' })
            .then(res => {
                if (res.ok) {
                    carregarTudo();
                } else {
                    alert("Erro ao remover.");
                }
            })
            .catch(err => alert("Erro de conexão: " + err));
    }
  };

  const getStatusBadge = (status) => status === 'ATIVO' ? 'badge-green' : 'badge-gray';

  return (
    <div className="anime-fade-in">
      <h1 className="titulo" style={{textAlign: 'left'}}>Controle de Cultivos</h1>

      <div style={{marginBottom: '20px'}}>
        <button className="btn-primary" onClick={() => abrirModal()}>
            <Plus size={20} /> Novo Plantio
        </button>
      </div>

      <div className="grid-areas">
        {cultivos.map(cultivo => (
          <div key={cultivo.idCultivo} className="card" style={{borderLeft: '6px solid #f57f17', flexDirection: 'column', alignItems: 'flex-start', position: 'relative'}}>
            
            <div style={{position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '8px'}}>
                <button 
                    onClick={() => abrirModal(cultivo)}
                    style={{border: 'none', background: 'transparent', color: '#1976d2', cursor: 'pointer'}}
                    title="Editar Cultivo"
                >
                    <Pencil size={18} />
                </button>
                <button 
                    onClick={() => excluirCultivo(cultivo.idCultivo)}
                    style={{border: 'none', background: 'transparent', color: '#d32f2f', cursor: 'pointer'}}
                    title="Excluir Cultivo"
                >
                    <Trash2 size={18} />
                </button>
            </div>

            <div style={{width: '100%', marginBottom: '15px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <h2 style={{ margin: '0', color: '#333', paddingRight: '60px' }}>{cultivo.planta ? cultivo.planta.nomePopular : 'Desconhecida'}</h2>
              </div>
              <span className={`badge ${getStatusBadge(cultivo.statusCultivo)}`} style={{marginTop:'10px', display:'inline-block'}}>
                    {cultivo.statusCultivo}
              </span>
              <p style={{color: '#666', margin: '10px 0 5px 0'}}>📍 {cultivo.areaCultivo ? cultivo.areaCultivo.nomeArea : '?'}</p>
              <p style={{color: '#666', margin: '5px 0'}}>📅 Plantio: {cultivo.dataPlantio} | 🏁 Previsão: <strong>{cultivo.previsaoColheita}</strong></p>
              {cultivo.observacaoCultivo && <p style={{color: '#666', fontSize: '0.85rem', fontStyle: 'italic'}}>📝 {cultivo.observacaoCultivo}</p>}
            </div>

            <div style={{display: 'flex', gap: '10px', width: '100%'}}>
                <button className="botao-ver" style={{backgroundColor: '#0288d1', flex: 1}} onClick={() => abrirEvento('IRRIGACAO', cultivo.idCultivo)}>
                    💧 Regar
                </button>
                <button className="botao-ver" style={{backgroundColor: '#d32f2f', flex: 1}} onClick={() => abrirEvento('PRAGA', cultivo.idCultivo)}>
                    🐛 Praga
                </button>
            </div>

            {acaoEvento && acaoEvento.id === cultivo.idCultivo && (
                <div style={{marginTop: '15px', padding: '15px', background: '#f9f9f9', borderRadius: '8px', width: '100%', border: '1px solid #ddd'}}>
                    <h4 style={{marginTop: 0, color: acaoEvento.tipo === 'IRRIGACAO' ? '#0288d1' : '#d32f2f'}}>
                        {acaoEvento.tipo === 'IRRIGACAO' ? 'Registar Irrigação' : 'Reportar Praga'}
                    </h4>
                    <form onSubmit={salvarEvento}>
                        {acaoEvento.tipo === 'IRRIGACAO' ? (
                            <>
                                <input type="number" placeholder="Volume (Litros)" required style={{width: '100%', marginBottom: '10px', padding: '8px'}}
                                    value={dadosEvento.volume} onChange={e => setDadosEvento({...dadosEvento, volume: e.target.value})} />
                                <select style={{width: '100%', marginBottom: '10px', padding: '8px'}}
                                    value={dadosEvento.metodo} onChange={e => setDadosEvento({...dadosEvento, metodo: e.target.value})}>
                                    <option value="GOTEJAMENTO">Gotejamento</option>
                                    <option value="ASPERSAO">Aspersão</option>
                                    <option value="MANUAL">Manual</option>
                                </select>
                            </>
                        ) : (
                            <>
                                <input type="text" placeholder="Nome da Praga/Doença" required style={{width: '100%', marginBottom: '10px', padding: '8px'}}
                                    value={dadosEvento.nome} onChange={e => setDadosEvento({...dadosEvento, nome: e.target.value})} />
                                <select style={{width: '100%', marginBottom: '10px', padding: '8px'}}
                                    value={dadosEvento.nivel} onChange={e => setDadosEvento({...dadosEvento, nivel: e.target.value})}>
                                    <option value="BAIXO">Baixo</option>
                                    <option value="MEDIO">Médio</option>
                                    <option value="ALTO">Alto</option>
                                    <option value="CRITICO">Crítico</option>
                                </select>
                            </>
                        )}
                        <input type="datetime-local" required style={{width: '100%', marginBottom: '10px', padding: '8px'}}
                            value={dadosEvento.dataHora} onChange={e => setDadosEvento({...dadosEvento, dataHora: e.target.value})} />
                        <div style={{display: 'flex', gap: '5px'}}>
                            <button type="submit" className="botao-salvar" style={{backgroundColor: '#2e7d32'}}>Salvar</button>
                            <button type="button" className="botao-salvar" style={{backgroundColor: '#666'}} onClick={() => setAcaoEvento(null)}>Cancelar</button>
                        </div>
                    </form>
                </div>
            )}
          </div>
        ))}
      </div>

      {modalAberto && (
        <div className="modal-overlay">
            <div className="modal-content-modern">
                <h2 style={{marginTop: 0, marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 600, color: '#0f172a'}}>
                    {editandoId ? 'Editar Cultivo' : 'Novo Plantio'}
                </h2>
                <form onSubmit={salvarCultivo}>
                    
                    {!editandoId && (
                        <div className="campo-grupo">
                            <select value={novoCultivo.idArea} onChange={e => setNovoCultivo({...novoCultivo, idArea: e.target.value})} required style={{width: '100%', marginBottom: '10px', padding: '8px'}}>
                                <option value="">Selecione a Área...</option>
                                {areas.map(area => <option key={area.idArea} value={area.idArea}>{area.nomeArea}</option>)}
                            </select>
                            <select value={novoCultivo.idPlanta} onChange={e => setNovoCultivo({...novoCultivo, idPlanta: e.target.value})} required style={{width: '100%', marginBottom: '10px', padding: '8px'}}>
                                <option value="">Selecione a Planta...</option>
                                {plantas.map(planta => <option key={planta.idPlanta} value={planta.idPlanta}>{planta.nomePopular}</option>)}
                            </select>
                        </div>
                    )}

                    <div className="campo-grupo">
                        <input type="number" placeholder="Quantidade" value={novoCultivo.quantidade} onChange={e => setNovoCultivo({...novoCultivo, quantidade: e.target.value})} required style={{width: '100%', marginBottom: '10px', padding: '8px'}} />
                        <input type="date" value={novoCultivo.dataPlantio} onChange={e => setNovoCultivo({...novoCultivo, dataPlantio: e.target.value})} required style={{width: '100%', marginBottom: '10px', padding: '8px'}} />
                    </div>

                    {editandoId && (
                        <>
                            <label style={{fontSize: '0.8rem', color: '#666'}}>Status</label>
                            <select value={novoCultivo.statusCultivo} onChange={e => setNovoCultivo({...novoCultivo, statusCultivo: e.target.value})} style={{width: '100%', marginBottom: '10px', padding: '8px'}}>
                                <option value="ATIVO">Ativo</option>
                                <option value="COLHIDO">Colhido</option>
                                <option value="CANCELADO">Cancelado</option>
                            </select>

                            <label style={{fontSize: '0.8rem', color: '#666'}}>Observação</label>
                            <input type="text" placeholder="Ex: Crescimento lento..." value={novoCultivo.observacaoCultivo} onChange={e => setNovoCultivo({...novoCultivo, observacaoCultivo: e.target.value})} style={{width: '100%', marginBottom: '10px', padding: '8px'}} />
                        </>
                    )}

                    <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px'}}>
                        <button type="button" className="btn-outline" onClick={fecharModal}>Cancelar</button>
                        <button type="submit" className="btn-primary">
                            {editandoId ? 'Atualizar' : 'Iniciar Cultivo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};

export default Cultivos;