import { useState, useEffect } from 'react';
import '../App.css';
import { UserPlus, ShieldCheck, Users, Trash2 } from 'lucide-react';

const Administracao = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [novoUsuario, setNovoUsuario] = useState({
    nomeUsuario: '',
    email: '',
    senha: '',
    funcao: 'OPERADOR_MAQUINAS'
  });

  const carregarUsuarios = () => {
    fetch('http://localhost:8090/api/usuarios')
      .then(res => res.json())
      .then(data => setUsuarios(data))
      .catch(err => console.error("Erro ao buscar usuários:", err));
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const salvarUsuario = (e) => {
    e.preventDefault();
    fetch('http://localhost:8090/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novoUsuario)
    }).then(res => {
      if (res.ok) {
        alert('Utilizador cadastrado com sucesso! 👤');
        carregarUsuarios();
        setNovoUsuario({ nomeUsuario: '', email: '', senha: '', funcao: 'OPERADOR_MAQUINAS' });
      } else {
        alert('Erro ao cadastrar. Verifique os dados.');
      }
    });
  };

  const excluirUsuario = (id, nome) => {
    if (confirm(`Tem a certeza que deseja remover o utilizador "${nome}"?`)) {
        fetch(`http://localhost:8090/api/usuarios/${id}`, {
            method: 'DELETE'
        }).then(res => {
            if (res.ok) {
                alert('Utilizador removido.');
                carregarUsuarios();
            } else {
                alert('Erro ao remover.');
            }
        });
    }
  };

  return (
    <div className="anime-fade-in">
      <h1 className="titulo" style={{textAlign: 'left', display: 'flex', gap: '10px'}}>
        <ShieldCheck /> Administração
      </h1>

      <div className="card formulario" style={{borderLeft: '6px solid #8e24aa', marginBottom: '30px'}}>
        <h2 style={{color: '#8e24aa', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px'}}>
            <UserPlus size={24}/> Novo Utilizador
        </h2>
        <form onSubmit={salvarUsuario}>
          <div className="campo-grupo">
            <input 
                placeholder="Nome Completo" 
                value={novoUsuario.nomeUsuario} 
                onChange={e => setNovoUsuario({...novoUsuario, nomeUsuario: e.target.value})} 
                required 
            />
            <input 
                placeholder="E-mail" 
                type="email"
                value={novoUsuario.email} 
                onChange={e => setNovoUsuario({...novoUsuario, email: e.target.value})} 
                required 
            />
          </div>

          <div className="campo-grupo">
            <input 
                placeholder="Senha" 
                type="password"
                value={novoUsuario.senha} 
                onChange={e => setNovoUsuario({...novoUsuario, senha: e.target.value})} 
                required 
            />
            <select 
                value={novoUsuario.funcao} 
                onChange={e => setNovoUsuario({...novoUsuario, funcao: e.target.value})}
            >
                <option value="ADMINISTRADOR">Administrador</option>
                <option value="GERENTE_PRODUCAO">Gerente</option>
                <option value="ENGENHEIRO_AGRONOMO">Engenheiro</option>
                <option value="TECNICO_AGRICOLA">Técnico</option>
                <option value="OPERADOR_MAQUINAS">Operador</option>
            </select>
          </div>
          <button type="submit" className="botao-salvar" style={{backgroundColor: '#8e24aa'}}>Cadastrar</button>
        </form>
      </div>

      <div className="grid-areas">
        {usuarios.map(user => (
            <div key={user.idUsuario} className="card" style={{borderLeft: '6px solid #8e24aa', display: 'flex', alignItems: 'center', gap: '15px', position: 'relative'}}>
                
                <button 
                    onClick={() => excluirUsuario(user.idUsuario, user.nomeUsuario)}
                    style={{
                        position: 'absolute', 
                        top: '15px', 
                        right: '15px', 
                        background: 'transparent', 
                        border: 'none', 
                        color: '#d32f2f', 
                        cursor: 'pointer'
                    }}
                    title="Remover Utilizador"
                >
                    <Trash2 size={20} />
                </button>

                <div style={{background: '#f3e5f5', padding: '15px', borderRadius: '50%', color: '#8e24aa'}}>
                    <Users size={24} />
                </div>
                <div>
                    <h3 style={{margin: 0, color: '#333', paddingRight: '30px'}}>{user.nomeUsuario}</h3>
                    <p style={{margin: '5px 0', color: '#666', fontSize: '0.9rem'}}>{user.email}</p>
                    <span className="badge-solo" style={{backgroundColor: '#f3e5f5', color: '#8e24aa', marginTop: '5px'}}>
                        {user.funcao}
                    </span>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default Administracao;