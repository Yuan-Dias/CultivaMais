import { useState, useEffect } from 'react';
import '../App.css';
import { Sprout, AlertCircle, CheckCircle, TrendingUp } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// Dados simulados para o gráfico (pois não temos histórico temporal no banco ainda)
const mockData = [
  { month: "Jan", value: 45 },
  { month: "Fev", value: 52 },
  { month: "Mar", value: 48 },
  { month: "Abr", value: 61 },
  { month: "Mai", value: 55 },
  { month: "Jun", value: 67 },
];

const Dashboard = () => {
  // Estados para os dados reais do Banco
  const [stats, setStats] = useState({
    cultivosAtivos: 0,
    plantasSaudaveis: 0,
    alertasPendentes: 0,
    tarefasConcluidas: 0,
    totalAreas: 0
  });

  // Estado para sugestão inteligente
  const [sugestao, setSugestao] = useState({
    area: "Carregando...",
    planta: "Carregando..."
  });

  // --- LÓGICA DE DADOS (Integração Java) ---
  useEffect(() => {
    const carregarDados = async () => {
      try {
        // 1. Busca dados de TODOS os endpoints
        const [cultivosRes, tarefasRes, areasRes] = await Promise.all([
          fetch('http://localhost:8090/api/cultivos'),
          fetch('http://localhost:8090/api/tarefas'),
          fetch('http://localhost:8090/api/areas')
        ]);

        const cultivos = await cultivosRes.json();
        const tarefas = await tarefasRes.json();
        const areas = await areasRes.json();

        // --- CÁLCULOS REAIS ---
        
        // 1. Cultivos Ativos
        const ativos = cultivos.filter(c => c.statusCultivo === 'ATIVO');
        
        // 2. Plantas Saudáveis (Cultivos ativos que estão 'SAUDAVEL')
        const saudaveis = ativos.filter(c => c.estadoPlanta === 'SAUDAVEL').length;

        // 3. Alertas (Cultivos com Praga ou Críticos ou Em Atenção)
        const alertas = ativos.filter(c => 
            c.estadoPlanta === 'COM_PRAGA' || c.estadoPlanta === 'CRITICO' || c.estadoPlanta === 'EM_ATENCAO'
        ).length;

        // 4. Tarefas Concluídas
        const tarefasFeitas = tarefas.filter(t => t.concluida).length;

        setStats({
            cultivosAtivos: ativos.length,
            plantasSaudaveis: saudaveis,
            alertasPendentes: alertas,
            tarefasConcluidas: tarefasFeitas,
            totalAreas: areas.length
        });

        // 3. Lógica simples para o Banner de Sugestão
        if (areas.length > 0) {
            setSugestao({
                area: areas[0].nomeArea, // Pega o nome da primeira área real
                planta: "Leguminosas" // Sugestão fixa por enquanto (poderia vir de lógica complexa)
            });
        } else {
             setSugestao({ area: "Nenhuma área", planta: "..." });
        }

      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      }
    };

    carregarDados();
  }, []);

  return (
    <div className="anime-fade-in">
      
      {/* Cabeçalho */}
      <div className="dashboard-header">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="dashboard-subtitle">Visão geral do sistema Cultiva+</p>
      </div>

      {/* Banner de Sugestão Inteligente */}
      <div className="dashboard-banner">
        <div className="banner-icon">
          <Sprout size={24} />
        </div>
        <div className="banner-content">
          <h3>💡 Sugestão Inteligente</h3>
          <p>
            Com base no clima atual e tipo de solo, recomendamos o plantio de <strong>{sugestao.planta}</strong> na área <strong>{sugestao.area}</strong>. 
            Condições ideais para crescimento nos próximos 45 dias.
          </p>
          <button className="btn-primary" style={{fontSize: '0.85rem', padding: '6px 12px'}}>
            Ver Detalhes
          </button>
        </div>
      </div>

      {/* Grid de Estatísticas (Com Dados Reais) */}
      <div className="grid-4">
        
        {/* Card 1: Cultivos Ativos */}
        <div className="stat-card-simple">
          <div className="stat-card-header">
            <span className="stat-card-title">Cultivos Ativos</span>
            <Sprout size={20} className="text-primary" />
          </div>
          <div>
            <div className="stat-card-value text-primary">{stats.cultivosAtivos}</div>
            <p className="stat-card-footer">Em produção agora</p>
          </div>
        </div>

        {/* Card 2: Plantas Saudáveis */}
        <div className="stat-card-simple">
          <div className="stat-card-header">
            <span className="stat-card-title">Plantas Saudáveis</span>
            <CheckCircle size={20} className="text-primary" />
          </div>
          <div>
            <div className="stat-card-value text-primary">{stats.plantasSaudaveis}</div>
            <p className="stat-card-footer">
                {stats.cultivosAtivos > 0 
                    ? Math.round((stats.plantasSaudaveis / stats.cultivosAtivos) * 100) 
                    : 0}% do total
            </p>
          </div>
        </div>

        {/* Card 3: Alertas */}
        <div className="stat-card-simple">
          <div className="stat-card-header">
            <span className="stat-card-title">Alertas Pendentes</span>
            <AlertCircle size={20} className="text-accent" />
          </div>
          <div>
            <div className="stat-card-value text-accent">{stats.alertasPendentes}</div>
            <p className="stat-card-footer">Requer atenção</p>
          </div>
        </div>

        {/* Card 4: Tarefas Concluídas */}
        <div className="stat-card-simple">
          <div className="stat-card-header">
            <span className="stat-card-title">Tarefas Concluídas</span>
            <TrendingUp size={20} className="text-secondary" />
          </div>
          <div>
            <div className="stat-card-value text-secondary">{stats.tarefasConcluidas}</div>
            <p className="stat-card-footer">Total acumulado</p>
          </div>
        </div>

      </div>

      {/* Gráfico de Crescimento */}
      <div className="chart-card">
        <div className="card-header">
          <h3 className="card-title">Crescimento e Produtividade (Simulado)</h3>
        </div>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={mockData}>
              <XAxis 
                dataKey="month" 
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#16a34a" 
                strokeWidth={3}
                dot={{ fill: "#16a34a", r: 4, strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;