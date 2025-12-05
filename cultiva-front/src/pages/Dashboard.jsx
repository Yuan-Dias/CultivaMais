import { useState, useEffect } from 'react';
import '../App.css';
import { LayoutDashboard, Sprout, Map, Tractor, CloudSun, PieChart as IconeGrafico } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- CORREÇÃO 1: Componente definido FORA do Dashboard ---
const CardResumo = ({ titulo, valor, icone, cor }) => (
  <div className="lovable-card"
  style={{
    display: 'flex',
    flexDirection: 'column',
    borderLeft: '6px solid #2e7d32',
    minHeight: '300px'
  }}>
  <div style={{ 
    backgroundColor: cor + '20', 
    padding: '15px', 
    borderRadius: '50%', 
    color: cor,
    display: 'flex'
  }}>
    {icone}
  </div>
  <div>
    <div className="text-muted" style={{fontSize:'0.875rem', textTransform: 'uppercase'}}>{titulo}</div>
    <div className="stat-value" style={{fontSize: '2rem'}}>{valor}</div>
  </div>
  </div>
);

const Dashboard = () => {
  const [resumo, setResumo] = useState({
    totalAreas: 0,
    totalPlantas: 0,
    totalCultivos: 0,
    cultivosAtivos: 0
  });

  const [clima, setClima] = useState(null);
  const [nomeAreaClima, setNomeAreaClima] = useState('');
  const [dadosGrafico, setDadosGrafico] = useState([]);

  const CORES = ['#2e7d32', '#f57f17', '#0288d1', '#fbc02d'];

  useEffect(() => {
    const carregarDados = async () => {
      try {
        // 1. Busca dados
        const [areasRes, plantasRes, cultivosRes] = await Promise.all([
          fetch('http://localhost:8090/api/areas'),
          fetch('http://localhost:8090/api/plantas'),
          fetch('http://localhost:8090/api/cultivos')
        ]);
  
        const areas = await areasRes.json();
        const plantas = await plantasRes.json();
        const cultivos = await cultivosRes.json();
  
        // 2. Calcula totais
        setResumo({
          totalAreas: areas.length,
          totalPlantas: plantas.length,
          totalCultivos: cultivos.length,
          cultivosAtivos: cultivos.filter(c => c.statusCultivo === 'ATIVO').length
        });
  
        // 3. Lógica do Gráfico
        const contagem = {};
        plantas.forEach(p => {
          const tipo = p.tipoPlanta || 'OUTROS';
          contagem[tipo] = (contagem[tipo] || 0) + 1;
        });
  
        const dadosFormatados = Object.keys(contagem).map(chave => ({
          name: chave,
          value: contagem[chave]
        }));
        setDadosGrafico(dadosFormatados);
  
        // 4. Busca Clima da primeira área
        if (areas.length > 0) {
          const areaPrincipal = areas[0];
          setNomeAreaClima(areaPrincipal.nomeArea);
          
          const climaRes = await fetch(`http://localhost:8090/api/areas/${areaPrincipal.idArea}/clima`);
          if (climaRes.ok) {
            const dadosClima = await climaRes.json();
            setClima(dadosClima);
          }
        }
  
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      }
    };

    carregarDados();
  }, []);

  return (
    <div className="lovable-container animate-fade-in">
      <div className="lovable-header">
        <div>
            <h1 className="lovable-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <LayoutDashboard color="#2e7d32" /> Visão Geral
            </h1>
            <p className="lovable-subtitle">Monitoramento em tempo real da sua fazenda.</p>
        </div>
      </div>

      {/* --- CORREÇÃO 2: Uso correto do componente no JSX --- */}
      <div className="stats-grid">
        <CardResumo titulo="Áreas Totais" valor={resumo.totalAreas} icone={<Map size={32} />} cor="#1976d2" />
        <CardResumo titulo="Plantas no Catálogo" valor={resumo.totalPlantas} icone={<Sprout size={32} />} cor="#2e7d32" />
        <CardResumo titulo="Cultivos Ativos" valor={resumo.cultivosAtivos} icone={<Tractor size={32} />} cor="#f57f17" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        
        {/* CARTÃO DO GRÁFICO */}
        <div className="lovable-card" style={{ borderLeft: '6px solid #2e7d32', flexDirection: 'column', minHeight: '300px', display: 'flex' }}>
            <h3 style={{ marginTop: 0, color: '#2e7d32', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <IconeGrafico /> Distribuição do Catálogo
            </h3>
            
            {dadosGrafico.length > 0 ? (
                <div style={{ width: '100%', height: '250px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={dadosGrafico}
                                cx="50%" cy="50%"
                                innerRadius={60} outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {dadosGrafico.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <p style={{color: '#999', textAlign: 'center', marginTop: '50px'}}>Cadastre plantas para ver o gráfico.</p>
            )}
        </div>

        {/* CARTÃO DE CLIMA */}
        <div className="lovable-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          borderLeft: '6px solid #00bcd4'
        }}>
          <h3 style={{ marginTop: 0, color: '#0097a7', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CloudSun /> Clima Atual
          </h3>
          
          {clima ? (
            <div style={{ width: '100%' }}>
              <p style={{ color: '#666', fontStyle: 'italic', marginBottom: '15px' }}>
                Referência: <strong>{nomeAreaClima}</strong>
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                <div>
                  <span style={{ fontSize: '1.5rem', display: 'block', fontWeight: 'bold' }}>{clima.incidenciaSolarMedia}</span>
                  <span style={{ fontSize: '0.8rem', color: '#666' }}>Sol (kWh/m²)</span>
                </div>
                <div>
                  <span style={{ fontSize: '1.5rem', display: 'block', fontWeight: 'bold' }}>{clima.umidadeMedia}%</span>
                  <span style={{ fontSize: '0.8rem', color: '#666' }}>Umidade</span>
                </div>
              </div>
            </div>
          ) : (
            <p style={{ color: '#999' }}>
              {resumo.totalAreas === 0 ? "Cadastre uma área para ver o clima." : "Carregando dados climáticos..."}
            </p>
          )}
        </div>
        
        {/* CARTÃO DE BOAS VINDAS */}
        <div className="lovable-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          borderLeft: '6px solid #8e24aa'
        }}>
          <h3 style={{ marginTop: 0, color: '#7b1fa2' }}>Bem-vindo ao Cultiva+!</h3>
          <p style={{ color: '#555', lineHeight: '1.6' }}>
            O seu sistema está totalmente operacional e conectado ao banco de dados.
            Utilize o menu lateral para gerir as suas plantações.
          </p>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;