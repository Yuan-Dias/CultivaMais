import React, { useState, useEffect } from 'react';
import {
    User, Mail, Shield, Save, Key,
    Bell, CheckCircle, AlertCircle, Lock
} from 'lucide-react';
import { userService, authService } from '../services/api';
import '../css/Perfil.css';

const Perfil = () => {
    const [carregando, setCarregando] = useState(true);
    const [abaAtiva, setAbaAtiva] = useState('dados');
    const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });

    // Objeto vindo do Banco (Java)
    const [usuarioBanco, setUsuarioBanco] = useState(null);

    // Estado do formulário
    const [formulario, setFormulario] = useState({
        nomeUsuario: '',
        email: ''
    });

    const [dadosSenha, setDadosSenha] = useState({
        novaSenha: '',
        confirmarSenha: ''
    });

    useEffect(() => {
        const sessao = authService.obterUsuarioLogado();

        // CORREÇÃO: Pega o idUsuario do objeto Java
        const idParaBuscar = sessao?.idUsuario;

        if (idParaBuscar) {
            carregarDadosDoServidor(idParaBuscar);
        } else {
            setMensagem({ tipo: 'erro', texto: 'Sessão inválida. Faça login novamente.' });
            setCarregando(false);
        }
    }, []);

    const carregarDadosDoServidor = async (id) => {
        try {
            const dados = await userService.obterPorId(id);
            setUsuarioBanco(dados);

            // Preenche os campos editáveis
            setFormulario({
                nomeUsuario: dados.nomeUsuario || '',
                email: dados.email || ''
            });
        } catch (error) {
            console.error(error);
            setMensagem({ tipo: 'erro', texto: 'Erro ao conectar com o servidor.' });
        } finally {
            setCarregando(false);
        }
    };

    const handleSalvarDados = async (e) => {
        e.preventDefault();
        setMensagem({ tipo: '', texto: '' });

        try {
            const id = usuarioBanco.idUsuario;

            // Envia 'nomeUsuario' para a API
            await userService.atualizar(id, {
                nomeUsuario: formulario.nomeUsuario,
                email: formulario.email
            });

            // Atualiza localStorage
            const sessaoAtual = authService.obterUsuarioLogado();
            const novaSessao = {
                ...sessaoAtual,
                nomeUsuario: formulario.nomeUsuario,
                email: formulario.email
            };
            localStorage.setItem('usuario_logado', JSON.stringify(novaSessao));

            setMensagem({ tipo: 'sucesso', texto: 'Perfil salvo com sucesso!' });

        } catch (error) {
            setMensagem({ tipo: 'erro', texto: 'Erro ao salvar alterações.' });
        }
    };

    const handleAlterarSenha = async (e) => {
        e.preventDefault();
        setMensagem({ tipo: '', texto: '' });

        if (dadosSenha.novaSenha !== dadosSenha.confirmarSenha) {
            setMensagem({ tipo: 'erro', texto: 'Senhas não conferem.' });
            return;
        }
        if (dadosSenha.novaSenha.length < 3) {
            setMensagem({ tipo: 'erro', texto: 'Senha muito curta.' });
            return;
        }

        try {
            const id = usuarioBanco.idUsuario;

            await userService.atualizar(id, {
                senha: dadosSenha.novaSenha
            });

            setMensagem({ tipo: 'sucesso', texto: 'Senha alterada com sucesso!' });
            setDadosSenha({ novaSenha: '', confirmarSenha: '' });

        } catch (error) {
            setMensagem({ tipo: 'erro', texto: 'Não foi possível alterar a senha.' });
        }
    };

    if (carregando) return <div className="perfil-loading">Carregando...</div>;

    return (
        <div className="perfil-container">
            <div className="perfil-header">
                <div className="header-content">
                    <div className="avatar-circle">
                        <User size={40} color="#166534" />
                    </div>
                    <div className="user-info-header">
                        <h2>{formulario.nomeUsuario || 'Usuário'}</h2>
                        <span className="role-badge">
                            {usuarioBanco?.funcao || 'USUARIO'}
                        </span>
                    </div>
                </div>
            </div>

            {mensagem.texto && (
                <div className={`mensagem-box ${mensagem.tipo}`}>
                    {mensagem.tipo === 'sucesso' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span>{mensagem.texto}</span>
                </div>
            )}

            <div className="perfil-grid">
                <div className="perfil-sidebar">
                    <button
                        className={`menu-btn ${abaAtiva === 'dados' ? 'ativo' : ''}`}
                        onClick={() => setAbaAtiva('dados')}
                    >
                        <User size={18} /> Dados Pessoais
                    </button>
                    <button
                        className={`menu-btn ${abaAtiva === 'seguranca' ? 'ativo' : ''}`}
                        onClick={() => setAbaAtiva('seguranca')}
                    >
                        <Key size={18} /> Segurança
                    </button>
                    <button
                        className={`menu-btn ${abaAtiva === 'preferencias' ? 'ativo' : ''}`}
                        onClick={() => setAbaAtiva('preferencias')}
                    >
                        <Bell size={18} /> Preferências
                    </button>
                </div>

                <div className="perfil-content">

                    {/* ABA DADOS */}
                    {abaAtiva === 'dados' && (
                        <form onSubmit={handleSalvarDados} className="fade-in">
                            <h3>Informações Básicas</h3>

                            <div className="form-group">
                                <label>Nome de Usuário</label>
                                <div className="input-icon">
                                    <User size={16} />
                                    <input
                                        type="text"
                                        value={formulario.nomeUsuario}
                                        onChange={(e) => setFormulario({...formulario, nomeUsuario: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>E-mail</label>
                                <div className="input-icon">
                                    <Mail size={16} />
                                    <input
                                        type="email"
                                        value={formulario.email}
                                        onChange={(e) => setFormulario({...formulario, email: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group disabled">
                                <label>Função</label>
                                <div className="input-icon">
                                    <Shield size={16} />
                                    <input type="text" value={usuarioBanco?.funcao || ''} disabled />
                                    <Lock size={14} className="lock-icon" />
                                </div>
                                <small>Contate o administrador para alterar permissões.</small>
                            </div>

                            <div className="form-footer">
                                <button type="submit" className="btn-primary">
                                    <Save size={18} /> Salvar Alterações
                                </button>
                            </div>
                        </form>
                    )}

                    {/* ABA SEGURANÇA */}
                    {abaAtiva === 'seguranca' && (
                        <form onSubmit={handleAlterarSenha} className="fade-in">
                            <h3>Alterar Senha</h3>
                            <p className="desc-text">Defina uma nova senha para acessar o sistema.</p>

                            <div className="form-group">
                                <label>Nova Senha</label>
                                <div className="input-icon">
                                    <Key size={16} />
                                    <input
                                        type="password"
                                        value={dadosSenha.novaSenha}
                                        onChange={(e) => setDadosSenha({...dadosSenha, novaSenha: e.target.value})}
                                        placeholder="Nova senha"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Confirmar Senha</label>
                                <div className="input-icon">
                                    <Key size={16} />
                                    <input
                                        type="password"
                                        value={dadosSenha.confirmarSenha}
                                        onChange={(e) => setDadosSenha({...dadosSenha, confirmarSenha: e.target.value})}
                                        placeholder="Repita a senha"
                                    />
                                </div>
                            </div>

                            <div className="form-footer">
                                <button type="submit" className="btn-warning">
                                    <Save size={18} /> Atualizar Senha
                                </button>
                            </div>
                        </form>
                    )}

                    {/* ABA PREFERÊNCIAS */}
                    {abaAtiva === 'preferencias' && (
                        <div className="fade-in center-content">
                            <h3>Notificações</h3>
                            <div className="empty-state">
                                <Bell size={48} color="#cbd5e1" />
                                <p>Configurações indisponíveis no momento.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Perfil;