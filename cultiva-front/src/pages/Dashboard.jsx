import { useState, useEffect, useMemo } from 'react';
import '../App.css';
import {
    LayoutDashboard, Sprout, Map as CloudSun,
    Activity, Bug, ClipboardList, PieChart as IconeGrafico,
    TrendingUp, Leaf, CheckCircle, AlertCircle,
    ChevronLeft, ChevronRight, Filter, Lightbulb, Sparkles, ArrowRight, X
} from 'lucide-react';
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, AreaChart, Area
} from 'recharts';

/**
 * Definições de Tipos (JSDoc)
 * @typedef {Object} Sugestao
 * @property {number} idArea
 * @property {number} idPlanta
 * @property {string} areaNome
 * @property {string} plantaNome
 * @property {string} tipoPlanta
 * @property {number} score
 * @property {string[]} motivos
 */

// --- COMPONENTES VISUAIS INTERNOS ---

const StatCard = ({ title, value, subtext, icon: Icon, colorClass }) => {
    return (
        <div className="kpi-card">
            <div className="kpi-header">
                <span className="kpi-title">{title}</span>
                <div className={`icon-box ${colorClass}`}>
                    {Icon && <Icon size={20} />}
                </div>
            </div>
            <div>
                <div className="kpi-value">{value}</div>
                <div className="kpi-subtext">{subtext}</div>
            </div>
        </div>
    );
};

