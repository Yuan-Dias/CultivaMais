import { useState, useEffect } from 'react';
import '../App.css';
import { 
    BarChart3, MapPin, Sprout, Droplets, Bug, 
    Calendar, AlertCircle
} from 'lucide-react';
import { 
    ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts';

// --- COMPONENTES AUXILIARES (Definidos FORA do componente principal) ---

// 1. StatCard Corrigido (Resolve erro do Icon undefined/unused)
const StatCard = (props) => {
    const { title, value, subtext, icon, colorClass } = props;
    const IconComponent = icon; // Atribui a uma variável com Letra Maiúscula

    return (
        <div className="kpi-card">
            <div className="kpi-header">
                <span className="kpi-title">{title}</span>
                <div className={`icon-box ${colorClass}`}>
                    {/* Renderiza apenas se o ícone existir */}
                    {IconComponent && <IconComponent size={20} />}
                </div>
            </div>
            <div>
                <div className="kpi-value">{value}</div>
                <div className="kpi-subtext">{subtext}</div>
            </div>
        </div>
    );
};

// 2. CustomTooltip Corrigido (Movido para fora para evitar recriação no render)
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{background: 'white', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}>
          <p style={{margin: 0, fontWeight: 600, color: '#334155'}}>{label}</p>
          <p style={{margin: 0, color: '#16a34a'}}>{`Cultivos: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
};

// --- COMPONENTE PRINCIPAL ---
const Relatorios = () => {
  const [areas, setAreas] = useState([]);
  const [cultivosDaArea, setCultivosDaArea] = useState([]);
  const [cultivoSelecionado, setCultivoSelecionado] = useState(null);
  
  // Dados dos Relatórios
  const [totalAgua, setTotalAgua] = useState(null);
  const [historicoPragas, setHistoricoPragas] = useState([]);
  
  // Dados para Gráficos Gerais
  const [graficoStatusArea, setGraficoStatusArea] = useState([]);

  // Cores
  const COLORS = { green: '#16a34a', blue: '#0ea5e9', red: '#ef4444', orange: '#f97316' };

  useEffect(() => {
    fetch('http://localhost:8090/api/areas')
      .then(res => res.json())
      .then(data => {
          setAreas(data);
          // Prepara dados iniciais para gráfico (ex: distribuição de cultivos por área)
          const dadosGrafico = data.map(a => ({
              name: a.nomeArea,
              cultivos: a.cultivos ? a.cultivos.length : 0
          }));
          setGraficoStatusArea(dadosGrafico);
      })
      .catch(err => console.error("Erro ao carregar áreas:", err));
  }, []);

  const selecionarArea = (idArea) => {
    const area = areas.find(a => a.idArea === parseInt(idArea));
    if (area) {
      setCultivosDaArea(area.cultivos || []);
      setCultivoSelecionado(null);
      setTotalAgua(null);
      setHistoricoPragas([]);
    } else {
      setCultivosDaArea([]);
    }
  };

  const analisarCultivo = (cultivo) => {
    setCultivoSelecionado(cultivo);

    // Busca Total de Água
    fetch(`http://localhost:8090/api/relatorios/agua/${cultivo.idCultivo}`)
      .then(res => res.json())
      .then(dado => setTotalAgua(dado))
      .catch(() => setTotalAgua(0)); // Fallback se der erro

    // Busca Histórico de Pragas
    fetch(`http://localhost:8090/api/relatorios/pragas/${cultivo.idCultivo}`)
      .then(res => res.json())
      .then(lista => setHistoricoPragas(lista))
      .catch(() => setHistoricoPragas([]));
  };

  return (
    <div className="animate-fade-in" style={{ padding: '0 10px' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
         <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Relatórios e Análises</h1>
         <p style={{ color: '#64748b', marginTop: '4px' }}>Visão detalhada do desempenho da sua fazenda.</p>
      </div>

      {/* --- PASSO 1: Seleção de Área e Visão Geral --- */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', marginBottom: '24px' }}>
          
          {/* Card de Filtro */}
          <div className="filter-card">
              <div className="filter-title"><MapPin size={18} className="text-primary"/> Selecione a Área</div>
              <select 
                  onChange={(e) => selecionarArea(e.target.value)} 
                  className="custom-select"
              >
                  <option value="">-- Escolha uma área --</option>
                  {areas.map(area => (
                      <option key={area.idArea} value={area.idArea}>
                          {area.nomeArea}
                      </option>
                  ))}
              </select>

              <div style={{ marginTop: '24px' }}>
                  <div className="filter-title"><Sprout size={18} className="text-primary"/> Cultivo Específico</div>
                  {cultivosDaArea.length > 0 ? (
                      <div className="cultivo-selection-grid">
                          {cultivosDaArea.map(cultivo => (
                              <button 
                                  key={cultivo.idCultivo}
                                  className={`cultivo-select-btn ${cultivoSelecionado?.idCultivo === cultivo.idCultivo ? 'selected' : ''}`}
                                  onClick={() => analisarCultivo(cultivo)}
                              >
                                  <strong>{cultivo.planta ? cultivo.planta.nomePopular : 'Desconhecida'}</strong>
                                  <span>{new Date(cultivo.dataPlantio).toLocaleDateString()}</span>
                              </button>
                          ))}
                      </div>
                  ) : (
                      <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>
                          Selecione uma área acima para ver os cultivos disponíveis.
                      </p>
                  )}
              </div>
          </div>

          {/* Gráfico Geral (Visível quando nenhum cultivo específico está selecionado) */}
          {!cultivoSelecionado && (
              <div className="chart-card-container">
                  <div className="chart-header">
                      <h3 className="chart-title"><BarChart3 size={20} className="text-primary"/> Ocupação das Áreas</h3>
                      <p className="chart-subtitle">Quantidade de cultivos ativos por setor.</p>
                  </div>
                  <div style={{ height: '300px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={graficoStatusArea}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} allowDecimals={false} />
                              <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
                              <Bar dataKey="cultivos" fill={COLORS.green} radius={[4, 4, 0, 0]} barSize={50} />
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
              </div>
          )}

          {/* --- PASSO 2: Detalhes do Cultivo Selecionado --- */}
          {cultivoSelecionado && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* KPIs do Cultivo */}
                  <div className="kpi-grid" style={{ marginBottom: 0 }}>
                      <StatCard 
                          title="Consumo de Água" 
                          value={`${totalAgua !== null ? totalAgua : 0} L`} 
                          subtext="Total acumulado" 
                          icon={Droplets} 
                          colorClass="bg-blue-light" 
                      />
                      <StatCard 
                          title="Saúde Atual" 
                          value={cultivoSelecionado.estadoPlanta} 
                          subtext="Status registrado" 
                          icon={cultivoSelecionado.estadoPlanta === 'SAUDAVEL' ? Sprout : Bug} 
                          colorClass={cultivoSelecionado.estadoPlanta === 'SAUDAVEL' ? 'bg-green-light' : 'bg-red-light'} 
                      />
                  </div>

                  {/* Detalhes e Histórico */}
                  <div className="chart-card-container">
                      <div className="chart-header">
                          <h3 className="chart-title" style={{ color: '#ef4444' }}>
                              <Bug size={20} /> Histórico de Ocorrências
                          </h3>
                          <p className="chart-subtitle">Registro de pragas e doenças neste cultivo.</p>
                      </div>

                      {historicoPragas.length === 0 ? (
                          <div className="empty-state-box">
                              <AlertCircle size={48} style={{ marginBottom: '16px', opacity: 0.5, color: '#16a34a' }} />
                              <p>Nenhuma ocorrência registrada.</p>
                              <p style={{ fontSize: '0.85rem' }}>A saúde deste cultivo está excelente!</p>
                          </div>
                      ) : (
                          <div className="pest-timeline">
                              {historicoPragas.map(praga => (
                                  <div key={praga.idEvento} className="pest-item">
                                      <div className="pest-icon-box">
                                          <AlertCircle size={20} />
                                      </div>
                                      <div className="pest-content">
                                          <h4>{praga.nomePragaOuDoenca}</h4>
                                          <span className="pest-date">
                                              <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                              {new Date(praga.dataHora).toLocaleString()}
                                          </span>
                                          <div style={{ marginTop: '6px' }}>
                                              <span className={`pest-level level-${praga.nivelAfetacao}`}>
                                                  Nível {praga.nivelAfetacao}
                                              </span>
                                          </div>
                                          {praga.observacaoEvento && (
                                              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '8px', fontStyle: 'italic' }}>
                                                  "{praga.observacaoEvento}"
                                              </p>
                                          )}
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              </div>
          )}

      </div>
    </div>
  );
};

export default Relatorios;