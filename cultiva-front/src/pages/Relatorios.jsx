import { useState, useEffect } from 'react';
import '../App.css';

const Relatorios = () => {
  const [areas, setAreas] = useState([]);
  const [cultivosDaArea, setCultivosDaArea] = useState([]);
  const [cultivoSelecionado, setCultivoSelecionado] = useState(null);
  
  // Dados dos Relatórios
  const [totalAgua, setTotalAgua] = useState(null);
  const [historicoPragas, setHistoricoPragas] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8090/api/areas')
      .then(res => res.json())
      .then(data => setAreas(data))
      .catch(err => console.error("Erro ao carregar áreas:", err));
  }, []);

  const selecionarArea = (idArea) => {
    const area = areas.find(a => a.idArea === parseInt(idArea));
    if (area) {
      setCultivosDaArea(area.cultivos || []);
      setCultivoSelecionado(null); // Limpa a seleção anterior
      setTotalAgua(null);
      setHistoricoPragas([]);
    }
  };

  const analisarCultivo = (cultivo) => {
    setCultivoSelecionado(cultivo);

    fetch(`http://localhost:8090/api/relatorios/agua/${cultivo.idCultivo}`)
      .then(res => res.json())
      .then(dado => setTotalAgua(dado));

    fetch(`http://localhost:8090/api/relatorios/pragas/${cultivo.idCultivo}`)
      .then(res => res.json())
      .then(lista => setHistoricoPragas(lista));
  };

  return (
    <div className="anime-fade-in">
      <h1 className="titulo" style={{textAlign: 'left'}}>📈 Relatórios e Análises</h1>

      <div className="card" style={{borderLeft: '6px solid #1976d2', marginBottom: '20px'}}>
        <h3>1º Selecione a Área:</h3>
        <select onChange={(e) => selecionarArea(e.target.value)} style={{padding: '10px', fontSize: '1rem', width: '100%'}}>
            <option value="">-- Escolha uma área --</option>
            {areas.map(area => (
                <option key={area.idArea} value={area.idArea}>
                    {area.nomeArea} ({area.cultivos ? area.cultivos.length : 0} cultivos)
                </option>
            ))}
        </select>
      </div>

      <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap'}}>
        
        <div style={{flex: 1, minWidth: '300px'}}>
            {cultivosDaArea.length > 0 && (
                <div className="card">
                    <h3>2º Escolha o Cultivo:</h3>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                        {cultivosDaArea.map(cultivo => (
                            <button 
                                key={cultivo.idCultivo}
                                className="botao-ver"
                                style={{
                                    backgroundColor: cultivoSelecionado?.idCultivo === cultivo.idCultivo ? '#1976d2' : '#e0e0e0',
                                    color: cultivoSelecionado?.idCultivo === cultivo.idCultivo ? 'white' : '#333'
                                }}
                                onClick={() => analisarCultivo(cultivo)}
                            >
                                {cultivo.planta ? cultivo.planta.nomePopular : 'Desconhecida'} 
                                <span style={{fontSize: '0.8em', display: 'block'}}>Data: {cultivo.dataPlantio}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>

        <div style={{flex: 2, minWidth: '300px'}}>
            {cultivoSelecionado && (
                <div className="anime-fade-in">
                    
                    <div className="card" style={{borderLeft: '6px solid #0288d1', marginBottom: '15px'}}>
                        <h2 style={{color: '#0288d1', margin: 0}}>💧 Consumo de Água</h2>
                        <p style={{fontSize: '2rem', fontWeight: 'bold', margin: '10px 0'}}>
                            {totalAgua !== null ? totalAgua : '...'} <span style={{fontSize: '1rem', color: '#666'}}>litros totais</span>
                        </p>
                    </div>

                    <div className="card" style={{borderLeft: '6px solid #d32f2f'}}>
                        <h2 style={{color: '#d32f2f', margin: 0}}>🐞 Histórico de Pragas</h2>
                        
                        {historicoPragas.length === 0 ? (
                            <p style={{padding: '20px', color: '#666'}}>Nenhuma praga registrada. Saúde excelente! ✅</p>
                        ) : (
                            <ul style={{listStyle: 'none', padding: 0}}>
                                {historicoPragas.map(praga => (
                                    <li key={praga.idEvento} style={{
                                        background: '#ffebee', 
                                        padding: '10px', 
                                        margin: '10px 0', 
                                        borderRadius: '5px',
                                        borderLeft: '4px solid #d32f2f'
                                    }}>
                                        <strong>{praga.nomePragaOuDoenca}</strong> <span style={{fontSize: '0.8em'}}>({praga.dataHora})</span>
                                        <br/>
                                        Nível: <strong>{praga.nivelAfetacao}</strong>
                                        {praga.observacaoEvento && <p style={{margin: '5px 0 0 0', fontStyle: 'italic'}}>Obs: {praga.observacaoEvento}</p>}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default Relatorios;