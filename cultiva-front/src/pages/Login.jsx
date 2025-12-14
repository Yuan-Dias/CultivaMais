import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// IMPORTANTE: Adicionei userService aqui, pois é onde está o redefinirSenha
import { authService, userService } from "../services/api";
import { LogIn, Key, ArrowLeft, CheckCircle } from 'lucide-react';

export function Login() {
    const navigate = useNavigate();

    // Estados Gerais
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');

    // Controle de Modo (Login vs Reset)
    const [isResetMode, setIsResetMode] = useState(false);

    // Campos do Formulário
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    // Campos específicos do Reset
    const [codigo, setCodigo] = useState('');
    const [novaSenha, setNovaSenha] = useState('');

    // --- LÓGICA DE LOGIN ---
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErro('');

        try {
            const usuario = await authService.login(email, senha);

            // Redirecionamento
            if (usuario.funcao === 'EMPRESA') {
                navigate('/dashboard');
            } else {
                navigate('/dashboard');
            }

        } catch (error) {
            setErro(error.message || "E-mail ou senha incorretos.");
        } finally {
            setLoading(false);
        }
    };

    // --- LÓGICA DE REDEFINIÇÃO DE SENHA (CORRIGIDA) ---
    const handleResetSenha = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErro('');
        setSucesso('');

        // Validação simples antes de enviar
        if(!email || !codigo || !novaSenha) {
            setErro("Preencha todos os campos.");
            setLoading(false);
            return;
        }

        try {
            // 1. Chamada REAL ao Backend (Sem simulação)
            // O await aqui vai esperar o Java responder.
            // Se o código estiver errado, o Java lança erro e o código pula pro 'catch'
            await userService.redefinirSenha(email, codigo, novaSenha);

            // 2. Se chegou aqui, é SUCESSO absoluto
            setSucesso("Senha alterada com sucesso! Redirecionando...");

            // 3. Limpa e volta para login após 2 segundos
            setTimeout(() => {
                setIsResetMode(false);
                setSucesso('');
                setSenha('');
                setCodigo('');
                setNovaSenha('');
                setErro('');
            }, 2000);

        } catch (error) {
            // 4. Se o código estiver errado, cai AQUI
            console.error("Erro no reset:", error);
            setErro(error.message || "Código inválido ou expirado.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">

                <h1 className="login-title">
                    {isResetMode ? 'Redefinir Senha' : 'Cultiva+'}
                </h1>
                <p className="login-subtitle">
                    {isResetMode
                        ? 'Insira o código fornecido pelo administrador.'
                        : 'Bem-vindo de volta!'}
                </p>

                <form
                    className="login-form"
                    onSubmit={isResetMode ? handleResetSenha : handleLogin}
                >
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
                            <input
                                type="password"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                className="login-input"
                                placeholder="********"
                                required
                            />
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
                                <input
                                    type="password"
                                    value={novaSenha}
                                    onChange={(e) => setNovaSenha(e.target.value)}
                                    className="login-input"
                                    placeholder="********"
                                    minLength={3} // Ajuste conforme sua regra de negócio
                                    required
                                />
                            </div>
                        </>
                    )}

                    {/* Mensagens */}
                    {erro && <div className="error-msg" style={{color: 'red', marginTop: '10px'}}>{erro}</div>}
                    {sucesso && <div className="success-msg" style={{color: 'green', marginTop: '10px', display: 'flex', alignItems: 'center'}}>
                        <CheckCircle size={16} style={{marginRight:5}}/> {sucesso}
                    </div>}

                    {/* Botão */}
                    <button type="submit" className="btn-login" disabled={loading} style={{marginTop: '20px'}}>
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