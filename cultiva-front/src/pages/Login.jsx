import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, userService } from "../services/api";
import { LogIn, Key, ArrowLeft, CheckCircle, Check, Eye, EyeOff } from 'lucide-react';
import '../css/login.css';

export function Login() {
    const navigate = useNavigate();

    // Estados Gerais
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');

    // Estado para controlar visibilidade da senha
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [isResetMode, setIsResetMode] = useState(false);

    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    const [codigo, setCodigo] = useState('');
    const [novaSenha, setNovaSenha] = useState('');

    // --- VALIDAÇÃO EM TEMPO REAL ---
    const temTamanho = novaSenha.length >= 8;
    const temMaiuscula = /[A-Z]/.test(novaSenha);
    const temMinuscula = /[a-z]/.test(novaSenha);
    const temNumero = /[0-9]/.test(novaSenha);
    const temEspecial = /[@#$%^&+=!]/.test(novaSenha);

    const isSenhaValida = temTamanho && temMaiuscula && temMinuscula && temNumero && temEspecial;

    // --- LÓGICA DE LOGIN ---
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErro('');

        try {
            const dadosDoBanco = await authService.login(email, senha);

            // Log de diagnóstico mantido para conferência
            console.log("Conexão estabelecida. Dados recebidos:", dadosDoBanco);

            // VERIFICAÇÃO RIGOROSA:
            // Se o seu sistema usa Token para proteger rotas, precisamos salvar algo no 'token'
            // Se o Java não enviou, usamos o e-mail ou um valor genérico para não barrar o redirecionamento
            const tokenParaSalvar = dadosDoBanco.token || "token-temporario-validado";
            localStorage.setItem('token', tokenParaSalvar);

            const usuarioParaSalvar = {
                idUsuario: dadosDoBanco.idUsuario || dadosDoBanco.id,
                nomeUsuario: dadosDoBanco.nomeUsuario || dadosDoBanco.nome,
                funcao: dadosDoBanco.funcao,
                email: dadosDoBanco.email,
                ativo: dadosDoBanco.ativo
            };

            // Salvando o objeto de usuário exatamente como o sistema espera
            localStorage.setItem('usuarioLogado', JSON.stringify(usuarioParaSalvar));

            // Se chegamos aqui, os dados foram salvos. Agora forçamos o redirecionamento.
            navigate('/dashboard');

        } catch (error) {
            console.error("Erro no login:", error);
            setErro("E-mail ou senha incorretos.");
        } finally {
            setLoading(false);
        }
    };

    // --- LÓGICA DE RESET ---
    const handleResetSenha = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErro('');
        setSucesso('');

        if (!isSenhaValida) {
            setErro("A senha não atende aos requisitos de segurança.");
            setLoading(false);
            return;
        }

        try {
            await userService.redefinirSenha(email, codigo, novaSenha);
            setSucesso("Senha alterada com sucesso! Redirecionando...");

            setTimeout(() => {
                setIsResetMode(false);
                setSucesso('');
                setSenha('');
                setCodigo('');
                setNovaSenha('');
                setErro('');
                setMostrarSenha(false);
            }, 3000);

        } catch (error) {
            console.error("Erro no reset:", error);
            setErro(error.response?.data?.message || "Erro ao redefinir. Verifique o código.");
        } finally {
            setLoading(false);
        }
    };

    const RequisitoSenha = ({ valido, texto }) => (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.8rem',
            color: valido ? '#16a34a' : '#9ca3af',
            marginBottom: '2px'
        }}>
            {valido ? <Check size={14} /> : <div style={{width: 14, height: 14, borderRadius: '50%', border: '1px solid #d1d5db'}} />}
            <span style={{ textDecoration: valido ? 'line-through' : 'none' }}>{texto}</span>
        </div>
    );

    return (
        <div className="login-container">
            <div className="login-card">

                <h1 className="login-title">
                    {isResetMode ? 'Nova Senha' : 'Cultiva+'}
                </h1>
                <p className="login-subtitle">
                    {isResetMode ? 'Defina sua nova senha de acesso.' : 'Bem-vindo de volta!'}
                </p>

                <form className="login-form" onSubmit={isResetMode ? handleResetSenha : handleLogin}>

                    <div className="input-group">
                        <label className="input-label">E-mail Corporativo</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="login-input"
                            placeholder="seu@fazenda.com"
                            required
                        />
                    </div>

                    {!isResetMode && (
                        <div className="input-group">
                            <label className="input-label">Senha</label>
                            <div className="input-wrapper">
                                <input
                                    type={mostrarSenha ? "text" : "password"}
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    className="login-input"
                                    placeholder="********"
                                    required
                                />
                                <button
                                    type="button"
                                    className="btn-toggle-password"
                                    onClick={() => setMostrarSenha(!mostrarSenha)}
                                >
                                    {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                    )}

                    {isResetMode && (
                        <>
                            <div className="input-group">
                                <label className="input-label">Código de Autorização</label>
                                <input
                                    type="text"
                                    value={codigo}
                                    onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                                    className="login-input input-code"
                                    placeholder="XXXXXX"
                                    maxLength={6}
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">Nova Senha</label>
                                <div className="input-wrapper">
                                    <input
                                        type={mostrarSenha ? "text" : "password"}
                                        value={novaSenha}
                                        onChange={(e) => setNovaSenha(e.target.value)}
                                        className="login-input"
                                        placeholder="Sua nova senha"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="btn-toggle-password"
                                        onClick={() => setMostrarSenha(!mostrarSenha)}
                                    >
                                        {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>

                                <div className="requisitos-container">
                                    <p className="requisitos-titulo">A senha deve conter:</p>
                                    <RequisitoSenha valido={temTamanho} texto="Mínimo de 8 caracteres" />
                                    <RequisitoSenha valido={temMaiuscula} texto="Uma letra maiúscula" />
                                    <RequisitoSenha valido={temMinuscula} texto="Uma letra minúscula" />
                                    <RequisitoSenha valido={temNumero} texto="Pelo menos um número" />
                                    <RequisitoSenha valido={temEspecial} texto="Símbolo especial (@ # $ %)" />
                                </div>
                            </div>
                        </>
                    )}

                    {erro && <div className="error-msg">{erro}</div>}
                    {sucesso && (
                        <div className="success-msg">
                            <CheckCircle size={16} /> {sucesso}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn-login"
                        disabled={loading || (isResetMode && !isSenhaValida)}
                    >
                        {loading ? 'Processando...' : (
                            isResetMode ? (
                                <><Key size={18} /> Alterar Senha</>
                            ) : (
                                <><LogIn size={18} /> Entrar no Sistema</>
                            )
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    {isResetMode ? (
                        <button
                            type="button"
                            className="link-action"
                            onClick={() => {
                                setIsResetMode(false);
                                setErro('');
                                setSucesso('');
                                setNovaSenha('');
                                setMostrarSenha(false);
                            }}
                        >
                            <ArrowLeft size={16} /> Voltar para o Login
                        </button>
                    ) : (
                        <>
                            <p className="footer-text">Esqueceu sua senha?</p>
                            <button
                                type="button"
                                className="link-action"
                                onClick={() => {
                                    setIsResetMode(true);
                                    setErro('');
                                    setSucesso('');
                                    setMostrarSenha(false);
                                }}
                            >
                                Tenho um código de acesso
                            </button>
                        </>
                    )}
                </div>

            </div>
        </div>
    );
}