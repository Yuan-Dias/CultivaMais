import { useState, useEffect } from 'react';
import '../App.css';
import { LayoutDashboard, Sprout, Map, Tractor, CloudSun } from 'lucide-react';

const Dashboard = () => {
    const [resumo, setResumo] = useState({
        totalAreas: 0,
        totalPlantas: 0,
        totalCultivos: 0,
        cultivosAtivos: 0
    });

    const [clima, setClima] = useState(null);
    const [nomeAreaClima, setNomeAreaClima] = useState('');

    const carregarDados = async () => {
        try {
        const [areasRes, plantasRes, cultivosRes] = await Promise.all([
            fetch('http://localhost:8090/api/areas'),
            fetch('http://localhost:8090/api/plantas'),
            fetch('http://localhost:8090/api/cultivos')
        ]);

        const areas = await areasRes.json();
        const plantas = await plantasRes.json();
        const cultivos = await cultivosRes.json();

        setResumo({
            totalAreas: areas.length,
            totalPlantas: plantas.length,
            totalCultivos: cultivos.length,
            cultivosAtivos: cultivos.filter(c => c.statusCultivo === 'ATIVO').length
        });

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

    useEffect(() => {
        carregarDados();
    }, []);

    const CardResumo = ({ titulo, valor, icone, cor }) => (
        <div className="card" style={{ 
        borderLeft: `6px solid ${cor}`, 
        alignItems: 'center', 
        justifyContent: 'flex-start', 
        gap: '20px' 
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
            <h3 style={{ margin: 0, color: '#666', fontSize: '0.9rem', textTransform: 'uppercase' }}>{titulo}</h3>
            <p style={{ margin: '5px 0 0 0', fontSize: '2rem', fontWeight: 'bold', color: '#333' }}>{valor}</p>
        </div>
        </div>
    );
    
    return (
        <div className="anime-fade-in">
        <h1 className="titulo" style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <LayoutDashboard color="#2e7d32" /> Visão Geral da Fazenda
        </h1>

        {/* GRID DE RESUMO */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
            <CardResumo titulo="Áreas Totais" valor={resumo.totalAreas} icone={<Map size={32} />} cor="#1976d2" />
            <CardResumo titulo="Plantas no Catálogo" valor={resumo.totalPlantas} icone={<Sprout size={32} />} cor="#2e7d32" />
            <CardResumo titulo="Cultivos Ativos" valor={resumo.cultivosAtivos} icone={<Tractor size={32} />} cor="#f57f17" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            
            <div className="card" style={{ borderLeft: '6px solid #00bcd4', flexDirection: 'column', alignItems: 'flex-start' }}>
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

            <div className="card" style={{ borderLeft: '6px solid #8e24aa', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
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