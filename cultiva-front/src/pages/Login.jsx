import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, userService } from "../services/api";
import { LogIn, Key, ArrowLeft, CheckCircle, Check, Eye, EyeOff } from 'lucide-react';

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

            const usuarioParaSalvar = {
                idUsuario: dadosDoBanco.idUsuario || dadosDoBanco.id,
                nomeUsuario: dadosDoBanco.nomeUsuario || dadosDoBanco.nome,
                funcao: dadosDoBanco.funcao,
                email: dadosDoBanco.email,
                ativo: dadosDoBanco.ativo
            };

            localStorage.setItem('usuarioLogado', JSON.stringify(usuarioParaSalvar));
            navigate('/dashboard');

        } catch (error) {
            console.error(error);
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

                    {/* Campo E-mail */}
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

                    {/* MODO LOGIN */}
                    {!isResetMode && (
                        <div className="input-group">
                            <label className="input-label">Senha</label>
                            {/* DIV Wrapper com width 100% para não encurtar o campo */}
                            <div style={{ position: 'relative', width: '100%' }}>
                                <input
                                    type={mostrarSenha ? "text" : "password"}
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    className="login-input"
                                    placeholder="********"
                                    // paddingRight garante que o texto não fique por baixo do ícone
                                    style={{ width: '100%', paddingRight: '45px' }}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setMostrarSenha(!mostrarSenha)}
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#6b7280',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: 0
                                    }}
                                >
                                    {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* MODO RESET */}
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
                                <div style={{ position: 'relative', width: '100%' }}>
                                    <input
                                        type={mostrarSenha ? "text" : "password"}
                                        value={novaSenha}
                                        onChange={(e) => setNovaSenha(e.target.value)}
                                        className="login-input"
                                        placeholder="Sua nova senha"
                                        style={{ width: '100%', paddingRight: '45px' }}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setMostrarSenha(!mostrarSenha)}
                                        style={{
                                            position: 'absolute',
                                            right: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: '#6b7280',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: 0
                                        }}
                                    >
                                        {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>

                                {/* Lista de requisitos */}
                                <div style={{
                                    marginTop: '10px',
                                    padding: '10px',
                                    backgroundColor: '#f9fafb',
                                    borderRadius: '6px',
                                    border: '1px solid #e5e7eb'
                                }}>
                                    <p style={{fontSize: '0.75rem', fontWeight: 'bold', color: '#374151', marginBottom: '5px'}}>
                                        A senha deve conter:
                                    </p>
                                    <RequisitoSenha valido={temTamanho} texto="Mínimo de 8 caracteres" />
                                    <RequisitoSenha valido={temMaiuscula} texto="Pelo menos uma letra maiúscula" />
                                    <RequisitoSenha valido={temMinuscula} texto="Pelo menos uma letra minúscula" />
                                    <RequisitoSenha valido={temNumero} texto="Pelo menos um número" />
                                    <RequisitoSenha valido={temEspecial} texto="Símbolo especial (@ # $ %)" />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Mensagens */}
                    {erro && <div className="error-msg" style={{color: 'red', marginTop: '10px'}}>{erro}</div>}
                    {sucesso && <div className="success-msg" style={{color: 'green', marginTop: '10px', display: 'flex', alignItems: 'center'}}>
                        <CheckCircle size={16} style={{marginRight:5}}/> {sucesso}
                    </div>}

                    {/* Botão Principal */}
                    <button
                        type="submit"
                        className="btn-login"
                        disabled={loading || (isResetMode && !isSenhaValida)}
                        style={{
                            marginTop: '20px',
                            opacity: (isResetMode && !isSenhaValida) ? 0.6 : 1,
                            cursor: (isResetMode && !isSenhaValida) ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Processando...' : (
                            isResetMode ? (
                                <><Key size={18} style={{marginRight: '8px'}} /> Alterar Senha</>
                            ) : (
                                <><LogIn size={18} style={{marginRight: '8px'}} /> Entrar no Sistema</>
                            )
                        )}
                    </button>
                </form>

                {/* Footer */}
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
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', width: '100%' }}
                        >
                            <ArrowLeft size={16} /> Voltar para o Login
                        </button>
                    ) : (
                        <>
                            <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '0 0 8px 0' }}>
                                Esqueceu sua senha?
                            </p>
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