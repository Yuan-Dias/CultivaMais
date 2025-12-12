import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from "../services/api";
import { LogIn } from 'lucide-react';

export function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault(); // Evita recarregar a página
        setLoading(true);
        setErro('');

        try {
            const usuario = await authService.login(email, senha);

            if (usuario.funcao === 'EMPRESA') {
                navigate('/dashboard');
            } else {
                navigate('/dashboard');
            }

        } catch (error) {
            setErro(error.message || "Falha no login");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>Cultiva+</h1>
                <p style={styles.subtitle}>Bem-vindo de volta!</p>

                <form onSubmit={handleLogin} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>E-mail</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={styles.input}
                            placeholder="seu@email.com"
                            required
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Senha</label>
                        <input
                            type="password"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            style={styles.input}
                            placeholder="********"
                            required
                        />
                    </div>

                    {erro && <p style={styles.error}>{erro}</p>}

                    <button type="submit" style={styles.button} disabled={loading}>
                        {loading ? 'Carregando...' : (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                Entrar <LogIn size={18} />
                            </span>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

// Estilos CSS-in-JS simples
const styles = {
    container: {
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f3f4f6',
        fontFamily: 'Arial, sans-serif'
    },
    card: {
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px'
    },
    title: {
        color: '#166534',
        textAlign: 'center',
        marginBottom: '0.5rem'
    },
    subtitle: {
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: '2rem'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
    },
    label: {
        fontSize: '0.875rem',
        fontWeight: '500',
        color: '#374151'
    },
    input: {
        padding: '0.75rem',
        borderRadius: '4px',
        border: '1px solid #d1d5db',
        fontSize: '1rem'
    },
    button: {
        backgroundColor: '#166534',
        color: 'white',
        padding: '0.75rem',
        borderRadius: '4px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: 'bold',
        marginTop: '1rem'
    },
    error: {
        color: '#dc2626',
        fontSize: '0.875rem',
        textAlign: 'center'
    }
};