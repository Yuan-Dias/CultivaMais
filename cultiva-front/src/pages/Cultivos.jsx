import { useState, useEffect } from 'react';
import '../App.css';
import {
    Trash2, Plus, Calendar, Activity, Pencil, Droplets,
    Bug, Sprout, MapPin, Flag, CheckCircle2, AlertTriangle, X, Save, TrendingUp, Clock
} from 'lucide-react';

const Cultivos = () => {
    // === ESTADOS ===
    const [cultivos, setCultivos] = useState([]);
    const [areas, setAreas] = useState([]);
    const [plantas, setPlantas] = useState([]);

    const [modalAberto, setModalAberto] = useState(false);
    const [editandoId, setEditandoId] = useState(null);

    const [formCultivo, setFormCultivo] = useState({
        idArea: '', idPlanta: '', quantidadePlantada: '', dataPlantio: '',
        statusCultivo: 'ATIVO', estadoPlanta: 'SAUDAVEL', observacaoCultivo: '',
        quantidadeColhida: 0, dataColheitaFinal: ''
    });

    const [acaoEvento, setAcaoEvento] = useState(null);
    const [dadosEvento, setDadosEvento] = useState({
        volume: '', metodo: 'GOTEJAMENTO', nome: '', nivel: 'BAIXO', obs: '', dataHora: ''
    });

    // === 1. CARREGAMENTO ===
    const carregarTudo = () => {
        fetch('http://localhost:8090/api/areas').then(r => r.json()).then(setAreas).catch(console.error);
        fetch('http://localhost:8090/api/plantas').then(r => r.json()).then(setPlantas).catch(console.error);
        fetch('http://localhost:8090/api/cultivos').then(r => r.json()).then(setCultivos).catch(console.error);
    };

    useEffect(() => {
        carregarTudo();
    }, []);

    // Stats
    const totalAtivos = cultivos.filter(c => c.statusCultivo === 'ATIVO').length;
    const totalColhidos = cultivos.filter(c => c.statusCultivo === 'COLHIDO').length;
    const totalAlertas = cultivos.filter(c => c.statusCultivo === 'ATIVO' && (c.estadoPlanta === 'COM_PRAGA' || c.estadoPlanta === 'CRITICO' || c.estadoPlanta === 'EM_ATENCAO')).length;

    // === 2. FUNÇÕES DE MODAL ===
    const abrirModal = (cultivo = null) => {
        if (cultivo) {
            setEditandoId(cultivo.idCultivo);
            setFormCultivo({
                idArea: cultivo.areaCultivo?.idArea || '',
                idPlanta: cultivo.plantaCultivada?.idPlanta || '',
                quantidadePlantada: cultivo.quantidadePlantada,
                dataPlantio: cultivo.dataPlantio,
                statusCultivo: cultivo.statusCultivo,
                estadoPlanta: cultivo.estadoPlanta,
                observacaoCultivo: cultivo.observacaoCultivo || '',
                quantidadeColhida: cultivo.quantidadeColhida || 0,
                // Garante que a data venha formatada corretamente caso venha do backend
                dataColheitaFinal: cultivo.dataColheitaFinal || ''
            });
        } else {
            setEditandoId(null);
            setFormCultivo({
                idArea: '', idPlanta: '', quantidadePlantada: '', dataPlantio: '',
                statusCultivo: 'ATIVO', estadoPlanta: 'SAUDAVEL', observacaoCultivo: '',
                quantidadeColhida: 0, dataColheitaFinal: ''
            });
        }
        setModalAberto(true);
    };

    const fecharModal = () => {
        setModalAberto(false);
        setEditandoId(null);
    };

    // === 3. SALVAR CULTIVO (VERSÃO BLINDADA) ===
    const salvarCultivo = async (e) => {
        e.preventDefault();

        // 1. CONVERSÃO SEGURA DE NÚMEROS E DATAS
        // O Java odeia string vazia "" em campos numéricos ou datas.

        // Garante que IDs sejam números inteiros
        const idAreaNum = parseInt(formCultivo.idArea);
        const idPlantaNum = parseInt(formCultivo.idPlanta);

        // Garante que quantidade plantada seja número
        const qtdPlantadaNum = formCultivo.quantidadePlantada ? parseFloat(formCultivo.quantidadePlantada) : 0;

        // Se quantidade colhida for vazia, manda null (ou 0 se preferir)
        const qtdColhidaNum = formCultivo.quantidadeColhida && formCultivo.quantidadeColhida !== ""
            ? parseFloat(formCultivo.quantidadeColhida)
            : null;

        // Se data colheita for vazia, manda null
        const dataColheitaSegura = formCultivo.dataColheitaFinal === "" ? null : formCultivo.dataColheitaFinal;

        const payload = {
            // Se estiver editando, é bom mandar o ID do próprio cultivo também
            idCultivo: editandoId ? parseInt(editandoId) : null,

            quantidadePlantada: qtdPlantadaNum,
            dataPlantio: formCultivo.dataPlantio,
            statusCultivo: formCultivo.statusCultivo, // Ex: "ATIVO"
            estadoPlanta: formCultivo.estadoPlanta,   // Ex: "SAUDAVEL"
            observacaoCultivo: formCultivo.observacaoCultivo,

            quantidadeColhida: qtdColhidaNum,
            dataColheitaFinal: dataColheitaSegura,

            // OBJETOS RELACIONADOS
            // Importante: No Java, Area e Planta devem ser objetos com ID
            plantaCultivada: { idPlanta: idPlantaNum },
            areaCultivo: { idArea: idAreaNum }
        };

        console.log("Enviando Payload:", JSON.stringify(payload));

        try {
            const url = editandoId
                ? `http://localhost:8090/api/cultivos/${editandoId}`
                : `http://localhost:8090/api/cultivos?idPlanta=${idPlantaNum}&idArea=${idAreaNum}&quantidadePlantada=${qtdPlantadaNum}&dataPlantio=${formCultivo.dataPlantio}`;

            // Nota: No POST você usava query params na URL, no PUT usa corpo JSON.
            // Mantive a lógica original do seu POST, mas ajustei o PUT.

            const options = {
                method: editandoId ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            // Se for PUT, adiciona o corpo. Se for POST do jeito antigo (query param), não precisa body
            if (editandoId) {
                options.body = JSON.stringify(payload);
            }

            const response = await fetch(url, options);

            if (response.ok) {
                carregarTudo();
                fecharModal();
                alert("Salvo com sucesso!");
            } else {
                const errorText = await response.text();
                console.error("Erro no servidor:", errorText);
                alert(`Erro ao salvar: ${response.status}`);
            }
        } catch (error) {
            console.error("Erro de rede:", error);
            alert("Erro de conexão com o servidor.");
        }
    };

    const handleResponse = (res) => {
        if (res.ok) {
            carregarTudo();
            fecharModal();
        } else {
            alert('Erro ao salvar. Verifique os dados.');
        }
    };

    // === 4. EXCLUIR ===
    const excluirCultivo = (id) => {
        if (confirm("Tem a certeza que deseja remover este cultivo? Todo o histórico será apagado.")) {
            fetch(`http://localhost:8090/api/cultivos/${id}`, { method: 'DELETE' })
                .then(res => { if (res.ok) carregarTudo(); });
        }
    };

    // === 5. EVENTOS ===
    const abrirEvento = (tipo, idCultivo) => {
        if (acaoEvento && acaoEvento.id === idCultivo && acaoEvento.tipo === tipo) {
            setAcaoEvento(null);
            return;
        }
        setAcaoEvento({ tipo, id: idCultivo });
        const agora = new Date();
        agora.setMinutes(agora.getMinutes() - agora.getTimezoneOffset());
        setDadosEvento(prev => ({ ...prev, dataHora: agora.toISOString().slice(0, 16) }));
    };

    const salvarEvento = (e) => {
        e.preventDefault();
        let url = acaoEvento.tipo === 'IRRIGACAO'
            ? `http://localhost:8090/api/eventos/irrigacao?cultivoId=${acaoEvento.id}&volume=${dadosEvento.volume}&metodo=${dadosEvento.metodo}&obs=${dadosEvento.obs}&dataHora=${dadosEvento.dataHora}`
            : `http://localhost:8090/api/eventos/praga?cultivoId=${acaoEvento.id}&nome=${dadosEvento.nome}&nivel=${dadosEvento.nivel}&obs=${dadosEvento.obs}&dataHora=${dadosEvento.dataHora}`;

        fetch(url, { method: 'POST' }).then(res => {
            if (res.ok) {
                alert(acaoEvento.tipo === 'IRRIGACAO' ? 'Rega registrada!' : 'Praga registrada!');
                setAcaoEvento(null);
                setDadosEvento({ volume: '', metodo: 'GOTEJAMENTO', nome: '', nivel: 'BAIXO', obs: '', dataHora: '' });
            } else alert('Erro ao registrar evento.');
        });
    };

    const getHealthClass = (health) => {
        if (health === 'SAUDAVEL') return 'health-saudavel';
        if (health === 'EM_ATENCAO') return 'health-atencao';
        return 'health-critico';
    };

    const getHealthLabel = (health) => {
        if (health === 'SAUDAVEL') return { icon: CheckCircle2, text: 'Saudável', color: '#16a34a' };
        if (health === 'EM_ATENCAO') return { icon: AlertTriangle, text: 'Atenção', color: '#eab308' };
        return { icon: Bug, text: 'Com Praga', color: '#ef4444' };
    };

    // Função auxiliar para formatar datas com segurança
    const formatarData = (dataString) => {
        if (!dataString) return '--/--/----';
        const partes = dataString.split('-');
        // Garante que não haja problema de fuso horário ao criar a data apenas para visualização
        if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
        return new Date(dataString).toLocaleDateString('pt-BR');
    };

    return (
        <div className="animate-fade-in" style={{ padding: '0 10px' }}>

            {/* HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Controle de Cultivos</h1>
                    <p style={{ color: '#64748b', marginTop: '4px' }}>Acompanhe o plantio, irrigação e saúde da lavoura.</p>
                </div>
                <button className="btn-primary" onClick={() => abrirModal()}>
                    <Plus size={20} /> Novo Cultivo
                </button>
            </div>

            {/* STATS */}
            <div className="kpi-grid" style={{ marginBottom: '32px' }}>
                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-title">Em Produção</span>
                        <div className="icon-box bg-green-light"><Sprout size={20} /></div>
                    </div>
                    <div className="kpi-value">{totalAtivos}</div>
                    <div className="kpi-subtext">Cultivos ativos</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-title">Alertas de Saúde</span>
                        <div className="icon-box bg-red-light"><Activity size={20} /></div>
                    </div>
                    <div className="kpi-value" style={{color: totalAlertas > 0 ? '#ef4444' : 'inherit'}}>{totalAlertas}</div>
                    <div className="kpi-subtext">Requerem atenção</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-title">Colhidos</span>
                        <div className="icon-box bg-blue-light"><Flag size={20} /></div>
                    </div>
                    <div className="kpi-value">{totalColhidos}</div>
                    <div className="kpi-subtext">Finalizados</div>
                </div>
            </div>

            {/* GRID DE CULTIVOS */}
            <div className="cultivos-grid">
                {cultivos.map(cultivo => {
                    const healthInfo = getHealthLabel(cultivo.estadoPlanta);

                    return (
                        <div key={cultivo.idCultivo} className="cultivo-card">
                            <div className={`health-indicator ${getHealthClass(cultivo.estadoPlanta)}`}></div>

                            <div className="cultivo-content">
                                <div className="cultivo-header">
                                    <div>
                                        <div style={{display:'flex', gap:'8px', marginBottom:'6px'}}>
                                <span className={`status-badge ${cultivo.statusCultivo === 'ATIVO' ? 'status-ativo' : 'status-colhido'}`}>
                                    {cultivo.statusCultivo}
                                </span>
                                        </div>
                                        <h3 className="cultivo-title">
                                            {cultivo.plantaCultivada ? cultivo.plantaCultivada.nomePopular : 'Planta Removida'}
                                        </h3>
                                        <p className="cultivo-subtitle">
                                            Plantado em: {formatarData(cultivo.dataPlantio)}
                                        </p>
                                    </div>

                                    <div className="cultivo-top-actions">
                                        <button onClick={() => abrirModal(cultivo)} className="btn-icon-sm" title="Editar">
                                            <Pencil size={16} />
                                        </button>
                                        <button onClick={() => excluirCultivo(cultivo.idCultivo)} className="btn-icon-sm danger" title="Excluir">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="cultivo-info-row">
                                    <Activity size={16} color={healthInfo.color} />
                                    <span style={{fontWeight: 500, color: healthInfo.color}}>{healthInfo.text}</span>
                                </div>

                                <div className="cultivo-info-row">
                                    <MapPin size={16} className="text-gray-400" />
                                    <span>{cultivo.areaCultivo ? cultivo.areaCultivo.nomeArea : 'Área não definida'}</span>
                                </div>

                                <div className="cultivo-info-row">
                                    <Sprout size={16} className="text-gray-400" />
                                    <span>Qtd Plantada: <strong>{cultivo.quantidadePlantada}</strong></span>
                                </div>

                                {/* --- VISUALIZAÇÃO DAS DATAS CORRIGIDA --- */}

                                {/* CASO 1: CULTIVO ATIVO (Mostra Previsão) */}
                                {cultivo.statusCultivo === 'ATIVO' && cultivo.previsaoColheita && (
                                    <div className="cultivo-info-row" style={{ marginTop: '8px' }}>
                                        <Clock size={16} className="text-blue-500" />
                                        <span style={{ color: '#334155' }}>
                                Previsão: <strong>{formatarData(cultivo.previsaoColheita)}</strong>
                            </span>
                                    </div>
                                )}

                                {/* CASO 2: CULTIVO COLHIDO (Mostra Data Real e Quantidade) */}
                                {cultivo.statusCultivo === 'COLHIDO' && (
                                    <div style={{ marginTop: '12px', padding: '10px', background: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                                        <div className="cultivo-info-row" style={{marginBottom: '4px'}}>
                                            <TrendingUp size={16} className="text-green-600" />
                                            <span style={{color: '#15803d', fontWeight: 600}}>
                                    Colhido: {cultivo.quantidadeColhida} kg
                                </span>
                                        </div>

                                        {/* AQUI ESTÁ A DATA DA COLHEITA */}
                                        <div className="cultivo-info-row">
                                            <Flag size={16} className="text-green-600" />
                                            <span style={{color: '#15803d', fontSize: '0.9rem'}}>
                                    Data: <strong>{formatarData(cultivo.dataColheitaFinal)}</strong>
                                </span>
                                        </div>
                                    </div>
                                )}

                                {cultivo.observacaoCultivo && (
                                    <div className="cultivo-obs">
                                        "{cultivo.observacaoCultivo}"
                                    </div>
                                )}
                            </div>

                            <div className="cultivo-actions">
                                <button
                                    className="btn-action-cultivo water"
                                    onClick={() => abrirEvento('IRRIGACAO', cultivo.idCultivo)}
                                >
                                    <Droplets size={16} className={acaoEvento?.id === cultivo.idCultivo && acaoEvento?.tipo === 'IRRIGACAO' ? 'fill-current' : ''}/>
                                    Regar
                                </button>
                                <button
                                    className="btn-action-cultivo pest"
                                    onClick={() => abrirEvento('PRAGA', cultivo.idCultivo)}
                                >
                                    <Bug size={16} className={acaoEvento?.id === cultivo.idCultivo && acaoEvento?.tipo === 'PRAGA' ? 'fill-current' : ''}/>
                                    Reportar
                                </button>
                            </div>

                            {/* GAVETA DE EVENTOS */}
                            {acaoEvento && acaoEvento.id === cultivo.idCultivo && (
                                <div className={`event-drawer ${acaoEvento.tipo === 'IRRIGACAO' ? 'water-theme' : 'pest-theme'}`}>
                                    <div className="drawer-header">
                            <span className={acaoEvento.tipo === 'IRRIGACAO' ? 'text-water' : 'text-pest'}>
                                {acaoEvento.tipo === 'IRRIGACAO' ? 'Registrar Irrigação' : 'Registrar Praga'}
                            </span>
                                        <button className="btn-close-drawer" onClick={() => setAcaoEvento(null)}>
                                            <X size={18} />
                                        </button>
                                    </div>
                                    <form onSubmit={salvarEvento}>
                                        {acaoEvento.tipo === 'IRRIGACAO' ? (
                                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px'}}>
                                                <div>
                                                    <label className="form-label" style={{fontSize: '0.75rem'}}>Volume (L/mm)</label>
                                                    <input type="number" required className="form-input" value={dadosEvento.volume} onChange={e => setDadosEvento({...dadosEvento, volume: e.target.value})} />
                                                </div>
                                                <div>
                                                    <label className="form-label" style={{fontSize: '0.75rem'}}>Método</label>
                                                    <select className="form-select" value={dadosEvento.metodo} onChange={e => setDadosEvento({...dadosEvento, metodo: e.target.value})}>
                                                        <option value="GOTEJAMENTO">Gotejamento</option>
                                                        <option value="ASPERSAO">Aspersão</option>
                                                        <option value="MANUAL">Manual</option>
                                                    </select>
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{marginBottom: '10px'}}>
                                                <div style={{marginBottom: '10px'}}>
                                                    <label className="form-label" style={{fontSize: '0.75rem'}}>Nome da Praga</label>
                                                    <input type="text" required className="form-input" value={dadosEvento.nome} onChange={e => setDadosEvento({...dadosEvento, nome: e.target.value})} />
                                                </div>
                                                <div>
                                                    <label className="form-label" style={{fontSize: '0.75rem'}}>Severidade</label>
                                                    <select className="form-select" value={dadosEvento.nivel} onChange={e => setDadosEvento({...dadosEvento, nivel: e.target.value})}>
                                                        <option value="BAIXO">Baixo</option>
                                                        <option value="MEDIO">Médio</option>
                                                        <option value="ALTO">Alto</option>
                                                        <option value="CRITICO">Crítico</option>
                                                    </select>
                                                </div>
                                            </div>
                                        )}
                                        <div style={{marginBottom: '10px'}}>
                                            <label className="form-label" style={{fontSize: '0.75rem'}}>Data/Hora</label>
                                            <input type="datetime-local" required className="form-input" value={dadosEvento.dataHora} onChange={e => setDadosEvento({...dadosEvento, dataHora: e.target.value})} />
                                        </div>
                                        <button type="submit" className="btn-primary" style={{width: '100%', justifyContent: 'center'}}>
                                            <Save size={16} /> Salvar Evento
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* --- MODAL DE CADASTRO/EDIÇÃO --- */}
            {modalAberto && (
                <div className="modal-modern-overlay">
                    <div className="modal-modern-content">
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <h2 className="modal-title">{editandoId ? 'Editar Cultivo' : 'Novo Cultivo'}</h2>
                            <button onClick={fecharModal} style={{border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8'}}><X size={24} /></button>
                        </div>
                        <p className="modal-desc">Dados do plantio e colheita.</p>

                        <form onSubmit={salvarCultivo}>
                            {!editandoId && (
                                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                                    <div className="form-group">
                                        <label className="form-label">Área</label>
                                        <select className="form-select" value={formCultivo.idArea} onChange={e => setFormCultivo({...formCultivo, idArea: e.target.value})} required>
                                            <option value="">Selecione...</option>
                                            {areas.map(a => <option key={a.idArea} value={a.idArea}>{a.nomeArea}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Planta</label>
                                        <select className="form-select" value={formCultivo.idPlanta} onChange={e => setFormCultivo({...formCultivo, idPlanta: e.target.value})} required>
                                            <option value="">Selecione...</option>
                                            {plantas.map(p => <option key={p.idPlanta} value={p.idPlanta}>{p.nomePopular}</option>)}
                                        </select>
                                    </div>
                                </div>
                            )}

                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                                <div className="form-group">
                                    <label className="form-label">Qtd Plantada</label>
                                    <input type="number" className="form-input" value={formCultivo.quantidadePlantada} onChange={e => setFormCultivo({...formCultivo, quantidadePlantada: e.target.value})} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Data Plantio</label>
                                    <input type="date" className="form-input" value={formCultivo.dataPlantio} onChange={e => setFormCultivo({...formCultivo, dataPlantio: e.target.value})} required />
                                </div>
                            </div>

                            {editandoId && (
                                <div style={{marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed #e2e8f0'}}>
                                    <h4 style={{fontSize: '0.9rem', color: '#475569', marginBottom: '10px'}}>Atualização de Status</h4>
                                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                                        <div className="form-group">
                                            <label className="form-label">Status</label>
                                            <select className="form-select" value={formCultivo.statusCultivo} onChange={e => setFormCultivo({...formCultivo, statusCultivo: e.target.value})}>
                                                <option value="ATIVO">Ativo</option>
                                                <option value="COLHIDO">Colhido</option>
                                                <option value="CANCELADO">Cancelado</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Saúde</label>
                                            <select className="form-select" value={formCultivo.estadoPlanta} onChange={e => setFormCultivo({...formCultivo, estadoPlanta: e.target.value})}>
                                                <option value="SAUDAVEL">Saudável</option>
                                                <option value="EM_ATENCAO">Em Atenção</option>
                                                <option value="COM_PRAGA">Com Praga</option>
                                                <option value="CRITICO">Crítico</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '10px'}}>
                                        <div className="form-group">
                                            <label className="form-label">Qtd Colhida</label>
                                            <input
                                                type="number" className="form-input"
                                                value={formCultivo.quantidadeColhida}
                                                onChange={e => setFormCultivo({...formCultivo, quantidadeColhida: e.target.value})}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Data Colheita Final</label>
                                            <input
                                                type="date" className="form-input"
                                                value={formCultivo.dataColheitaFinal}
                                                onChange={e => setFormCultivo({...formCultivo, dataColheitaFinal: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group" style={{marginTop: '10px'}}>
                                        <label className="form-label">Observação</label>
                                        <input className="form-input" value={formCultivo.observacaoCultivo} onChange={e => setFormCultivo({...formCultivo, observacaoCultivo: e.target.value})} />
                                    </div>
                                </div>
                            )}

                            <div className="modal-footer">
                                <button type="button" className="btn-outline" onClick={fecharModal}>Cancelar</button>
                                <button type="submit" className="btn-primary">
                                    {editandoId ? 'Atualizar' : 'Iniciar Cultivo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cultivos;