import { useState, useEffect } from 'react';
import '../App.css';
import {
    LayoutDashboard, Sprout, Map, Tractor, CloudSun,
    Activity, Bug, Droplets, ClipboardList, PieChart as IconeGrafico
} from 'lucide-react';
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

// --- COMPONENTE DE CARD DE RESUMO ---
const CardResumo = ({ titulo, valor, icone, cor }) => (
    <div className="lovable-card" style={{
        borderLeft: `6px solid ${cor}`,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: '20px'
    }}>
        <div style={{ backgroundColor: cor + '20', padding: '15px', borderRadius: '50%', color: cor, display: 'flex' }}>
            {icone}
        </div>
        <div>
            <div className="text-muted" style={{fontSize:'0.875rem', textTransform: 'uppercase'}}>{titulo}</div>
            <div className="stat-value" style={{fontSize: '2rem'}}>{valor}</div>
        </div>
    </div>
);

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('geral'); // Estado para controlar a aba ativa

    // Estados de Dados
    const [resumo, setResumo] = useState({
        totalAreas: 0, totalPlantas: 0, totalCultivos: 0, cultivosAtivos: 0
    });

    const [clima, setClima] = useState(null);
    const [nomeAreaClima, setNomeAreaClima] = useState('');

    // Dados processados para os gráficos
    const [graficoTipos, setGraficoTipos] = useState([]);
    const [graficoSaude, setGraficoSaude] = useState([]);
    const [graficoTarefas, setGraficoTarefas] = useState([]);

    // Cores do sistema
    const COLORS = {
        green: '#2e7d32', orange: '#f57f17', blue: '#0288d1', red: '#d32f2f', purple: '#7b1fa2'
    };
    const PIE_COLORS = [COLORS.green, COLORS.orange, COLORS.blue, COLORS.purple];

    useEffect(() => {
        const carregarDados = async () => {
            try {
                const [areasRes, plantasRes, cultivosRes, tarefasRes] = await Promise.all([
                    fetch('http://localhost:8090/api/areas'),
                    fetch('http://localhost:8090/api/plantas'),
                    fetch('http://localhost:8090/api/cultivos'),
                    fetch('http://localhost:8090/api/tarefas')
                ]);

                const areas = await areasRes.json();
                const plantas = await plantasRes.json();
                const cultivos = await cultivosRes.json();
                const tarefas = await tarefasRes.json();

                // 1. Resumo Geral
                setResumo({
                    totalAreas: areas.length,
                    totalPlantas: plantas.length,
                    totalCultivos: cultivos.length,
                    cultivosAtivos: cultivos.filter(c => c.statusCultivo === 'ATIVO').length
                });

                // 2. Gráfico: Tipos de Plantas (Pizza)
                const tiposCount = {};
                plantas.forEach(p => {
                    const tipo = p.tipoPlanta || 'OUTROS';
                    tiposCount[tipo] = (tiposCount[tipo] || 0) + 1;
                });
                setGraficoTipos(Object.keys(tiposCount).map(key => ({ name: key, value: tiposCount[key] })));

                // 3. Gráfico: Saúde dos Cultivos (Barra)
                // Filtra apenas os ativos para ver a saúde atual
                const ativos = cultivos.filter(c => c.statusCultivo === 'ATIVO');
                const saudeCount = {
                    'SAUDAVEL': 0, 'EM_ATENCAO': 0, 'COM_PRAGA': 0, 'CRITICO': 0
                };
                ativos.forEach(c => {
                    if (saudeCount[c.estadoPlanta] !== undefined) saudeCount[c.estadoPlanta]++;
                });

                setGraficoSaude([
                    { name: 'Saudável', valor: saudeCount['SAUDAVEL'], fill: COLORS.green },
                    { name: 'Atenção', valor: saudeCount['EM_ATENCAO'], fill: COLORS.orange },
                    { name: 'Praga', valor: saudeCount['COM_PRAGA'], fill: '#ef5350' }, // Vermelho claro
                    { name: 'Crítico', valor: saudeCount['CRITICO'], fill: COLORS.red }
                ]);

                // 4. Gráfico: Status das Tarefas (Pizza)
                const tarefasPendentes = tarefas.filter(t => !t.concluida).length;
                const tarefasConcluidas = tarefas.filter(t => t.concluida).length;
                setGraficoTarefas([
                    { name: 'Pendentes', value: tarefasPendentes },
                    { name: 'Concluídas', value: tarefasConcluidas }
                ]);

                // 5. Clima
                if (areas.length > 0) {
                    const areaPrincipal = areas[0];
                    setNomeAreaClima(areaPrincipal.nomeArea);
                    const climaRes = await fetch(`http://localhost:8090/api/areas/${areaPrincipal.idArea}/clima`);
                    if (climaRes.ok) setClima(await climaRes.json());
                }

            } catch (error) {
                console.error("Erro ao carregar dashboard:", error);
            }
        };

        carregarDados();
    }, []);

    return (
        <div className="lovable-container animate-fade-in">

            {/* Header */}
            <div className="lovable-header" style={{ marginBottom: '1rem' }}>
                <div>
                    <h1 className="lovable-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <LayoutDashboard color="#2e7d32" /> Dashboard
                    </h1>
                    <p className="lovable-subtitle">Visão estratégica da sua fazenda.</p>
                </div>
            </div>

            {/* --- NAVEGAÇÃO DE ABAS --- */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                <button
                    onClick={() => setActiveTab('geral')}
                    className={activeTab === 'geral' ? 'btn-lovable-primary' : 'btn-lovable-outline'}
                >
                    Visão Geral
                </button>
                <button
                    onClick={() => setActiveTab('saude')}
                    className={activeTab === 'saude' ? 'btn-lovable-primary' : 'btn-lovable-outline'}
                >
                    <Activity size={16} style={{marginRight: '5px'}}/> Saúde e Pragas
                </button>
                <button
                    onClick={() => setActiveTab('tarefas')}
                    className={activeTab === 'tarefas' ? 'btn-lovable-primary' : 'btn-lovable-outline'}
                >
                    <ClipboardList size={16} style={{marginRight: '5px'}}/> Operacional
                </button>
            </div>

            {/* ================= ABA 1: VISÃO GERAL ================= */}
            {activeTab === 'geral' && (
                <div className="anime-fade-in">
                    {/* Stats Principais */}
                    <div className="stats-grid">
                        <CardResumo titulo="Áreas Totais" valor={resumo.totalAreas} icone={<Map size={32} />} cor="#1976d2" />
                        <CardResumo titulo="Plantas no Catálogo" valor={resumo.totalPlantas} icone={<Sprout size={32} />} cor="#2e7d32" />
                        <CardResumo titulo="Cultivos Ativos" valor={resumo.cultivosAtivos} icone={<Tractor size={32} />} cor="#f57f17" />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                        {/* Gráfico de Tipos (Pizza) */}
                        <div className="lovable-card" style={{ borderLeft: '6px solid #2e7d32', flexDirection: 'column', minHeight: '300px' }}>
                            <h3 style={{ marginTop: 0, color: '#2e7d32', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <IconeGrafico /> O que plantamos?
                            </h3>
                            <div style={{ width: '100%', height: '250px' }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie data={graficoTipos} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                            {graficoTipos.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Clima */}
                        <div className="lovable-card" style={{ borderLeft: '6px solid #00bcd4', flexDirection: 'column' }}>
                            <h3 style={{ marginTop: 0, color: '#0097a7', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <CloudSun /> Clima Local
                            </h3>
                            {clima ? (
                                <div style={{ width: '100%', textAlign:'center', marginTop: '20px' }}>
                                    <p style={{ color: '#666', fontStyle: 'italic' }}>Referência: <strong>{nomeAreaClima}</strong></p>
                                    <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px' }}>
                                        <div>
                                            <span style={{ fontSize: '2rem', display: 'block', fontWeight: 'bold' }}>{clima.incidenciaSolarMedia}</span>
                                            <span style={{ fontSize: '0.8rem', color: '#666' }}>Sol (kWh/m²)</span>
                                        </div>
                                        <div>
                                            <span style={{ fontSize: '2rem', display: 'block', fontWeight: 'bold' }}>{clima.umidadeMedia}%</span>
                                            <span style={{ fontSize: '0.8rem', color: '#666' }}>Umidade</span>
                                        </div>
                                    </div>
                                </div>
                            ) : <p style={{ color: '#999', textAlign: 'center', marginTop: '30px' }}>Cadastre uma área para ver o clima.</p>}
                        </div>
                    </div>
                </div>
            )}

            {/* ================= ABA 2: SAÚDE E PRAGAS ================= */}
            {activeTab === 'saude' && (
                <div className="anime-fade-in">
                    <div className="lovable-card" style={{ borderLeft: '6px solid #d32f2f', flexDirection: 'column', minHeight: '400px' }}>
                        <h3 style={{ marginTop: 0, color: '#d32f2f', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Bug /> Monitoramento de Saúde (Cultivos Ativos)
                        </h3>
                        <p style={{color: '#666', fontSize: '0.9rem'}}>Quantidade de cultivos em cada estado de saúde.</p>

                        <div style={{ width: '100%', height: '300px', marginTop: '20px' }}>
                            <ResponsiveContainer>
                                <BarChart data={graficoSaude}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip cursor={{fill: 'transparent'}} />
                                    <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                                        {graficoSaude.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= ABA 3: OPERACIONAL (TAREFAS) ================= */}
            {activeTab === 'tarefas' && (
                <div className="anime-fade-in">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>

                        <div className="lovable-card" style={{ borderLeft: '6px solid #7b1fa2', flexDirection: 'column', minHeight: '300px' }}>
                            <h3 style={{ marginTop: 0, color: '#7b1fa2', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <ClipboardList /> Status das Tarefas
                            </h3>
                            <div style={{ width: '100%', height: '250px' }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie data={graficoTarefas} cx="50%" cy="50%" innerRadius={0} outerRadius={80} dataKey="value" label>
                                            <Cell fill="#fbbf24" /> {/* Pendentes - Amarelo */}
                                            <Cell fill="#16a34a" /> {/* Concluídas - Verde */}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="lovable-card" style={{ borderLeft: '6px solid #0288d1', flexDirection: 'column', justifyContent: 'center' }}>
                            <h3 style={{ marginTop: 0, color: '#0288d1', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Droplets /> Lembrete de Rega
                            </h3>
                            <p style={{fontSize: '1.1rem', color: '#333', lineHeight: '1.6'}}>
                                Lembre-se de verificar o relatório de consumo de água semanalmente para otimizar os custos de irrigação.
                            </p>
                            <div style={{marginTop: '20px', background: '#e1f5fe', padding: '15px', borderRadius: '8px', color: '#01579b'}}>
                                <strong>Dica:</strong> Solos <strong>ARGILOSOS</strong> retêm mais água, exigindo regas menos frequentes mas mais profundas.
                            </div>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};

export default Dashboard;