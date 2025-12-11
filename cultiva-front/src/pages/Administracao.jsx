import { useState, useEffect } from 'react';
import '../App.css';
import { 
    UserPlus, ShieldCheck, Users, Trash2, 
    Database, Download, Lock, Key, Shield 
} from 'lucide-react';

const Administracao = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  
  const [novoUsuario, setNovoUsuario] = useState({
    nomeUsuario: '',
    email: '',
    senha: '',
    funcao: 'OPERADOR_MAQUINAS'
  });

  // --- 1. Carregar Dados ---
  const carregarUsuarios = () => {
    fetch('http://localhost:8090/api/usuarios')
      .then(res => res.json())
      .then(data => setUsuarios(data))
      .catch(err => console.error("Erro ao buscar usuários:", err));
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  // --- 2. Salvar Usuário ---
  const salvarUsuario = (e) => {
    e.preventDefault();
    fetch('http://localhost:8090/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novoUsuario)
    }).then(res => {
      if (res.ok) {
        alert('Utilizador cadastrado com sucesso!');
        carregarUsuarios();
        setNovoUsuario({ nomeUsuario: '', email: '', senha: '', funcao: 'OPERADOR_MAQUINAS' });
        setModalAberto(false);
      } else {
        alert('Erro ao cadastrar. Verifique os dados.');
      }
    });
  };

  // --- 3. Excluir Usuário ---
  const excluirUsuario = (id, nome) => {
    if (confirm(`Tem a certeza que deseja remover o utilizador "${nome}"?`)) {
        fetch(`http://localhost:8090/api/usuarios/${id}`, {
            method: 'DELETE'
        }).then(res => {
            if (res.ok) {
                carregarUsuarios();
            } else {
                alert('Erro ao remover.');
            }
        });
    }
  };

  // --- Helpers Visuais ---
  const getRoleConfig = (role) => {
      switch(role) {
          case 'ADMINISTRADOR': return { class: 'role-admin', label: 'Admin', avatarClass: 'avatar-admin' };
          case 'GERENTE_PRODUCAO': return { class: 'role-gerente', label: 'Gerente', avatarClass: 'avatar-gerente' };
          case 'TECNICO_AGRICOLA': return { class: 'role-tecnico', label: 'Técnico', avatarClass: 'avatar-tecnico' };
          default: return { class: 'role-operador', label: 'Operador', avatarClass: 'avatar-operador' };
      }
  };

  const getInitials = (name) => {
      return name ? name.charAt(0).toUpperCase() : '?';
  };

  return (
    <div className="animate-fade-in" style={{ padding: '0 10px' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
         <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck className="text-primary"/> Administração
            </h1>
            <p style={{ color: '#64748b', marginTop: '4px' }}>Gerencie usuários, permissões e segurança do sistema.</p>
         </div>
         <button className="btn-primary" onClick={() => setModalAberto(true)}>
            <UserPlus size={20} /> Novo Usuário
         </button>
      </div>

      {/* KPI Cards Rápidos */}
      <div className="kpi-grid" style={{ marginBottom: '40px' }}>
          <div className="kpi-card">
              <div className="kpi-header">
                  <span className="kpi-title">Total de Usuários</span>
                  <div className="icon-box bg-blue-light"><Users size={20}/></div>
              </div>
              <div className="kpi-value">{usuarios.length}</div>
          </div>
          <div className="kpi-card">
              <div className="kpi-header">
                  <span className="kpi-title">Administradores</span>
                  <div className="icon-box bg-red-light"><Shield size={20}/></div>
              </div>
              <div className="kpi-value">{usuarios.filter(u => u.funcao === 'ADMINISTRADOR').length}</div>
          </div>
          <div className="kpi-card">
              <div className="kpi-header">
                  <span className="kpi-title">Segurança</span>
                  <div className="icon-box bg-green-light"><Lock size={20}/></div>
              </div>
              <div className="kpi-value" style={{fontSize: '1.2rem', color: '#16a34a'}}>Ativa</div>
              <div className="kpi-subtext">Sistema protegido</div>
          </div>
      </div>

      {/* Título da Seção */}
      <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#0f172a', marginBottom: '20px' }}>Equipa Registada</h3>

      {/* Grid de Usuários */}
      <div className="users-grid">
        {usuarios.map(user => {
            const config = getRoleConfig(user.funcao);
            return (
                <div key={user.idUsuario} className="user-card">
                    <button 
                        className="btn-delete-user" 
                        onClick={() => excluirUsuario(user.idUsuario, user.nomeUsuario)}
                        title="Remover Usuário"
                    >
                        <Trash2 size={18} />
                    </button>

                    <div className={`user-avatar-lg ${config.avatarClass}`}>
                        {getInitials(user.nomeUsuario)}
                    </div>
                    
                    <div className="user-info-content">
                        <h3>{user.nomeUsuario}</h3>
                        <span className="user-email">{user.email}</span>
                        <span className={`role-badge ${config.class}`}>
                            {config.label}
                        </span>
                    </div>
                </div>
            );
        })}
      </div>

      {/* Painéis de Configuração e Backup (Visuais) */}
      <div className="admin-section-grid">
          {/* Painel de Backup */}
          <div className="admin-panel-card">
              <div className="panel-header">
                  <Database className="text-primary" size={24} />
                  <div>
                      <h4 className="panel-title">Backup de Dados</h4>
                      <p className="panel-desc">Cópias de segurança do sistema.</p>
                  </div>
              </div>
              <div>
                  <div className="panel-row">
                      <span className="panel-label">Último backup</span>
                      <span className="panel-value">Automático (Hoje 03:00)</span>
                  </div>
                  <div className="panel-row">
                      <span className="panel-label">Tamanho</span>
                      <span className="panel-value">~45 MB</span>
                  </div>
              </div>
              <button className="btn-outline" style={{width: '100%', justifyContent: 'center', marginTop: '10px'}}>
                  <Download size={16} style={{marginRight: '8px'}}/> Baixar Backup Manual
              </button>
          </div>

          {/* Painel de Segurança */}
          <div className="admin-panel-card">
              <div className="panel-header">
                  <Key className="text-orange-500" size={24} />
                  <div>
                      <h4 className="panel-title">Credenciais</h4>
                      <p className="panel-desc">Políticas de senha e acesso.</p>
                  </div>
              </div>
              <div>
                  <div className="panel-row">
                      <span className="panel-label">Complexidade de Senha</span>
                      <span className="panel-value">Alta</span>
                  </div>
                  <div className="panel-row">
                      <span className="panel-label">Expiração de Sessão</span>
                      <span className="panel-value">24 Horas</span>
                  </div>
              </div>
              <button className="btn-outline" style={{width: '100%', justifyContent: 'center', marginTop: '10px'}}>
                  Gerenciar Políticas
              </button>
          </div>
      </div>

      {/* --- MODAL DE CADASTRO --- */}
      {modalAberto && (
        <div className="modal-modern-overlay">
            <div className="modal-modern-content">
                <h2 className="modal-title">Novo Usuário</h2>
                <p className="modal-desc">Cadastre um novo membro para acessar o sistema.</p>
                
                <form onSubmit={salvarUsuario}>
                    <div className="form-group">
                        <label className="form-label">Nome Completo</label>
                        <input className="form-input" placeholder="Ex: Maria Silva" 
                            value={novoUsuario.nomeUsuario} onChange={e => setNovoUsuario({...novoUsuario, nomeUsuario: e.target.value})} required />
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">E-mail</label>
                        <input type="email" className="form-input" placeholder="maria@fazenda.com" 
                            value={novoUsuario.email} onChange={e => setNovoUsuario({...novoUsuario, email: e.target.value})} required />
                    </div>

                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                        <div className="form-group">
                            <label className="form-label">Senha Inicial</label>
                            <input type="password" className="form-input" placeholder="******" 
                                value={novoUsuario.senha} onChange={e => setNovoUsuario({...novoUsuario, senha: e.target.value})} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Função</label>
                            <select className="form-select" value={novoUsuario.funcao} onChange={e => setNovoUsuario({...novoUsuario, funcao: e.target.value})}>
                                <option value="ADMINISTRADOR">Administrador</option>
                                <option value="GERENTE_PRODUCAO">Gerente</option>
                                <option value="ENGENHEIRO_AGRONOMO">Engenheiro</option>
                                <option value="TECNICO_AGRICOLA">Técnico</option>
                                <option value="OPERADOR_MAQUINAS">Operador</option>
                            </select>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-outline" onClick={() => setModalAberto(false)}>Cancelar</button>
                        <button type="submit" className="btn-primary">Cadastrar</button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};

export default Administracao;