const ChartCard = ({ title, subtitle, icon: Icon, children, headerControls }) => {
    return (
        <div className="chart-card-container" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div className="chart-header">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h3 className="chart-title">
                        {Icon && <Icon size={20} className="text-primary" />}
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
                        <span style={{ fontWeight: 600, marginLeft: '4px' }}>
                            {typeof entry.value === 'number' ? entry.value.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) : entry.value}
                        </span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const criarDataLocal = (dataString) => {
    if (!dataString) return null;
    const [ano, mes, dia] = dataString.split('-').map(Number);
    return new Date(ano, mes - 1, dia);
};

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('geral');

    // Estados de Dados
    const [rawCultivos, setRawCultivos] = useState([]);
    const [rawPlantas, setRawPlantas] = useState([]);
    const [rawAreas, setRawAreas] = useState([]);
    const [kpis, setKpis] = useState({ ativos: 0, saudaveis: 0, tarefasPendentes: 0, tarefasConcluidas: 0 });

    // Estados de Clima
    const [clima, setClima] = useState(null);
    const [idAreaClimaSelecionada, setIdAreaClimaSelecionada] = useState('');
    const [nomeAreaClima, setNomeAreaClima] = useState('');

    // Estados da IA / Sugestão
    const [sugestoesInteligentes, setSugestoesInteligentes] = useState([]);
    const [indiceSugestao, setIndiceSugestao] = useState(0);

    // --- ESTADOS DO MODAL DE PLANTIO RÁPIDO (NOVO) ---
    const [modalPlantioAberto, setModalPlantioAberto] = useState(false);
    const [dadosPlantioRapido, setDadosPlantioRapido] = useState({
        quantidadePlantada: '',
        dataPlantio: new Date().toISOString().split('T')[0]
    });

    // Estados Gráficos
    const [graficoTipos, setGraficoTipos] = useState([]);
    const [graficoSaude, setGraficoSaude] = useState([]);
    const [graficoTarefas, setGraficoTarefas] = useState([]);
    const [filtroTipo, setFiltroTipo] = useState('geral');
    const [filtroId, setFiltroId] = useState('');
    const [dataReferencia, setDataReferencia] = useState(new Date());

    const COLORS = { green: '#16a34a', orange: '#f59e0b', blue: '#0ea5e9', red: '#ef4444', purple: '#8b5cf6', gray: '#94a3b8' };
    const PIE_COLORS = [COLORS.green, COLORS.orange, COLORS.blue, COLORS.purple];

    const tabs = [
        { id: 'geral', label: 'Visão Geral', icon: <LayoutDashboard size={18} /> },
        { id: 'catalogo', label: 'Catálogo', icon: <Leaf size={18} /> },
        { id: 'saude', label: 'Saúde', icon: <Activity size={18} /> },
        { id: 'tarefas', label: 'Tarefas', icon: <ClipboardList size={18} /> },
        { id: 'producao', label: 'Produção', icon: <TrendingUp size={18} /> },
    ];

    // --- ALGORITMO DE SUGESTÃO (ATUALIZADO PARA INCLUIR IDs) ---
    const gerarSugestoesInteligentes = (areas, plantas, cultivos) => {
        const sugestoesCalculadas = [];
        const mapaLuz = { 'PLENO_SOL': ['ALTA'], 'MEIA_SOMBRA': ['MEDIA', 'BAIXA'], 'SOMBRA': ['BAIXA'] };

        // IDs ocupados
        const areasOcupadasIds = cultivos
            .filter(c => c.statusCultivo === 'ATIVO' && c.areaCultivo)
            .map(c => c.areaCultivo.idArea);

        const areasLivres = areas.filter(a => !areasOcupadasIds.includes(a.idArea));

        areasLivres.forEach(area => {
            let melhorPlanta = null;
            let maiorScore = -1;
            let motivosMelhor = [];

            plantas.forEach(planta => {
                let score = 0;
                let motivos = [];

                // Solo (Peso 50)
                if (planta.solosRecomendados && planta.solosRecomendados.includes(area.tipoSolo)) {
                    score += 50;
                    motivos.push(`Solo ideal (${area.tipoSolo})`);
                }

                // Luz (Peso 30)
                const luzArea = area.quantidadeLuz || 'PLENO_SOL';
                const luzNecessaria = planta.necessidadeLuz || 'ALTA';
                const compativeis = mapaLuz[luzArea] || [];
                if (compativeis.includes(luzNecessaria)) {
                    score += 30;
                    motivos.push(`Luz perfeita (${luzArea})`);
                }

                // Ciclo Rápido (Peso 10)
                if (planta.cicloMedioDias && planta.cicloMedioDias < 90) score += 10;

                if (score > maiorScore) {
                    maiorScore = score;
                    melhorPlanta = planta;
                    motivosMelhor = motivos;
                }
            });

            if (melhorPlanta && maiorScore > 0) {
                sugestoesCalculadas.push({
                    idArea: area.idArea,             // NOVO: ID necessário para o POST
                    idPlanta: melhorPlanta.idPlanta, // NOVO: ID necessário para o POST
                    areaNome: area.nomeArea,
                    plantaNome: melhorPlanta.nomePopular,
                    tipoPlanta: melhorPlanta.tipoPlanta,
                    score: maiorScore,
                    motivos: motivosMelhor
                });
            }
        });

        return sugestoesCalculadas.sort((a, b) => b.score - a.score);
    };

    const carregarDadosGerais = async () => {
        try {
            const [areasRes, plantasRes, cultivosRes, tarefasRes] = await Promise.all([
                fetch('http://localhost:8090/api/areas').catch(() => ({ ok: false })),
                fetch('http://localhost:8090/api/plantas').catch(() => ({ ok: false })),
                fetch('http://localhost:8090/api/cultivos').catch(() => ({ ok: false })),
                fetch('http://localhost:8090/api/tarefas').catch(() => ({ ok: false }))
            ]);

            const areas = areasRes.ok ? await areasRes.json() : [];
            const plantas = plantasRes.ok ? await plantasRes.json() : [];
            const cultivos = cultivosRes.ok ? await cultivosRes.json() : [];
            const tarefas = tarefasRes.ok ? await tarefasRes.json() : [];

            setRawAreas(areas);
            setRawPlantas(plantas);
            setRawCultivos(cultivos);

            const sugestoesGeradas = gerarSugestoesInteligentes(areas, plantas, cultivos);
            setSugestoesInteligentes(sugestoesGeradas);

            if (areas.length > 0) setIdAreaClimaSelecionada(areas[0].idArea);

            const ativos = cultivos.filter(c => c.statusCultivo === 'ATIVO');
            const saudaveis = ativos.filter(c => c.estadoPlanta === 'SAUDAVEL').length;
            const pendentes = tarefas.filter(t => !t.concluida).length;
            const concluidas = tarefas.filter(t => t.concluida).length;

            setKpis({ ativos: ativos.length, saudaveis, tarefasPendentes: pendentes, tarefasConcluidas: concluidas });

            // Gráficos... (Lógica mantida simplificada aqui)
            const tiposCount = {};
            plantas.forEach(p => { const t = p.tipoPlanta || 'OUTROS'; tiposCount[t] = (tiposCount[t] || 0) + 1; });
            setGraficoTipos(Object.keys(tiposCount).map(key => ({ name: key, value: tiposCount[key] })));

            const saudeCount = { 'SAUDAVEL': 0, 'EM_ATENCAO': 0, 'COM_PRAGA': 0, 'CRITICO': 0 };
            ativos.forEach(c => { if (saudeCount[c.estadoPlanta] !== undefined) saudeCount[c.estadoPlanta]++; });
            setGraficoSaude([
                { name: 'Saudável', valor: saudeCount['SAUDAVEL'], fill: COLORS.green },
                { name: 'Atenção', valor: saudeCount['EM_ATENCAO'], fill: COLORS.orange },
                { name: 'Praga', valor: saudeCount['COM_PRAGA'], fill: '#ef5350' },
                { name: 'Crítico', valor: saudeCount['CRITICO'], fill: COLORS.red }
            ]);
            setGraficoTarefas([{ name: 'Pendentes', value: pendentes }, { name: 'Concluídas', value: concluidas }]);

        } catch (error) { console.error("Erro ao carregar dashboard:", error); }
    };

    useEffect(() => { carregarDadosGerais(); }, []);

    // Carrega Clima
    useEffect(() => {
        if (!idAreaClimaSelecionada || rawAreas.length === 0) return;
        const carregarDadosAreaEspecifica = async () => {
            const areaAtual = rawAreas.find(a => a.idArea == idAreaClimaSelecionada);
            if (!areaAtual) return;
            setNomeAreaClima(areaAtual.nomeArea);
            try {
                const climaRes = await fetch(`http://localhost:8090/api/areas/${areaAtual.idArea}/clima`);
                if (climaRes.ok) setClima(await climaRes.json());
                else setClima(null);
            } catch (err) { setClima(null); }
        };
        void carregarDadosAreaEspecifica();
    }, [idAreaClimaSelecionada, rawAreas]);

    // --- AÇÕES DO BOTÃO PLANTAR AGORA ---
    const abrirModalPlantio = () => {
        setDadosPlantioRapido({
            quantidadePlantada: '',
            dataPlantio: new Date().toISOString().split('T')[0]
        });
        setModalPlantioAberto(true);
    };

    const confirmarPlantioRapido = (e) => {
        e.preventDefault();
        const sugestaoAtual = sugestoesInteligentes[indiceSugestao];

        if(!sugestaoAtual) return;

        const payload = {
            areaCultivo: { idArea: sugestaoAtual.idArea },
            plantaCultivada: { idPlanta: sugestaoAtual.idPlanta },
            quantidadePlantada: Number(dadosPlantioRapido.quantidadePlantada),
            dataPlantio: dadosPlantioRapido.dataPlantio,
            statusCultivo: 'ATIVO',
            estadoPlanta: 'SAUDAVEL'
        };

        fetch('http://localhost:8090/api/cultivos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(res => {
                if(res.ok) {
                    alert('Cultivo iniciado com sucesso! 🌱');
                    setModalPlantioAberto(false);
                    carregarDadosGerais(); // Atualiza tudo (KPIs, Gráficos e remove a sugestão da lista)
                    setIndiceSugestao(0); // Reseta índice
                } else {
                    alert('Erro ao iniciar cultivo.');
                }
            })
            .catch(err => console.error(err));
    };

    // Helpers Gráficos
    const alterarMes = (direcao) => {
        const novaData = new Date(dataReferencia);
        novaData.setMonth(novaData.getMonth() + (direcao === 'proximo' ? 1 : -1));
        setDataReferencia(novaData);
    };

    const dadosProducaoFiltrados = useMemo(() => {
        // ... (Mesma lógica anterior, mantida para brevidade)
        const mesesNomes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        const historicoMap = new Map();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(dataReferencia.getFullYear(), dataReferencia.getMonth() - i, 1);
            historicoMap.set(`${mesesNomes[d.getMonth()]}/${d.getFullYear().toString().slice(2)}`, { plantado: 0, colhido: 0 });
        }
        const cultivosFiltrados = rawCultivos.filter(c => {
            if (filtroTipo === 'geral') return true;
            if (filtroTipo === 'planta') return c.plantaCultivada && c.plantaCultivada.idPlanta.toString() === filtroId;
            if (filtroTipo === 'area') return c.areaCultivo && c.areaCultivo.idArea.toString() === filtroId;
            return true;
        });
        cultivosFiltrados.forEach(c => {
            if (c.statusCultivo === 'COLHIDO' && c.dataColheitaFinal) {
                const d = criarDataLocal(c.dataColheitaFinal);
                if (d) {
                    const k = `${mesesNomes[d.getMonth()]}/${d.getFullYear().toString().slice(2)}`;
                    if (historicoMap.has(k)) historicoMap.get(k).colhido += (Number(c.quantidadeColhida) || 0);
                }
            }
            if (c.dataPlantio) {
                const d = criarDataLocal(c.dataPlantio);
                if (d) {
                    const k = `${mesesNomes[d.getMonth()]}/${d.getFullYear().toString().slice(2)}`;
                    if (historicoMap.has(k)) historicoMap.get(k).plantado += (Number(c.quantidadePlantada) || 0);
                }
            }
        });
        return Array.from(historicoMap, ([label, vals]) => ({ name: label, ...vals }));
    }, [rawCultivos, filtroTipo, filtroId, dataReferencia]);

    const dadosVisaoGeral = useMemo(() => {
        // ... (Mesma lógica anterior)
        const hoje = new Date();
        const mesesNomes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        const mapa = new Map();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
            mapa.set(mesesNomes[d.getMonth()], { plantado: 0, colhido: 0 });
        }
        rawCultivos.forEach(c => {
            if (c.statusCultivo === 'COLHIDO' && c.dataColheitaFinal) {
                const d = criarDataLocal(c.dataColheitaFinal);
                if (d) { const m = mesesNomes[d.getMonth()]; if (mapa.has(m)) mapa.get(m).colhido += (Number(c.quantidadeColhida) || 0); }
            }
            if (c.dataPlantio) {
                const d = criarDataLocal(c.dataPlantio);
                if (d) { const m = mesesNomes[d.getMonth()]; if (mapa.has(m)) mapa.get(m).plantado += (Number(c.quantidadePlantada) || 0); }
            }
        });
        return Array.from(mapa, ([name, vals]) => ({ name, ...vals }));
    }, [rawCultivos]);

    const proximaSugestao = () => setIndiceSugestao((prev) => (prev + 1) % sugestoesInteligentes.length);
    const anteriorSugestao = () => setIndiceSugestao((prev) => (prev - 1 + sugestoesInteligentes.length) % sugestoesInteligentes.length);

    return (
        <div className="animate-fade-in" style={{ padding: '0 10px' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Dashboard</h1>
                <p style={{ color: '#64748b', marginTop: '4px' }}>Visão geral e inteligência de dados do Cultiva+.</p>
            </div>

            {/* --- SEÇÃO DE SUGESTÃO INTELIGENTE "AI" --- */}
            {activeTab === 'geral' && sugestoesInteligentes.length > 0 && (
                <div className="modern-banner ai-banner" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', border: '1px solid #bbf7d0', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 10, right: 10, opacity: 0.1 }}>
                        <Sparkles size={100} color="#16a34a" />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', width: '100%', zIndex: 1 }}>
                        <div className="icon-box bg-green-light" style={{ width: '56px', height: '56px', flexShrink: 0 }}>
                            <Lightbulb size={32} className="text-green-600" />
                        </div>

                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0, color: '#14532d', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    Sugestão Inteligente <span style={{ fontSize: '0.75rem', background: '#22c55e', color: 'white', padding: '2px 8px', borderRadius: '12px' }}>Match {(sugestoesInteligentes[indiceSugestao].score)}%</span>
                                </h3>
                                {sugestoesInteligentes.length > 1 && (
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <button onClick={anteriorSugestao} className="btn-icon-sm" style={{ background: 'white', borderRadius: '50%' }}><ChevronLeft size={16} /></button>
                                        <button onClick={proximaSugestao} className="btn-icon-sm" style={{ background: 'white', borderRadius: '50%' }}><ChevronRight size={16} /></button>
                                    </div>
                                )}
                            </div>

                            <p style={{ color: '#166534', fontSize: '1rem', lineHeight: '1.5', margin: 0 }}>
                                A área <strong>{sugestoesInteligentes[indiceSugestao].areaNome}</strong> está livre.
                                Recomendamos plantar <strong>{sugestoesInteligentes[indiceSugestao].plantaNome}</strong>.
                            </p>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '8px', flexWrap: 'wrap' }}>
                                {sugestoesInteligentes[indiceSugestao].motivos.map((motivo, idx) => (
                                    <span key={idx} style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.6)', color: '#14532d', padding: '4px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <CheckCircle size={12} /> {motivo}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* BOTÃO AGORA FUNCIONAL */}
                        <button className="btn-primary" onClick={abrirModalPlantio} style={{ padding: '10px 20px', fontSize: '0.9rem', boxShadow: '0 4px 6px -2px rgba(22, 163, 74, 0.2)' }}>
                            Plantar Agora <ArrowRight size={16} style={{ marginLeft: 6 }} />
                        </button>
                    </div>

                    {sugestoesInteligentes.length > 1 && (
                        <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px' }}>
                            {sugestoesInteligentes.map((_, idx) => (
                                <div key={idx} style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: idx === indiceSugestao ? '#16a34a' : '#bbf7d0', transition: 'all 0.3s' }} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ... Resto do Dashboard (Cards de KPIs, Tabs, etc) permanece igual ... */}
            {activeTab === 'geral' && sugestoesInteligentes.length === 0 && rawAreas.length > 0 && (
                <div className="modern-banner" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div style={{ color: '#64748b' }}>Todas as suas áreas estão produtivas ou faltam dados para análise! 🚀</div>
                </div>
            )}

            <div className="kpi-grid">
                <StatCard title="Cultivos Ativos" value={kpis.ativos} subtext="Monitoramento em tempo real" icon={Sprout} colorClass="bg-green-light" />
                <StatCard title="Plantas Saudáveis" value={kpis.saudaveis} subtext={`${kpis.ativos > 0 ? Math.round((kpis.saudaveis / kpis.ativos) * 100) : 0}% do total ativo`} icon={CheckCircle} colorClass="bg-blue-light" />
                <StatCard title="Alertas Pendentes" value={kpis.tarefasPendentes} subtext="Tarefas não concluídas" icon={AlertCircle} colorClass="bg-red-light" />
                <StatCard title="Tarefas Concluídas" value={kpis.tarefasConcluidas} subtext="Histórico total" icon={ClipboardList} colorClass="bg-purple-light" />
            </div>

            <div className="tabs-container">
                {tabs.map(tab => (
                    <div key={tab.id} className={`tab-button ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                        {tab.icon} {tab.label}
                    </div>
                ))}
            </div>

            <div className="tab-content" style={{ paddingBottom: '40px' }}>
                {activeTab === 'geral' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                        <ChartCard title="Tendência de Produção" subtitle="Visão macro (últimos 6 meses)" icon={TrendingUp}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dadosVisaoGeral}>
                                    <defs>
                                        <linearGradient id="colorColhido" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={COLORS.green} stopOpacity={0.2} />
                                            <stop offset="95%" stopColor={COLORS.green} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <Tooltip content={CustomTooltip} />
                                    <Area type="monotone" dataKey="colhido" stroke={COLORS.green} strokeWidth={3} fillOpacity={1} fill="url(#colorColhido)" name="colhido" />
                                    <Area type="monotone" dataKey="plantado" stroke={COLORS.blue} strokeWidth={2} strokeDasharray="5 5" fill="none" name="plantado" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </ChartCard>

                        <ChartCard title="Clima Local" subtitle={`Monitoramento em tempo real`} icon={CloudSun}
                                   headerControls={
                                       <select value={idAreaClimaSelecionada} onChange={(e) => setIdAreaClimaSelecionada(e.target.value)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#475569', outline: 'none', cursor: 'pointer', backgroundColor: '#fff' }}>
                                           {rawAreas.length === 0 && <option value="">Sem áreas</option>}
                                           {rawAreas.map(area => <option key={area.idArea} value={area.idArea}>{area.nomeArea}</option>)}
                                       </select>
                                   }>
                            {clima ? (
                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', gap: '30px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#f59e0b' }}>{clima.incidenciaSolarMedia?.toFixed(2)}</div>
                                            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Incidência Solar (kWh/m²)</div>
                                        </div>
                                        <div style={{ width: '1px', height: '60px', backgroundColor: '#e2e8f0' }}></div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#0ea5e9' }}>{clima.umidadeMedia?.toFixed(1)}%</div>
                                            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Umidade do Ar</div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>Dados obtidos via satélite para {nomeAreaClima}.</div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>{rawAreas.length > 0 ? "Carregando dados..." : "Cadastre uma área para visualizar dados climáticos."}</div>
                            )}
                        </ChartCard>
                    </div>
                )}
                {/* Outras tabs (catalogo, saude, tarefas, producao) mantidas iguais ao código anterior... */}
                {activeTab === 'catalogo' && (
                    <div style={{ width: '100%', height: 300 }}>
                        <ChartCard title="Distribuição do Catálogo" subtitle="Tipos de plantas cadastradas" icon={IconeGrafico}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={graficoTipos} cx="50%" cy="50%" innerRadius={80} outerRadius={140} paddingAngle={5} dataKey="value">
                                        {graficoTipos.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} strokeWidth={0} />)}
                                    </Pie>
                                    <Tooltip content={CustomTooltip} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    </div>
                )}
                {activeTab === 'saude' && (
                    <div style={{ width: '100%', height: 300 }}>
                        <ChartCard title="Saúde dos Cultivos" subtitle="Monitoramento de pragas e doenças" icon={Bug}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={graficoSaude} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 14 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                    <Tooltip content={CustomTooltip} cursor={{ fill: '#f1f5f9' }} />
                                    <Bar dataKey="valor" radius={[8, 8, 0, 0]} barSize={60}>
                                        {graficoSaude.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    </div>
                )}
                {activeTab === 'tarefas' && (
                    <div style={{ width: '100%', height: 300 }}>
                        <ChartCard title="Status das Tarefas" subtitle="Progresso das atividades operacionais" icon={ClipboardList}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={graficoTarefas} cx="50%" cy="50%" innerRadius={0} outerRadius={140} dataKey="value" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                        <Cell fill="#fbbf24" name="Pendentes" />
                                        <Cell fill="#16a34a" name="Concluídas" />
                                    </Pie>
                                    <Tooltip content={CustomTooltip} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    </div>
                )}
                {activeTab === 'producao' && (
                    <div style={{ width: '100%' }}>
                        <ChartCard title="Análise de Produção Detalhada" subtitle="Controle total de entradas e saídas" icon={TrendingUp}
                                   headerControls={
                                       <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                           <button onClick={() => alterarMes('anterior')} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px', cursor: 'pointer' }}><ChevronLeft size={16} color="#64748b" /></button>
                                           <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                               <Filter size={14} style={{ position: 'absolute', left: '8px', color: '#64748b' }} />
                                               <select value={filtroTipo} onChange={(e) => { setFiltroTipo(e.target.value); setFiltroId(''); }} style={{ padding: '6px 8px 6px 28px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#475569', outline: 'none' }}>
                                                   <option value="geral">Visão Geral</option>
                                                   <option value="planta">Por Planta</option>
                                                   <option value="area">Por Área</option>
                                               </select>
                                           </div>
                                           {filtroTipo !== 'geral' && (
                                               <select value={filtroId} onChange={(e) => setFiltroId(e.target.value)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#475569', outline: 'none', maxWidth: '150px' }}>
                                                   <option value="">Selecione...</option>
                                                   {filtroTipo === 'planta' ? rawPlantas.map(p => <option key={p.idPlanta} value={p.idPlanta}>{p.nomePopular}</option>) : rawAreas.map(a => <option key={a.idArea} value={a.idArea}>{a.nomeArea}</option>)}
                                               </select>
                                           )}
                                           <button onClick={() => alterarMes('proximo')} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px', cursor: 'pointer' }}><ChevronRight size={16} color="#64748b" /></button>
                                       </div>
                                   }>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={dadosProducaoFiltrados} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 14 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                    <Tooltip content={CustomTooltip} />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                    <Line name="colhido" type="monotone" dataKey="colhido" stroke={COLORS.green} strokeWidth={3} dot={{ r: 5, fill: COLORS.green }} activeDot={{ r: 7 }} />
                                    <Line name="plantado" type="monotone" dataKey="plantado" stroke={COLORS.blue} strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4, fill: COLORS.blue }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    </div>
                )}
            </div>

            {/* --- MODAL DE PLANTIO RÁPIDO (NOVO) --- */}
            {modalPlantioAberto && sugestoesInteligentes[indiceSugestao] && (
                <div className="modal-modern-overlay">
                    <div className="modal-modern-content" style={{ maxWidth: '450px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 className="modal-title" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                <Sprout className="text-primary"/> Confirmar Plantio
                            </h2>
                            <button onClick={() => setModalPlantioAberto(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={24} /></button>
                        </div>

                        <div style={{background: '#f0fdf4', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #bbf7d0'}}>
                            <p style={{margin: 0, color: '#166534', fontSize: '0.9rem'}}>
                                Você está plantando <strong>{sugestoesInteligentes[indiceSugestao].plantaNome}</strong> na área <strong>{sugestoesInteligentes[indiceSugestao].areaNome}</strong>.
                            </p>
                        </div>

                        <form onSubmit={confirmarPlantioRapido}>
                            <div className="form-group">
                                <label className="form-label">Quantidade a Plantar</label>
                                <input type="number" className="form-input" placeholder="Ex: 500" required
                                       value={dadosPlantioRapido.quantidadePlantada}
                                       onChange={e => setDadosPlantioRapido({...dadosPlantioRapido, quantidadePlantada: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Data do Plantio</label>
                                <input type="date" className="form-input" required
                                       value={dadosPlantioRapido.dataPlantio}
                                       onChange={e => setDadosPlantioRapido({...dadosPlantioRapido, dataPlantio: e.target.value})}
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-outline" onClick={() => setModalPlantioAberto(false)}>Cancelar</button>
                                <button type="submit" className="btn-primary">Confirmar e Plantar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;