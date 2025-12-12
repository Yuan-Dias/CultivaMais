import { useState, useEffect, useMemo } from 'react';
import '../App.css';
import {
    LayoutDashboard, Sprout, Map as CloudSun,
    Activity, Bug, ClipboardList, PieChart as IconeGrafico,
    TrendingUp, Leaf, CheckCircle, AlertCircle,
    ChevronLeft, ChevronRight, Filter
} from 'lucide-react';
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, AreaChart, Area
} from 'recharts';

// --- COMPONENTES VISUAIS INTERNOS ---

const StatCard = (props) => {
    const { title, value, subtext, icon, colorClass } = props;
    const IconComponent = icon;

    return (
        <div className="kpi-card">
            <div className="kpi-header">
                <span className="kpi-title">{title}</span>
                <div className={`icon-box ${colorClass}`}>
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

// Container de Gráfico (Com correção de width/height)
const ChartCard = (props) => {
    const { title, subtitle, icon, children, headerControls } = props;
    const IconComponent = icon;

    return (
        <div className="chart-card-container" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div className="chart-header">
                <div style={{display: 'flex', flexDirection: 'column'}}>
                    <h3 className="chart-title">
                        {IconComponent && <IconComponent size={20} className="text-primary" />}
                        {title}
                    </h3>
                    {subtitle && <p className="chart-subtitle">{subtitle}</p>}
                </div>
                {headerControls && (
                    <div style={{ marginLeft: 'auto' }}>
                        {headerControls}
                    </div>
                )}
            </div>
            {/* Hack do width 99% e position relative para corrigir erro do Recharts */}
            <div style={{ position: 'relative', width: '99%', height: '400px', minHeight: '300px' }}>
                {children}
            </div>
        </div>
    );
};

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
                        {entry.name === 'plantado' ? 'Plantado' : entry.name === 'colhido' ? 'Colhido' : entry.name}:
                        <span style={{fontWeight: 600, marginLeft: '4px'}}>
                            {typeof entry.value === 'number' ? entry.value.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) : entry.value}
                            {(entry.name === 'plantado' || entry.name === 'colhido') ? ' kg' : ''}
                        </span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// --- FUNÇÃO AUXILIAR CRÍTICA ---
// Cria uma data local ignorando o fuso horário (UTC)
const criarDataLocal = (dataString) => {
    if (!dataString) return null;
    const [ano, mes, dia] = dataString.split('-').map(Number);
    return new Date(ano, mes - 1, dia); // Mês começa em 0 no JS
};

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('geral');

    // Estados de Dados Brutos
    const [rawCultivos, setRawCultivos] = useState([]);
    const [rawPlantas, setRawPlantas] = useState([]);
    const [rawAreas, setRawAreas] = useState([]);
    const [rawTarefas, setRawTarefas] = useState([]);

    // Estados dos KPIs e Gráficos Estáticos
    const [kpis, setKpis] = useState({ ativos: 0, saudaveis: 0, tarefasPendentes: 0, tarefasConcluidas: 0 });
    const [clima, setClima] = useState(null);
    const [nomeAreaClima, setNomeAreaClima] = useState('');
    const [graficoTipos, setGraficoTipos] = useState([]);
    const [graficoSaude, setGraficoSaude] = useState([]);
    const [graficoTarefas, setGraficoTarefas] = useState([]);
    const [sugestao, setSugestao] = useState({ area: '', planta: '', motivo: '' });

    // Estados para Gráfico de Produção Detalhado
    const [filtroTipo, setFiltroTipo] = useState('geral');
    const [filtroId, setFiltroId] = useState('');
    const [dataReferencia, setDataReferencia] = useState(new Date());

    const COLORS = { green: '#16a34a', orange: '#f59e0b', blue: '#0ea5e9', red: '#ef4444', purple: '#8b5cf6', gray: '#94a3b8' };
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
                    fetch('http://localhost:8090/api/areas').catch(err => ({ ok: false })),
                    fetch('http://localhost:8090/api/plantas').catch(err => ({ ok: false })),
                    fetch('http://localhost:8090/api/cultivos').catch(err => ({ ok: false })),
                    fetch('http://localhost:8090/api/tarefas').catch(err => ({ ok: false }))
                ]);

                const areas = areasRes.ok ? await areasRes.json() : [];
                const plantas = plantasRes.ok ? await plantasRes.json() : [];
                const cultivos = cultivosRes.ok ? await cultivosRes.json() : [];
                const tarefas = tarefasRes.ok ? await tarefasRes.json() : [];

                setRawAreas(areas);
                setRawPlantas(plantas);
                setRawCultivos(cultivos);
                setRawTarefas(tarefas);

                // 1. Processamento de KPIs
                const ativos = cultivos.filter(c => c.statusCultivo === 'ATIVO');
                const saudaveis = ativos.filter(c => c.estadoPlanta === 'SAUDAVEL').length;
                const pendentes = tarefas.filter(t => !t.concluida).length;
                const concluidas = tarefas.filter(t => t.concluida).length;

                setKpis({
                    ativos: ativos.length,
                    saudaveis: saudaveis,
                    tarefasPendentes: pendentes,
                    tarefasConcluidas: concluidas
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
                    { name: 'Praga', valor: saudeCount['COM_PRAGA'], fill: '#ef5350' },
                    { name: 'Crítico', valor: saudeCount['CRITICO'], fill: COLORS.red }
                ]);

                // 4. Gráfico Tarefas
                setGraficoTarefas([{ name: 'Pendentes', value: pendentes }, { name: 'Concluídas', value: concluidas }]);

                // 5. Clima e Sugestão
                if (areas.length > 0) {
                    const areaPrincipal = areas[0];
                    setNomeAreaClima(areaPrincipal.nomeArea);
                    const plantaIdeal = plantas.find(p => p.solosRecomendados && p.solosRecomendados.includes(areaPrincipal.tipoSolo));
                    if (plantaIdeal) {
                        setSugestao({ area: areaPrincipal.nomeArea, planta: plantaIdeal.nomePopular, motivo: `compatível com solo ${areaPrincipal.tipoSolo}` });
                    } else {
                        setSugestao({ area: areaPrincipal.nomeArea, planta: "Rotação de Culturas", motivo: "para recuperar nutrientes" });
                    }
                    const climaRes = await fetch(`http://localhost:8090/api/areas/${areaPrincipal.idArea}/clima`).catch(err => null);
                    if (climaRes && climaRes.ok) setClima(await climaRes.json());
                }

            } catch (error) { console.error("Erro ao carregar dashboard:", error); }
        };
        carregarDados();
    }, []);

    // --- LÓGICA DO GRÁFICO DINÂMICO DE PRODUÇÃO ---

    const alterarMes = (direcao) => {
        const novaData = new Date(dataReferencia);
        novaData.setMonth(novaData.getMonth() + (direcao === 'proximo' ? 1 : -1));
        setDataReferencia(novaData);
    };

    const dadosProducaoFiltrados = useMemo(() => {
        const mesesNomes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        const historicoMap = new Map();

        for (let i = 5; i >= 0; i--) {
            const d = new Date(dataReferencia.getFullYear(), dataReferencia.getMonth() - i, 1);
            const chave = `${mesesNomes[d.getMonth()]}/${d.getFullYear().toString().slice(2)}`;
            historicoMap.set(chave, { plantado: 0, colhido: 0 });
        }

        const cultivosFiltrados = rawCultivos.filter(c => {
            if (filtroTipo === 'geral') return true;
            if (filtroTipo === 'planta') return c.plantaCultivada && c.plantaCultivada.idPlanta.toString() === filtroId;
            if (filtroTipo === 'area') return c.areaCultivo && c.areaCultivo.idArea.toString() === filtroId;
            return true;
        });

        cultivosFiltrados.forEach(c => {
            // Lógica para Colhidos (Com correção de fuso)
            if (c.statusCultivo === 'COLHIDO' && c.dataColheitaFinal) {
                const dataColheita = criarDataLocal(c.dataColheitaFinal); // <-- USO DA FUNÇÃO SEGURA
                if (dataColheita) {
                    const chaveColheita = `${mesesNomes[dataColheita.getMonth()]}/${dataColheita.getFullYear().toString().slice(2)}`;
                    if (historicoMap.has(chaveColheita)) {
                        // Garante que é número para evitar erro de soma
                        const qtd = Number(c.quantidadeColhida) || 0;
                        historicoMap.get(chaveColheita).colhido += qtd;
                    }
                }
            }

            // Lógica para Plantados (Com correção de fuso)
            if (c.dataPlantio) {
                const dataPlantio = criarDataLocal(c.dataPlantio); // <-- USO DA FUNÇÃO SEGURA
                if (dataPlantio) {
                    const chavePlantio = `${mesesNomes[dataPlantio.getMonth()]}/${dataPlantio.getFullYear().toString().slice(2)}`;
                    if (historicoMap.has(chavePlantio)) {
                        const qtd = Number(c.quantidadePlantada) || 0;
                        historicoMap.get(chavePlantio).plantado += qtd;
                    }
                }
            }
        });

        return Array.from(historicoMap, ([label, values]) => ({
            name: label,
            plantado: values.plantado,
            colhido: values.colhido
        }));
    }, [rawCultivos, filtroTipo, filtroId, dataReferencia]);

    // Dados para Visão Geral (Mesma correção aplicada)
    const dadosVisaoGeral = useMemo(() => {
        const hoje = new Date();
        const mesesNomes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        const mapa = new Map();

        for (let i = 5; i >= 0; i--) {
            const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
            mapa.set(mesesNomes[d.getMonth()], { plantado: 0, colhido: 0 });
        }

        rawCultivos.forEach(c => {
            if (c.statusCultivo === 'COLHIDO' && c.dataColheitaFinal) {
                const d = criarDataLocal(c.dataColheitaFinal); // <-- Correção
                if (d) {
                    const mes = mesesNomes[d.getMonth()];
                    if (mapa.has(mes)) mapa.get(mes).colhido += (Number(c.quantidadeColhida) || 0);
                }
            }
            if (c.dataPlantio) {
                const d = criarDataLocal(c.dataPlantio); // <-- Correção
                if (d) {
                    const mes = mesesNomes[d.getMonth()];
                    if (mapa.has(mes)) mapa.get(mes).plantado += (Number(c.quantidadePlantada) || 0);
                }
            }
        });

        return Array.from(mapa, ([name, vals]) => ({ name, ...vals }));
    }, [rawCultivos]);


    return (
        <div className="animate-fade-in" style={{ padding: '0 10px' }}>

            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Dashboard</h1>
                <p style={{ color: '#64748b', marginTop: '4px' }}>Visão geral e indicadores do sistema Cultiva+.</p>
            </div>

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

            <div className="kpi-grid">
                <StatCard title="Cultivos Ativos" value={kpis.ativos} subtext="Monitorando em tempo real" icon={Sprout} colorClass="bg-green-light" />
                <StatCard title="Plantas Saudáveis" value={kpis.saudaveis} subtext={`${kpis.ativos > 0 ? Math.round((kpis.saudaveis / kpis.ativos) * 100) : 0}% do total ativo`} icon={CheckCircle} colorClass="bg-blue-light" />
                <StatCard title="Alertas Pendentes" value={kpis.tarefasPendentes} subtext="Tarefas não concluídas" icon={AlertCircle} colorClass="bg-red-light" />
                <StatCard title="Tarefas Concluídas" value={kpis.tarefasConcluidas} subtext="Histórico total" icon={ClipboardList} colorClass="bg-purple-light" />
            </div>

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

                {/* 1. VISÃO GERAL */}
                {activeTab === 'geral' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>

                        <ChartCard title="Tendência de Produção" subtitle="Visão macro (últimos 6 meses)" icon={TrendingUp}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dadosVisaoGeral}>
                                    <defs>
                                        <linearGradient id="colorColhido" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={COLORS.green} stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor={COLORS.green} stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="colhido" stroke={COLORS.green} strokeWidth={3} fillOpacity={1} fill="url(#colorColhido)" name="colhido" />
                                    <Area type="monotone" dataKey="plantado" stroke={COLORS.blue} strokeWidth={2} strokeDasharray="5 5" fill="none" name="plantado" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </ChartCard>

                        {/* Clima Card */}
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
                    <div style={{ width: '100%' }}>
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
                    <div style={{ width: '100%' }}>
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
                    <div style={{ width: '100%' }}>
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

                {/* 5. PRODUÇÃO */}
                {activeTab === 'producao' && (
                    <div style={{ width: '100%' }}>
                        <ChartCard
                            title="Análise de Produção Detalhada"
                            subtitle="Controle total de entradas e saídas"
                            icon={TrendingUp}
                            headerControls={
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <button
                                        onClick={() => alterarMes('anterior')}
                                        style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px', cursor: 'pointer' }}
                                    >
                                        <ChevronLeft size={16} color="#64748b"/>
                                    </button>

                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                        <Filter size={14} style={{ position: 'absolute', left: '8px', color: '#64748b' }} />
                                        <select
                                            value={filtroTipo}
                                            onChange={(e) => { setFiltroTipo(e.target.value); setFiltroId(''); }}
                                            style={{
                                                padding: '6px 8px 6px 28px',
                                                borderRadius: '6px',
                                                border: '1px solid #e2e8f0',
                                                fontSize: '0.85rem',
                                                color: '#475569',
                                                outline: 'none'
                                            }}
                                        >
                                            <option value="geral">Visão Geral</option>
                                            <option value="planta">Por Planta</option>
                                            <option value="area">Por Área</option>
                                        </select>
                                    </div>

                                    {filtroTipo !== 'geral' && (
                                        <select
                                            value={filtroId}
                                            onChange={(e) => setFiltroId(e.target.value)}
                                            style={{
                                                padding: '6px 12px',
                                                borderRadius: '6px',
                                                border: '1px solid #e2e8f0',
                                                fontSize: '0.85rem',
                                                color: '#475569',
                                                outline: 'none',
                                                maxWidth: '150px'
                                            }}
                                        >
                                            <option value="">Selecione...</option>
                                            {filtroTipo === 'planta'
                                                ? rawPlantas.map(p => <option key={p.idPlanta} value={p.idPlanta}>{p.nomePopular}</option>)
                                                : rawAreas.map(a => <option key={a.idArea} value={a.idArea}>{a.nomeArea}</option>)
                                            }
                                        </select>
                                    )}

                                    <button
                                        onClick={() => alterarMes('proximo')}
                                        style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px', cursor: 'pointer' }}
                                    >
                                        <ChevronRight size={16} color="#64748b"/>
                                    </button>
                                </div>
                            }
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={dadosProducaoFiltrados} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 14}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }}/>
                                    <Line name="colhido" type="monotone" dataKey="colhido" stroke={COLORS.green} strokeWidth={3} dot={{r:5, fill: COLORS.green}} activeDot={{r: 7}} />
                                    <Line name="plantado" type="monotone" dataKey="plantado" stroke={COLORS.blue} strokeWidth={2} strokeDasharray="5 5" dot={{r:4, fill: COLORS.blue}} />
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