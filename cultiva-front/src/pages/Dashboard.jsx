import { useState, useEffect } from 'react';
import '../App.css';
import {
    LayoutDashboard, Sprout, Map as CloudSun,
    Activity, Bug, ClipboardList, PieChart as IconeGrafico,
    TrendingUp, Leaf, CheckCircle, AlertCircle
} from 'lucide-react';
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line
} from 'recharts';

// --- COMPONENTES VISUAIS INTERNOS ---

// Card de Estatística
const StatCard = (props) => {
    // Extraímos as props manualmente para evitar confusão do linter
    const { title, value, subtext, icon, colorClass } = props;
    
    // Atribuímos a uma variável com Letra Maiúscula para o React renderizar
    const IconComponent = icon; 

    return (
        <div className="kpi-card">
            <div className="kpi-header">
                <span className="kpi-title">{title}</span>
                <div className={`icon-box ${colorClass}`}>
                    {/* Verificamos se o ícone existe antes de renderizar */}
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

// Container de Gráfico
const ChartCard = (props) => {
    const { title, subtitle, icon, children } = props;
    
    // Mesma lógica aqui
    const IconComponent = icon;

    return (
        <div className="chart-card-container">
            <div className="chart-header">
                <h3 className="chart-title">
                    {IconComponent && <IconComponent size={20} className="text-primary" />}
                    {title}
                </h3>
                {subtitle && <p className="chart-subtitle">{subtitle}</p>}
            </div>
            <div style={{ flex: 1, minHeight: '300px' }}>
                {children}
            </div>
        </div>
    );
};

// Custom Tooltip para Gráficos (Visual Limpo)
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ 
                backgroundColor: 'white', 
                border: '1px solid #e2e8f0', 
                padding: '12px', 
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
                <p style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '4px', color: '#1e293b' }}>{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} style={{ color: entry.color, fontSize: '0.85rem', margin: 0 }}>
                        {entry.name}: <span style={{fontWeight: 600}}>{entry.value}</span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('geral');

    // Estados de Dados
    const [kpis, setKpis] = useState({ 
        ativos: 0, 
        saudaveis: 0, 
        tarefasPendentes: 0, 
        tarefasConcluidas: 0,
        totalAreas: 0
    });
    
    const [clima, setClima] = useState(null);
    const [nomeAreaClima, setNomeAreaClima] = useState('');

    // Dados dos Gráficos
    const [graficoTipos, setGraficoTipos] = useState([]);
    const [graficoSaude, setGraficoSaude] = useState([]);
    const [graficoTarefas, setGraficoTarefas] = useState([]);
    const [graficoProducao, setGraficoProducao] = useState([]);
    
    // Sugestão
    const [sugestao, setSugestao] = useState({ area: '', planta: '', motivo: '' });

    // Cores (Mantidas mas aplicadas ao estilo novo)
    const COLORS = { green: '#16a34a', orange: '#f59e0b', blue: '#0ea5e9', red: '#ef4444', purple: '#8b5cf6' };
    const PIE_COLORS = [COLORS.green, COLORS.orange, COLORS.blue, COLORS.purple];

    const tabs = [
        { id: 'geral', label: 'Visão Geral', icon: <LayoutDashboard size={18}/> },
        { id: 'catalogo', label: 'Catálogo', icon: <Leaf size={18}/> },
        { id: 'saude', label: 'Saúde', icon: <Activity size={18}/> },
        { id: 'tarefas', label: 'Tarefas', icon: <ClipboardList size={18}/> },
        { id: 'producao', label: 'Produção', icon: <TrendingUp size={18}/> },
    ];

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

                // 1. Processamento de KPIs (Dados para os Cards do Topo)
                const ativos = cultivos.filter(c => c.statusCultivo === 'ATIVO');
                const saudaveis = ativos.filter(c => c.estadoPlanta === 'SAUDAVEL').length;
                const pendentes = tarefas.filter(t => !t.concluida).length;
                const concluidas = tarefas.filter(t => t.concluida).length;

                setKpis({
                    ativos: ativos.length,
                    saudaveis: saudaveis,
                    tarefasPendentes: pendentes,
                    tarefasConcluidas: concluidas,
                    totalAreas: areas.length
                });

                // 2. Gráfico Tipos
                const tiposCount = {};
                plantas.forEach(p => { const t = p.tipoPlanta || 'OUTROS'; tiposCount[t] = (tiposCount[t] || 0) + 1; });
                setGraficoTipos(Object.keys(tiposCount).map(key => ({ name: key, value: tiposCount[key] })));

                // 3. Gráfico Saúde
                const saudeCount = { 'SAUDAVEL': 0, 'EM_ATENCAO': 0, 'COM_PRAGA': 0, 'CRITICO': 0 };
                ativos.forEach(c => { if (saudeCount[c.estadoPlanta] !== undefined) saudeCount[c.estadoPlanta]++; });
                setGraficoSaude([
                    { name: 'Saudável', valor: saudeCount['SAUDAVEL'], fill: COLORS.green },
                    { name: 'Atenção', valor: saudeCount['EM_ATENCAO'], fill: COLORS.orange },
                    { name: 'Praga', valor: saudeCount['COM_PRAGA'], fill: '#ef5350' }, // Um pouco mais suave que red puro
                    { name: 'Crítico', valor: saudeCount['CRITICO'], fill: COLORS.red }
                ]);

                // 4. Gráfico Tarefas
                setGraficoTarefas([{ name: 'Pendentes', value: pendentes }, { name: 'Concluídas', value: concluidas }]);

                // 5. Gráfico Produção
                const historicoMap = new Map();
                const hoje = new Date();
                const mesesNomes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

                for (let i = 5; i >= 0; i--) {
                    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
                    const chaveMes = mesesNomes[d.getMonth()];
                    historicoMap.set(chaveMes, 0);
                }

                cultivos.filter(c => c.statusCultivo === 'COLHIDO' && c.dataColheitaFinal).forEach(c => {
                    const dataColheita = new Date(c.dataColheitaFinal);
                    const mesNome = mesesNomes[dataColheita.getMonth()];
                    if (historicoMap.has(mesNome)) {
                        historicoMap.set(mesNome, historicoMap.get(mesNome) + c.quantidadeColhida);
                    }
                });

                setGraficoProducao(Array.from(historicoMap, ([month, value]) => ({ month, value })));

                // 6. Lógica de Sugestão e Clima
                if (areas.length > 0) {
                    const areaPrincipal = areas[0];
                    setNomeAreaClima(areaPrincipal.nomeArea);

                    const plantaIdeal = plantas.find(p => p.solosRecomendados && p.solosRecomendados.includes(areaPrincipal.tipoSolo));

                    if (plantaIdeal) {
                        setSugestao({
                            area: areaPrincipal.nomeArea,
                            planta: plantaIdeal.nomePopular,
                            motivo: `compatível com solo ${areaPrincipal.tipoSolo}`
                        });
                    } else {
                        setSugestao({ area: areaPrincipal.nomeArea, planta: "Rotação de Culturas", motivo: "para recuperar nutrientes" });
                    }

                    const climaRes = await fetch(`http://localhost:8090/api/areas/${areaPrincipal.idArea}/clima`);
                    if (climaRes.ok) setClima(await climaRes.json());
                }

            } catch (error) { console.error("Erro ao carregar dashboard:", error); }
        };
        carregarDados();
    }, []);

    return (
        <div className="animate-fade-in" style={{ padding: '0 10px' }}>

            {/* Header Moderno */}
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Dashboard</h1>
                <p style={{ color: '#64748b', marginTop: '4px' }}>Visão geral e indicadores do sistema Cultiva+.</p>
            </div>

            {/* Banner de Sugestão Inteligente (Aparece em Geral) */}
            {activeTab === 'geral' && (
                <div className="modern-banner">
                    <div className="icon-box bg-green-light" style={{ width: '40px', height: '40px' }}>
                        <Sprout size={24} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: '0 0 4px 0', color: '#0f172a' }}>
                            💡 Sugestão Inteligente
                        </h3>
                        <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.5', margin: '0 0 12px 0' }}>
                            Com base no solo da área <strong>{sugestao.area}</strong>, recomendamos o plantio de <strong>{sugestao.planta}</strong>, 
                            pois é {sugestao.motivo}.
                        </p>
                        <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                            Ver Detalhes do Plantio
                        </button>
                    </div>
                </div>
            )}

            {/* Grid de KPIs (Os cards do topo) */}
            {/* Nota: Adaptamos os dados reais para preencher os cards como no exemplo Lovable */}
            <div className="kpi-grid">
                <StatCard 
                    title="Cultivos Ativos" 
                    value={kpis.ativos} 
                    subtext="Monitorando em tempo real" 
                    icon={Sprout} 
                    colorClass="bg-green-light" 
                />
                <StatCard 
                    title="Plantas Saudáveis" 
                    value={kpis.saudaveis} 
                    subtext={`${kpis.ativos > 0 ? Math.round((kpis.saudaveis / kpis.ativos) * 100) : 0}% do total ativo`} 
                    icon={CheckCircle} 
                    colorClass="bg-blue-light" 
                />
                <StatCard 
                    title="Alertas Pendentes" 
                    value={kpis.tarefasPendentes} 
                    subtext="Tarefas não concluídas" 
                    icon={AlertCircle} 
                    colorClass="bg-red-light" 
                />
                <StatCard 
                    title="Tarefas Concluídas" 
                    value={kpis.tarefasConcluidas} 
                    subtext="Histórico total" 
                    icon={ClipboardList} 
                    colorClass="bg-purple-light" 
                />
            </div>

            {/* Navegação de Abas */}
            <div className="tabs-container">
                {tabs.map(tab => (
                    <div
                        key={tab.id}
                        className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.icon} {tab.label}
                    </div>
                ))}
            </div>

            {/* ================= CONTEÚDO DAS ABAS ================= */}
            
            <div className="tab-content" style={{ paddingBottom: '40px' }}>
                
                {/* 1. VISÃO GERAL (Resumo Gráfico + Clima) */}
                {activeTab === 'geral' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                        
                        <ChartCard title="Produção Recente" subtitle="Colheitas dos últimos 6 meses" icon={TrendingUp}>
                             <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={graficoProducao}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line type="monotone" dataKey="value" stroke={COLORS.green} strokeWidth={3} dot={{r:4, fill: COLORS.green}} activeDot={{r: 6}} />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartCard>

                        <ChartCard title="Clima Local" subtitle={`Referência: ${nomeAreaClima || 'Nenhuma área'}`} icon={CloudSun}>
                             {clima ? (
                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', gap: '30px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#f59e0b' }}>{clima.incidenciaSolarMedia}</div>
                                            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Incidência Solar (kWh/m²)</div>
                                        </div>
                                        <div style={{ width: '1px', height: '60px', backgroundColor: '#e2e8f0' }}></div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#0ea5e9' }}>{clima.umidadeMedia}%</div>
                                            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Umidade do Ar</div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>
                                        Dados atualizados da estação meteorológica local.
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                                    Cadastre uma área para visualizar dados climáticos.
                                </div>
                            )}
                        </ChartCard>

                    </div>
                )}

                {/* 2. CATÁLOGO */}
                {activeTab === 'catalogo' && (
                     <div style={{ height: '500px' }}>
                        <ChartCard title="Distribuição do Catálogo" subtitle="Tipos de plantas cadastradas" icon={IconeGrafico}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={graficoTipos} cx="50%" cy="50%" innerRadius={80} outerRadius={140} paddingAngle={5} dataKey="value">
                                        {graficoTipos.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} strokeWidth={0} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartCard>
                     </div>
                )}

                {/* 3. SAÚDE */}
                {activeTab === 'saude' && (
                    <div style={{ height: '500px' }}>
                        <ChartCard title="Saúde dos Cultivos" subtitle="Monitoramento de pragas e doenças" icon={Bug}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={graficoSaude} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 14}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                                    <Tooltip content={<CustomTooltip />} cursor={{fill: '#f1f5f9'}} />
                                    <Bar dataKey="valor" radius={[8, 8, 0, 0]} barSize={60}>
                                        {graficoSaude.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    </div>
                )}

                {/* 4. TAREFAS */}
                {activeTab === 'tarefas' && (
                    <div style={{ height: '500px' }}>
                        <ChartCard title="Status das Tarefas" subtitle="Progresso das atividades operacionais" icon={ClipboardList}>
                             <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={graficoTarefas} cx="50%" cy="50%" innerRadius={0} outerRadius={140} dataKey="value" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                        <Cell fill="#fbbf24" name="Pendentes" />
                                        <Cell fill="#16a34a" name="Concluídas" />
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    </div>
                )}

                {/* 5. PRODUÇÃO (Detalhada) */}
                {activeTab === 'producao' && (
                     <div style={{ height: '500px' }}>
                        <ChartCard title="Histórico de Produção" subtitle="Quantidade colhida mês a mês" icon={TrendingUp}>
                             <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={graficoProducao} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 14}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line type="natural" dataKey="value" stroke={COLORS.green} strokeWidth={4} dot={{r:6, fill: COLORS.green}} activeDot={{r: 8}} />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartCard>
                     </div>
                )}

            </div>
        </div>
    );
};

export default Dashboard;