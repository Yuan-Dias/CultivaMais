import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

    // --- LÓGICA DE LOGIN (CORRIGIDA) ---
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErro('');

        try {
            // 1. Busca o usuário no Backend
            const dadosDoBanco = await authService.login(email, senha);

            // 2. PREPARA E SALVA NO LOCALSTORAGE (Essencial para não dar erro nas outras telas)
            // As telas 'Tarefas' e 'Dashboard' buscam essa chave 'usuarioLogado' para saber quem é você.
            const usuarioParaSalvar = {
                // Garante que o ID seja salvo como 'idUsuario' (padrão do front) mesmo se vier 'id' do banco
                idUsuario: dadosDoBanco.idUsuario || dadosDoBanco.id,
                nomeUsuario: dadosDoBanco.nomeUsuario || dadosDoBanco.nome,
                funcao: dadosDoBanco.funcao,
                email: dadosDoBanco.email,
                ativo: dadosDoBanco.ativo
            };

            localStorage.setItem('usuarioLogado', JSON.stringify(usuarioParaSalvar));

            // 3. Redirecionamento
            // Agora que os dados estão salvos, podemos navegar com segurança.
            if (usuarioParaSalvar.funcao === 'EMPRESA') {
                navigate('/dashboard');
            } else {
                // Se for ADMIN ou Funcionário, também manda para dashboard (conforme seu código original)
                // Se quiser mandar para tarefas, mude para navigate('/tarefas');
                navigate('/dashboard');
            }

        } catch (error) {
            console.error(error);
            setErro("E-mail ou senha incorretos.");
        } finally {
            setLoading(false);
        }
    };

    // --- LÓGICA DE REDEFINIÇÃO DE SENHA ---
    const handleResetSenha = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErro('');
        setSucesso('');

        // Validação simples
        if(!email || !codigo || !novaSenha) {
            setErro("Preencha todos os campos.");
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
            }, 2000);

        } catch (error) {
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
                                    minLength={3}
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