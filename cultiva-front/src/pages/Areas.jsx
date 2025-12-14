import { useState, useEffect } from 'react';
import '../App.css';
import {
    Trash2, Pencil, Plus, MapPin, Sprout, Ruler,
    X, Tractor, Globe, Sun, Cloud, CloudSun
} from 'lucide-react';

// --- IMPORTS DO MAPA ---
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const Areas = () => {
    const [areas, setAreas] = useState([]);
    const [modalAberto, setModalAberto] = useState(false);
    const [editandoId, setEditandoId] = useState(null);
    const [idAreaSelecionada, setIdAreaSelecionada] = useState(null);
    const [cultivos, setCultivos] = useState([]);

    const estadoInicial = {
        nomeArea: '',
        localizacaoArea: '',
        tamanhoArea: '',
        tipoSolo: 'ARGILOSO', // Valor padrão seguro
        quantidadeLuz: 'PLENO_SOL',
        latitudeArea: -14.235,
        longitudeArea: -51.925
    };

    const [novaArea, setNovaArea] = useState(estadoInicial);

    // --- LISTA DE SOLOS (SINCRONIZADA COM O JAVA E PLANTAS.JSX) ---
    const CATEGORIAS_SOLO = {
        "Textura e Composição": [
            "ARGILOSO", "ARENOSO", "SILTOSO", "HUMOSO", "CALCARIO"
        ],
        "Classificação Técnica (Embrapa)": [
            "LATOSSOLO", "ARGISSOLO", "CHERNOSSOLO", "NEOSSOLO", "CAMBISSOLO", "GLEISSOLO", "NITOSSOLO"
        ],
        "Tipos Regionais / Outros": [
            "TERRA_ROXA", "MASSAPE", "VARZEA", "MISTO", "OUTRO"
        ]
    };

    function SeletorMapa() {
        const map = useMapEvents({
            click(e) {
                setNovaArea(prev => ({
                    ...prev,
                    latitudeArea: e.latlng.lat,
                    longitudeArea: e.latlng.lng
                }));
            },
        });
        return novaArea.latitudeArea ? (
            <Marker position={[novaArea.latitudeArea, novaArea.longitudeArea]} />
        ) : null;
    }

    // Função auxiliar para formatar texto (Ex: TERRA_ROXA -> Terra Roxa)
    const formatarTexto = (texto) => {
        if(!texto) return '';
        return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase().replace(/_/g, ' ');
    };

    // Gera cores dinâmicas para os novos solos sem precisar criar CSS para cada um
    const getBadgeStyle = (solo) => {
        const tipo = solo ? solo.toUpperCase() : '';

        // Cores baseadas no tipo de solo
        if (tipo.includes('ARGIL') || tipo === 'TERRA_ROXA' || tipo === 'NITOSSOLO')
            return { bg: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }; // Vermelho terra

        if (tipo.includes('ARENOSO') || tipo === 'NEOSSOLO')
            return { bg: '#fffbeb', color: '#92400e', border: '1px solid #fde68a' }; // Amarelo areia

        if (tipo.includes('HUM') || tipo === 'CHERNOSSOLO' || tipo === 'MASSAPE')
            return { bg: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1' }; // Escuro orgânico

        if (tipo === 'CALCARIO' || tipo === 'MISTO')
            return { bg: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' }; // Cinza claro

        if (tipo === 'VARZEA' || tipo === 'GLEISSOLO')
            return { bg: '#ecfeff', color: '#155e75', border: '1px solid #a5f3fc' }; // Azulado (água)

        // Padrão
        return { bg: '#f3f4f6', color: '#4b5563', border: '1px solid #e5e7eb' };
    };

    const getLuzConfig = (luz) => {
        switch (luz) {
            case 'SOMBRA': return { label: 'Sombra', icon: Cloud, color: '#64748b', bg: '#f1f5f9' };
            case 'MEIA_SOMBRA': return { label: 'Meia Sombra', icon: CloudSun, color: '#d97706', bg: '#fef3c7' };
            default: return { label: 'Sol Pleno', icon: Sun, color: '#ea580c', bg: '#ffedd5' };
        }
    };

    const carregarAreas = () => {
        fetch('http://localhost:8090/api/areas')
            .then(res => {
                if(!res.ok) throw new Error("Erro ao carregar");
                return res.json();
            })
            .then(dados => setAreas(dados))
            .catch(err => console.error("Erro:", err));
    };

    useEffect(() => { carregarAreas(); }, []);

    const totalHectares = areas.reduce((acc, area) => acc + (Number(area.tamanhoArea) || 0), 0).toFixed(1);
    const totalCultivosAtivos = areas.reduce((acc, area) => acc + (area.cultivos ? area.cultivos.length : 0), 0);

    const abrirModal = (area = null) => {
        if (area) {
            setEditandoId(area.idArea);
            setNovaArea({
                ...area,
                quantidadeLuz: area.quantidadeLuz || 'PLENO_SOL',
                latitudeArea: Number(area.latitudeArea) || -14.235,
                longitudeArea: Number(area.longitudeArea) || -51.925
            });
        } else {
            setEditandoId(null);
            setNovaArea(estadoInicial);
        }
        setModalAberto(true);
    };

    const fecharModal = () => {
        setModalAberto(false);
        setEditandoId(null);
    };

    const salvarArea = (e) => {
        e.preventDefault();
        const url = editandoId
            ? `http://localhost:8090/api/areas/${editandoId}`
            : 'http://localhost:8090/api/areas';
        const metodo = editandoId ? 'PUT' : 'POST';

        const payload = {
            ...novaArea,
            tamanhoArea: Number(novaArea.tamanhoArea),
            latitudeArea: Number(novaArea.latitudeArea),
            longitudeArea: Number(novaArea.longitudeArea)
        };

        fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).then(res => {
            if (res.ok) { carregarAreas(); fecharModal(); }
            else {
                res.text().then(t => alert(`Erro ao salvar: ${t}`));
            }
        });
    };

    const excluirArea = (id, nome) => {
        if (confirm(`Apagar a área "${nome}"?`)) {
            fetch(`http://localhost:8090/api/areas/${id}`, { method: 'DELETE' })
                .then(res => { if (res.ok) carregarAreas(); });
        }
    };

    const verCultivos = (idArea) => {
        if (idArea === idAreaSelecionada) {
            setIdAreaSelecionada(null);
            setCultivos([]);
            return;
        }

        fetch('http://localhost:8090/api/cultivos')
            .then(res => res.json())
            .then(todosCultivos => {
                const cultivosDaArea = todosCultivos.filter(c => c.areaCultivo && c.areaCultivo.idArea === idArea);
                setCultivos(cultivosDaArea);
                setIdAreaSelecionada(idArea);
            })
            .catch(err => {
                console.error("Erro ao buscar cultivos", err);
                alert("Erro ao carregar cultivos.");
            });
    };

    return (
        <div className="animate-fade-in" style={{ padding: '0 10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Áreas de Cultivo</h1>
                    <p style={{ color: '#64748b', marginTop: '4px' }}>Gerencie suas terras, solos e incidência solar.</p>
                </div>
                <button className="btn-primary" onClick={() => abrirModal()}>
                    <Plus size={20} /> Nova Área
                </button>
            </div>

            <div className="kpi-grid" style={{ marginBottom: '32px' }}>
                <div className="kpi-card">
                    <div className="kpi-header"><span className="kpi-title">Total de Áreas</span><div className="icon-box bg-green-light"><MapPin size={20} /></div></div>
                    <div className="kpi-value">{areas.length}</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-header"><span className="kpi-title">Área Total</span><div className="icon-box bg-blue-light"><Ruler size={20} /></div></div>
                    <div className="kpi-value">{totalHectares} <span style={{fontSize: '1rem', color: '#64748b', fontWeight: 400}}>ha</span></div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-header"><span className="kpi-title">Em Produção</span><div className="icon-box bg-orange-light"><Tractor size={20} /></div></div>
                    <div className="kpi-value">{totalCultivosAtivos}</div>
                </div>
            </div>

            <div className="areas-grid">
                {areas.map(area => {
                    const luzConfig = getLuzConfig(area.quantidadeLuz);
                    const LuzIcon = luzConfig.icon;
                    const badgeStyle = getBadgeStyle(area.tipoSolo);

                    return (
                        <div key={area.idArea} className="area-card">
                            <div className="area-card-header">
                                <div className="area-title">{area.nomeArea}</div>
                                {/* Badge de Solo Atualizado */}
                                <span style={{
                                    fontSize: '0.7rem', fontWeight: 'bold', padding: '2px 8px', borderRadius: '12px',
                                    backgroundColor: badgeStyle.bg, color: badgeStyle.color, border: badgeStyle.border,
                                    textTransform: 'uppercase'
                                }}>
                                    {formatarTexto(area.tipoSolo)}
                                </span>
                            </div>
                            <div className="area-card-body">
                                <div className="area-info-row">
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={16} /> Localização</span>
                                    <strong>{area.localizacaoArea}</strong>
                                </div>
                                <div className="area-info-row">
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Ruler size={16} /> Tamanho</span>
                                    <strong>{area.tamanhoArea} ha</strong>
                                </div>
                                <div className="area-info-row">
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Sun size={16} /> Incidência</span>
                                    <span style={{
                                        display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600,
                                        color: luzConfig.color, background: luzConfig.bg, padding: '2px 8px', borderRadius: '4px'
                                    }}>
                                        <LuzIcon size={14} /> {luzConfig.label}
                                    </span>
                                </div>
                                <div className="area-info-row">
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Globe size={16} /> GPS</span>
                                    <span style={{fontSize: '0.8rem', color: '#64748b'}}>
                                        {area.latitudeArea ? Number(area.latitudeArea).toFixed(3) : '0.000'},
                                        {area.longitudeArea ? Number(area.longitudeArea).toFixed(3) : '0.000'}
                                    </span>
                                </div>
                            </div>

                            {/* EXIBIÇÃO DA LISTA DE CULTIVOS */}
                            {idAreaSelecionada === area.idArea && (
                                <div className="cultivos-list-container" style={{background: '#f8fafc', padding: '10px', marginTop: '10px', borderRadius: '6px', border: '1px solid #e2e8f0'}}>
                                    <h4 style={{margin: '0 0 10px 0', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold'}}>
                                        Cultivos nesta área:
                                    </h4>
                                    {cultivos.length === 0 ?
                                        <p style={{color:'#94a3b8', fontSize:'0.85rem', margin: 0, fontStyle: 'italic'}}>Nenhum cultivo ativo encontrado.</p>
                                        :
                                        <div style={{display: 'flex', flexDirection: 'column', gap: '6px'}}>
                                            {cultivos.map((c, i) => (
                                                <div key={i} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '6px 10px', borderRadius: '4px', border: '1px solid #e2e8f0'}}>
                                                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                                        <div style={{background: '#dcfce7', padding: '4px', borderRadius: '4px', color: '#16a34a'}}><Sprout size={14}/></div>
                                                        <span style={{fontSize: '0.85rem', fontWeight: 500}}>{c.plantaCultivada?.nomePopular}</span>
                                                    </div>
                                                    <span style={{fontSize: '0.75rem', color: '#64748b'}}>{c.statusCultivo}</span>
                                                </div>
                                            ))}
                                        </div>
                                    }
                                </div>
                            )}

                            <div className="area-card-actions">
                                <button className="btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => verCultivos(area.idArea)}>
                                    {idAreaSelecionada === area.idArea ? 'Ocultar' : 'Ver Cultivos'}
                                </button>
                                <button className="btn-icon-action" onClick={() => abrirModal(area)}><Pencil size={16} /></button>
                                <button className="btn-icon-action danger" onClick={() => excluirArea(area.idArea, area.nomeArea)}><Trash2 size={16} /></button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {modalAberto && (
                <div className="modal-modern-overlay">
                    <div className="modal-modern-content" style={{maxWidth: '800px'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                            <h2 className="modal-title">{editandoId ? 'Editar Área' : 'Nova Área'}</h2>
                            <button onClick={fecharModal} style={{border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8'}}><X size={24} /></button>
                        </div>

                        <form onSubmit={salvarArea}>
                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px'}}>
                                <div>
                                    <div className="form-group">
                                        <label className="form-label">Nome da Área</label>
                                        <input className="form-input" placeholder="Ex: Setor Norte" value={novaArea.nomeArea} onChange={e => setNovaArea({...novaArea, nomeArea: e.target.value})} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Tamanho (ha)</label>
                                        <input type="number" step="0.1" className="form-input" placeholder="0.0" value={novaArea.tamanhoArea} onChange={e => setNovaArea({...novaArea, tamanhoArea: e.target.value})} required />
                                    </div>

                                    {/* SELETOR DE SOLOS ATUALIZADO (AGRUPADO) */}
                                    <div className="form-group">
                                        <label className="form-label">Tipo de Solo</label>
                                        <select className="form-select" value={novaArea.tipoSolo} onChange={e => setNovaArea({...novaArea, tipoSolo: e.target.value})}>
                                            {Object.entries(CATEGORIAS_SOLO).map(([categoria, solos]) => (
                                                <optgroup key={categoria} label={categoria}>
                                                    {solos.map(solo => (
                                                        <option key={solo} value={solo}>
                                                            {formatarTexto(solo)}
                                                        </option>
                                                    ))}
                                                </optgroup>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Incidência Solar</label>
                                        <select className="form-select" value={novaArea.quantidadeLuz} onChange={e => setNovaArea({...novaArea, quantidadeLuz: e.target.value})}>
                                            <option value="PLENO_SOL">Sol Pleno (6h+)</option>
                                            <option value="MEIA_SOMBRA">Meia Sombra (3h-5h)</option>
                                            <option value="SOMBRA">Sombra</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Referência</label>
                                        <input className="form-input" placeholder="Ex: Perto do rio..." value={novaArea.localizacaoArea} onChange={e => setNovaArea({...novaArea, localizacaoArea: e.target.value})} required />
                                    </div>
                                </div>
                                <div>
                                    <label className="form-label" style={{display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px'}}>
                                        <Globe size={16} className="text-primary"/> Localização GPS
                                    </label>
                                    <div style={{ height: '240px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #cbd5e1', marginBottom: '12px', position: 'relative', zIndex: 0 }}>
                                        <MapContainer
                                            center={[novaArea.latitudeArea || -14.235, novaArea.longitudeArea || -51.925]}
                                            zoom={novaArea.latitudeArea === -14.235 ? 4 : 13}
                                            style={{ height: '100%', width: '100%' }}
                                        >
                                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
                                            <SeletorMapa />
                                        </MapContainer>
                                    </div>
                                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                                        <div>
                                            <label style={{fontSize: '0.75rem', color: '#64748b'}}>Latitude</label>
                                            <input className="form-input" style={{background: '#f1f5f9', fontSize: '0.8rem'}} value={novaArea.latitudeArea ? Number(novaArea.latitudeArea).toFixed(5) : ''} readOnly />
                                        </div>
                                        <div>
                                            <label style={{fontSize: '0.75rem', color: '#64748b'}}>Longitude</label>
                                            <input className="form-input" style={{background: '#f1f5f9', fontSize: '0.8rem'}} value={novaArea.longitudeArea ? Number(novaArea.longitudeArea).toFixed(5) : ''} readOnly />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-outline" onClick={fecharModal}>Cancelar</button>
                                <button type="submit" className="btn-primary">Salvar Área</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Areas;