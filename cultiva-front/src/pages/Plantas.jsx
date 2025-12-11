import { useState, useEffect } from 'react';
import '../App.css';
import { 
    Trash2, Plus, Sprout, Clock, Tag, Pencil, 
    Leaf, Cherry, Bean, Wheat, X, Microscope
} from 'lucide-react';

const Plantas = () => {
    const [plantas, setPlantas] = useState([]);
    const [modalAberto, setModalAberto] = useState(false);

    // Estados de Edição
    const [editandoId, setEditandoId] = useState(null);
    const [novaPlanta, setNovaPlanta] = useState({
        nomePopular: '',
        nomeCientifico: '',
        tipoPlanta: 'HORTALICA',
        cicloMedioDias: '',
        solosRecomendados: [] 
    });

    // Opções de Solo disponíveis
    const OPCOES_SOLO = ['ARGILOSO', 'ARENOSO', 'HUMIFERO', 'CALCARIO'];

    // --- Helpers de Estilo ---
    const getPlantConfig = (tipo) => {
        switch (tipo) {
            case 'FRUTA': 
                return { icon: Cherry, colorClass: 'bg-soft-orange', borderClass: 'border-top-fruta', badgeStyle: { bg: '#ffedd5', color: '#c2410c' } };
            case 'GRAO': 
                return { icon: Wheat, colorClass: 'bg-soft-yellow', borderClass: 'border-top-grao', badgeStyle: { bg: '#fef9c3', color: '#a16207' } };
            case 'LEGUME': 
                return { icon: Bean, colorClass: 'bg-soft-purple', borderClass: 'border-top-legume', badgeStyle: { bg: '#f3e8ff', color: '#7e22ce' } };
            default: // HORTALICA
                return { icon: Leaf, colorClass: 'bg-soft-green', borderClass: 'border-top-hortalica', badgeStyle: { bg: '#dcfce7', color: '#15803d' } };
        }
    };

    // --- 1. Carregar Dados ---
    const carregarPlantas = () => {
        fetch('http://localhost:8090/api/plantas')
            .then(res => res.json())
            .then(dados => setPlantas(dados))
            .catch(err => console.error("Erro ao buscar plantas:", err));
    };

    useEffect(() => {
        carregarPlantas();
    }, []);

    // --- 2. Cálculos de Resumo ---
    const mediaCiclo = plantas.length > 0
        ? Math.round(plantas.reduce((acc, p) => acc + p.cicloMedioDias, 0) / plantas.length)
        : 0;

    // --- 3. Funções de Modal ---
    const abrirModal = (planta = null) => {
        if (planta) {
            setEditandoId(planta.idPlanta);
            setNovaPlanta({
                nomePopular: planta.nomePopular,
                nomeCientifico: planta.nomeCientifico || '',
                tipoPlanta: planta.tipoPlanta,
                cicloMedioDias: planta.cicloMedioDias,
                solosRecomendados: planta.solosRecomendados || []
            });
        } else {
            setEditandoId(null);
            setNovaPlanta({ nomePopular: '', nomeCientifico: '', tipoPlanta: 'HORTALICA', cicloMedioDias: '', solosRecomendados: [] });
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

    // --- 4. Salvar ---
    const salvarPlanta = (e) => {
        e.preventDefault();
        const url = editandoId
            ? `http://localhost:8090/api/plantas/${editandoId}`
            : 'http://localhost:8090/api/plantas'; 
        const metodo = editandoId ? 'PUT' : 'POST';

        fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novaPlanta)
        }).then(res => {
            if (res.ok) {
                carregarPlantas();
                fecharModal();
            } else {
                alert('Erro ao salvar planta.');
            }
        });
    };

    // --- 5. Excluir ---
    const excluirPlanta = (id, nome) => {
        if (confirm(`Tem a certeza que deseja remover a planta "${nome}"?`)) {
            fetch(`http://localhost:8090/api/plantas/${id}`, {
                method: 'DELETE'
            }).then(res => {
                if (res.ok) carregarPlantas();
                else alert('Erro ao remover. Verifique se esta planta está em uso.');
            });
        }
    };

    return (
        <div className="animate-fade-in" style={{ padding: '0 10px' }}>

            {/* Header */}
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px'}}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Catálogo de Plantas</h1>
                    <p style={{ color: '#64748b', marginTop: '4px' }}>Espécies cadastradas para o seu cultivo.</p>
                </div>
                <button className="btn-primary" onClick={() => abrirModal()}>
                    <Plus size={20} /> Nova Planta
                </button>
            </div>

            {/* Resumo (Stats) */}
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
                        <span className="kpi-title">Ciclo Médio</span>
                        <div className="icon-box bg-orange-light"><Clock size={20} /></div>
                    </div>
                    <div className="kpi-value">{mediaCiclo} <span style={{fontSize: '1rem', color: '#64748b', fontWeight: 400}}>dias</span></div>
                </div>
            </div>

            {/* Grid de Plantas */}
            <div className="plants-grid">
                {plantas.map(planta => {
                    const config = getPlantConfig(planta.tipoPlanta);
                    const PlantIcon = config.icon;

                    return (
                        <div key={planta.idPlanta} className="plant-card">
                            {/* Borda Colorida no Topo */}
                            <div className={`plant-card-top ${config.borderClass}`}></div>
                            
                            <div className="plant-card-content">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    {/* Ícone de Destaque */}
                                    <div className={`plant-icon-wrapper ${config.colorClass}`}>
                                        <PlantIcon size={22} />
                                    </div>
                                    
                                    {/* Badge de Tipo */}
                                    <span 
                                        className="plant-badge" 
                                        style={{ backgroundColor: config.badgeStyle.bg, color: config.badgeStyle.color }}
                                    >
                                        {planta.tipoPlanta}
                                    </span>
                                </div>

                                <h3 className="plant-name">{planta.nomePopular}</h3>
                                <p className="plant-scientific">
                                    {planta.nomeCientifico || 'Espécie não especificada'}
                                </p>

                                <div className="plant-info-section">
                                    <div className="cycle-info">
                                        <Clock size={16} />
                                        <span>Ciclo aprox: <strong>{planta.cicloMedioDias} dias</strong></span>
                                    </div>

                                    <div style={{marginBottom: '6px', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase'}}>
                                        Solos Ideais
                                    </div>
                                    <div className="soil-tags-container">
                                        {planta.solosRecomendados && planta.solosRecomendados.length > 0 ? (
                                            planta.solosRecomendados.map(solo => (
                                                <span key={solo} className="soil-tag">{solo}</span>
                                            ))
                                        ) : (
                                            <span style={{fontSize: '0.8rem', color: '#cbd5e1'}}>Nenhum especificado</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Rodapé de Ações */}
                            <div className="area-card-actions" style={{ marginTop: 'auto' }}>
                                <button 
                                    className="btn-outline" 
                                    style={{ flex: 1, justifyContent: 'center', fontSize: '0.85rem' }}
                                    onClick={() => abrirModal(planta)}
                                >
                                    <Pencil size={16} style={{marginRight: '6px'}}/> Editar
                                </button>
                                
                                <button 
                                    className="btn-icon-action danger" 
                                    title="Excluir"
                                    onClick={() => excluirPlanta(planta.idPlanta, planta.nomePopular)}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* --- MODAL MODERNO --- */}
            {modalAberto && (
                <div className="modal-modern-overlay">
                    <div className="modal-modern-content">
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <h2 className="modal-title">
                                {editandoId ? 'Editar Planta' : 'Nova Planta'}
                            </h2>
                            <button onClick={fecharModal} style={{border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8'}}>
                                <X size={24} />
                            </button>
                        </div>
                        <p className="modal-desc">Preencha os dados da espécie vegetal.</p>
                        
                        <form onSubmit={salvarPlanta}>
                            <div className="form-group">
                                <label className="form-label">Nome Popular</label>
                                <input
                                    className="form-input"
                                    placeholder="Ex: Alface Crespa"
                                    value={novaPlanta.nomePopular}
                                    onChange={e => setNovaPlanta({...novaPlanta, nomePopular: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Nome Científico (Opcional)</label>
                                <div style={{position: 'relative'}}>
                                    <Microscope size={16} style={{position: 'absolute', left: '10px', top: '12px', color: '#94a3b8'}} />
                                    <input
                                        className="form-input"
                                        style={{paddingLeft: '34px', fontStyle: 'italic'}}
                                        placeholder="Ex: Lactuca sativa"
                                        value={novaPlanta.nomeCientifico}
                                        onChange={e => setNovaPlanta({...novaPlanta, nomeCientifico: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label">Ciclo Médio (dias)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        placeholder="Ex: 45"
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
                                        <option value="FRUTA">Fruta</option>
                                        <option value="GRAO">Grão</option>
                                        <option value="LEGUME">Legume</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Solos Recomendados</label>
                                <div className="checkbox-grid">
                                    {OPCOES_SOLO.map(solo => (
                                        <label key={solo} className="checkbox-item">
                                            <input
                                                type="checkbox"
                                                checked={novaPlanta.solosRecomendados?.includes(solo)}
                                                onChange={() => toggleSolo(solo)}
                                            />
                                            {solo}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn-outline" onClick={fecharModal}>Cancelar</button>
                                <button type="submit" className="btn-primary">
                                    {editandoId ? 'Atualizar' : 'Salvar'}
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