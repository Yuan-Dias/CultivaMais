import { useState, useEffect } from 'react';
import '../App.css';
import {
    Trash2, Plus, Sprout, Clock, Pencil,
    Leaf, Cherry, Bean, Wheat, X, Microscope,
    Droplets, Sun, Flower
} from 'lucide-react';
import {authService, getHeaders} from "../services/api.js";
import { useNotify } from "../context/NotificationContext"; // Importação do sistema de notificações

const Plantas = () => {
    const notify = useNotify(); // Inicialização do hook de notificações

    // --- ESTADOS ---
    const [plantas, setPlantas] = useState([]);
    const [modalAberto, setModalAberto] = useState(false);

    // Estados do Formulário
    const [editandoId, setEditandoId] = useState(null);
    const [novaPlanta, setNovaPlanta] = useState({
        nomePopular: '',
        nomeCientifico: '',
        tipoPlanta: 'HORTALICA',
        cicloMedioDias: '',
        solosRecomendados: [],
        aguaRecomendada: 'MEDIA', // Sincronizado com o novo Enum Java
        luzRecomendada: 'MEIA_SOMBRA'
    });

    // --- LISTA DE SOLOS ---
    const CATEGORIAS_SOLO = {
        "Textura e Composição": [
            "ARGILOSO", "ARENOSO", "SILTOSO", "HUMOSO", "CALCARIO", "FRANCO"
        ],
        "Classificação Técnica (Embrapa)": [
            "LATOSSOLO", "ARGISSOLO", "CHERNOSSOLO", "NEOSSOLO", "CAMBISSOLO", "GLEISSOLO", "NITOSSOLO"
        ],
        "Tipos Regionais / Outros": [
            "TERRA_ROXA", "MASSAPE", "VARZEA", "MISTO", "OUTRO"
        ]
    };

    // --- CONFIGURAÇÃO VISUAL ---
    const getPlantConfig = (tipo) => {
        switch (tipo) {
            case 'FRUTA':
                return { icon: Cherry, colorClass: 'bg-soft-orange', borderClass: 'border-top-fruta', badgeStyle: { bg: '#ffedd5', color: '#c2410c' } };
            case 'GRAO':
                return { icon: Wheat, colorClass: 'bg-soft-yellow', borderClass: 'border-top-grao', badgeStyle: { bg: '#fef9c3', color: '#a16207' } };
            case 'LEGUME':
                return { icon: Bean, colorClass: 'bg-soft-purple', borderClass: 'border-top-legume', badgeStyle: { bg: '#f3e8ff', color: '#7e22ce' } };
            case 'FLOR':
            case 'ERVA_MEDICINAL':
            case 'TEMPERO':
                return { icon: Flower, colorClass: 'bg-soft-pink', borderClass: 'border-top-legume', badgeStyle: { bg: '#fce7f3', color: '#be185d' } };
            default:
                return { icon: Leaf, colorClass: 'bg-soft-green', borderClass: 'border-top-hortalica', badgeStyle: { bg: '#dcfce7', color: '#15803d' } };
        }
    };

    // --- 1. CARREGAR DADOS ---
    const carregarPlantas = () => {
        fetch('http://localhost:8090/api/plantas')
            .then(res => {
                if(!res.ok) throw new Error("Erro ao carregar");
                return res.json();
            })
            .then(dados => setPlantas(dados))
            .catch(err => {
                console.error("Erro ao buscar plantas:", err);
                setPlantas([]);
                notify("Erro ao conectar com o catálogo de plantas.", "error");
            });
    };

    useEffect(() => {
        carregarPlantas();
    }, []);

    // --- 2. FUNÇÕES DO MODAL ---
    const abrirModal = (planta = null) => {
        if (planta) {
            setEditandoId(planta.idPlanta);
            setNovaPlanta({
                nomePopular: planta.nomePopular,
                nomeCientifico: planta.nomeCientifico || '',
                tipoPlanta: planta.tipoPlanta,
                cicloMedioDias: planta.cicloMedioDias,
                solosRecomendados: planta.solosRecomendados || [],
                aguaRecomendada: planta.aguaRecomendada || 'MEDIA',
                luzRecomendada: planta.luzRecomendada || 'MEIA_SOMBRA'
            });
        } else {
            setEditandoId(null);
            setNovaPlanta({
                nomePopular: '',
                nomeCientifico: '',
                tipoPlanta: 'HORTALICA',
                cicloMedioDias: '',
                solosRecomendados: [],
                aguaRecomendada: 'MEDIA',
                luzRecomendada: 'MEIA_SOMBRA'
            });
        }
        setModalAberto(true);
    };

    const fecharModal = () => {
        setModalAberto(false);
        setEditandoId(null);
    };

    const toggleSolo = (solo) => {
        setNovaPlanta(prev => {
            const solosAtuais = prev.solosRecomendados || [];
            if (solosAtuais.includes(solo)) {
                return { ...prev, solosRecomendados: solosAtuais.filter(s => s !== solo) };
            } else {
                return { ...prev, solosRecomendados: [...solosAtuais, solo] };
            }
        });
    };

    const excluirPlanta = (id, nome) => {
        if(window.confirm(`Deseja excluir a planta ${nome}?`)) {
            fetch(`http://localhost:8090/api/plantas/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            })
                .then(res => {
                    if(res.ok) {
                        notify(`Planta ${nome} removida com sucesso.`, "info");
                        carregarPlantas();
                    } else {
                        notify("Não foi possível excluir a planta.", "error");
                    }
                })
                .catch(err => {
                    console.error("Erro ao excluir:", err);
                    notify("Erro de conexão ao tentar excluir.", "error");
                });
        }
    };

    // --- 3. SALVAR (SINCRONIZADO COM PLANTA.JAVA) ---
    const salvarPlanta = async (e) => {
        if (e) e.preventDefault();

        if (!novaPlanta.nomePopular || !novaPlanta.cicloMedioDias) {
            notify("Preencha o Nome e o Ciclo antes de salvar.", "error");
            return;
        }

        try {
            const usuarioLogado = authService.obterUsuarioLogado();
            const idUsuario = usuarioLogado?.idUsuario || usuarioLogado?.id;

            if (!idUsuario) {
                notify("Sessão expirada. Por favor, faça login novamente.", "error");
                return;
            }

            const url = editandoId
                ? `http://localhost:8090/api/plantas/${editandoId}`
                : `http://localhost:8090/api/plantas/usuario/${idUsuario}`;

            const metodo = editandoId ? 'PUT' : 'POST';

            // Payload rigorosamente ajustado para o Model Planta
            const payload = {
                nomePopular: novaPlanta.nomePopular,
                nomeCientifico: novaPlanta.nomeCientifico || "",
                tipoPlanta: novaPlanta.tipoPlanta || "HORTALICA",
                cicloMedioDias: Number(novaPlanta.cicloMedioDias),
                solosRecomendados: Array.isArray(novaPlanta.solosRecomendados) ? novaPlanta.solosRecomendados : [],
                luzRecomendada: novaPlanta.luzRecomendada,
                aguaRecomendada: novaPlanta.aguaRecomendada // Enviando para o novo campo do Java
            };

            const response = await fetch(url, {
                method: metodo,
                headers: getHeaders(),
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                notify(editandoId ? "Planta atualizada com sucesso!" : "Planta cadastrada com sucesso!", "success");
                carregarPlantas();
                fecharModal();
            } else {
                const errorText = await response.text();
                notify(`Erro ao salvar: ${errorText}`, "error");
            }
        } catch (err) {
            console.error("Erro de Conexão:", err);
            notify("Erro ao conectar ao servidor.", "error");
        }
    };

    const mediaCiclo = plantas.length > 0
        ? Math.round(plantas.reduce((acc, p) => acc + (Number(p.cicloMedioDias) || 0), 0) / plantas.length)
        : 0;

    const formatarTexto = (texto) => {
        if(!texto) return '';
        return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase().replace(/_/g, ' ');
    };

    return (
        <div className="animate-fade-in" style={{ padding: '0 10px' }}>

            {/* HEADER */}
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px'}}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Catálogo de Plantas</h1>
                    <p style={{ color: '#64748b', marginTop: '4px' }}>Gerencie suas espécies e preferências de solo.</p>
                </div>
                <button className="btn-primary" onClick={() => abrirModal()}>
                    <Plus size={20} /> Nova Planta
                </button>
            </div>

            {/* KPI STATS */}
            <div className="kpi-grid" style={{ marginBottom: '32px' }}>
                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-title">Total de Espécies</span>
                        <div className="icon-box bg-green-light"><Sprout size={20} /></div>
                    </div>
                    <div className="kpi-value">{plantas.length}</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-title">Ciclo Médio Geral</span>
                        <div className="icon-box bg-orange-light"><Clock size={20} /></div>
                    </div>
                    <div className="kpi-value">{mediaCiclo} <span style={{fontSize: '1rem', color: '#64748b', fontWeight: 400}}>dias</span></div>
                </div>
            </div>

            {/* GRID DE PLANTAS */}
            <div className="plants-grid">
                {plantas.map(planta => {
                    const config = getPlantConfig(planta.tipoPlanta);
                    const PlantIcon = config.icon;

                    return (
                        <div key={planta.idPlanta} className="plant-card">
                            <div className={`plant-card-top ${config.borderClass}`}></div>
                            <div className="plant-card-content">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div className={`plant-icon-wrapper ${config.colorClass}`}>
                                        <PlantIcon size={22} />
                                    </div>
                                    <span className="plant-badge" style={{ backgroundColor: config.badgeStyle.bg, color: config.badgeStyle.color }}>
                                        {formatarTexto(planta.tipoPlanta)}
                                    </span>
                                </div>
                                <h3 className="plant-name">{planta.nomePopular}</h3>
                                <p className="plant-scientific">{planta.nomeCientifico || 'Nome científico não informado'}</p>

                                <div className="plant-info-section">
                                    <div className="cycle-info">
                                        <Clock size={16} />
                                        <span>Ciclo: <strong>{planta.cicloMedioDias} dias</strong></span>
                                    </div>

                                    <div style={{display: 'flex', gap: '8px', fontSize: '0.8rem', color: '#475569', flexWrap: 'wrap', marginTop: '12px'}}>
                                        {planta.luzRecomendada && (
                                            <span style={{display: 'flex', alignItems: 'center', gap: 4, background: '#f1f5f9', padding: '2px 8px', borderRadius: 4}}>
                                                <Sun size={12} className="text-orange-500"/> {formatarTexto(planta.luzRecomendada)}
                                            </span>
                                        )}
                                        {planta.aguaRecomendada && (
                                            <span style={{display: 'flex', alignItems: 'center', gap: 4, background: '#f1f5f9', padding: '2px 8px', borderRadius: 4}}>
                                                <Droplets size={12} className="text-blue-500"/> {formatarTexto(planta.aguaRecomendada)}
                                            </span>
                                        )}
                                    </div>

                                    <div style={{marginBottom: '6px', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginTop: '10px'}}>
                                        Solos Ideais
                                    </div>
                                    <div className="soil-tags-container">
                                        {planta.solosRecomendados && planta.solosRecomendados.length > 0 ? (
                                            planta.solosRecomendados.map(solo => (
                                                <span key={solo} className="soil-tag" style={{fontSize: '0.7rem'}}>
                                                    {formatarTexto(solo)}
                                                </span>
                                            ))
                                        ) : (
                                            <span style={{fontSize: '0.8rem', color: '#cbd5e1'}}>-</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="area-card-actions" style={{ marginTop: 'auto' }}>
                                <button className="btn-outline" style={{ flex: 1, justifyContent: 'center', fontSize: '0.85rem' }} onClick={() => abrirModal(planta)}>
                                    <Pencil size={16} style={{marginRight: '6px'}}/> Editar
                                </button>
                                <button className="btn-icon-action danger" onClick={() => excluirPlanta(planta.idPlanta, planta.nomePopular)}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* --- MODAL DE CADASTRO --- */}
            {modalAberto && (
                <div className="modal-modern-overlay">
                    <div className="modal-modern-content">
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                            <h2 className="modal-title">{editandoId ? 'Editar Planta' : 'Nova Planta'}</h2>
                            <button onClick={fecharModal} style={{border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8'}}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={salvarPlanta}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label">Nome Popular</label>
                                    <input
                                        className="form-input"
                                        placeholder="Ex: Mandioca"
                                        value={novaPlanta.nomePopular}
                                        onChange={e => setNovaPlanta({...novaPlanta, nomePopular: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Nome Científico</label>
                                    <div style={{position: 'relative'}}>
                                        <Microscope size={16} style={{position: 'absolute', left: '10px', top: '12px', color: '#94a3b8'}} />
                                        <input
                                            className="form-input"
                                            style={{paddingLeft: '34px', fontStyle: 'italic'}}
                                            placeholder="Ex: Manihot esculenta"
                                            value={novaPlanta.nomeCientifico}
                                            onChange={e => setNovaPlanta({...novaPlanta, nomeCientifico: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label">Ciclo Médio (dias)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        placeholder="Ex: 240"
                                        value={novaPlanta.cicloMedioDias}
                                        onChange={e => setNovaPlanta({...novaPlanta, cicloMedioDias: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Tipo</label>
                                    <select
                                        className="form-select"
                                        value={novaPlanta.tipoPlanta}
                                        onChange={e => setNovaPlanta({...novaPlanta, tipoPlanta: e.target.value})}
                                    >
                                        <option value="HORTALICA">Hortaliça</option>
                                        <option value="VERDURA">Verdura</option>
                                        <option value="FRUTA">Fruta</option>
                                        <option value="GRAO">Grão</option>
                                        <option value="LEGUME">Legume</option>
                                        <option value="TEMPERO">Tempero</option>
                                        <option value="ERVA_MEDICINAL">Erva Medicinal</option>
                                        <option value="FLOR">Flor</option>
                                        <option value="ARBUSTO">Arbusto</option>
                                        <option value="OUTRO">Outro</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label"><Droplets size={14} style={{marginRight: 4}}/> Necessidade de Água</label>
                                    <select
                                        className="form-select"
                                        value={novaPlanta.aguaRecomendada}
                                        onChange={e => setNovaPlanta({...novaPlanta, aguaRecomendada: e.target.value})}
                                    >
                                        <option value="BAIXA">Baixa</option>
                                        <option value="MEDIA">Media</option>
                                        <option value="ALTA">Alta</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label"><Sun size={14} style={{marginRight: 4}}/> Luz Recomendada</label>
                                    <select
                                        className="form-select"
                                        value={novaPlanta.luzRecomendada}
                                        onChange={e => setNovaPlanta({...novaPlanta, luzRecomendada: e.target.value})}
                                    >
                                        <option value="SOMBRA">Sombra</option>
                                        <option value="MEIA_SOMBRA">Meia Sombra</option>
                                        <option value="PLENO_SOL">Pleno Sol</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label" style={{marginBottom: '10px', display:'block'}}>Solos Recomendados</label>

                                <div style={{maxHeight: '220px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px'}}>
                                    {Object.entries(CATEGORIAS_SOLO).map(([categoria, solos]) => (
                                        <div key={categoria} style={{marginBottom: '16px'}}>
                                            <div style={{
                                                fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b',
                                                textTransform: 'uppercase', marginBottom: '8px', borderBottom: '1px solid #f1f5f9'
                                            }}>
                                                {categoria}
                                            </div>
                                            <div className="checkbox-grid">
                                                {solos.map(solo => (
                                                    <label key={solo} className="checkbox-item">
                                                        <input
                                                            type="checkbox"
                                                            checked={novaPlanta.solosRecomendados?.includes(solo)}
                                                            onChange={() => toggleSolo(solo)}
                                                        />
                                                        {formatarTexto(solo)}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn-outline" onClick={fecharModal}>Cancelar</button>
                                <button type="submit" className="btn-primary">
                                    {editandoId ? 'Salvar Alterações' : 'Cadastrar Planta'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Plantas;