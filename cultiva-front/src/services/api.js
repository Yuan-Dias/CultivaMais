const API_BASE_URL = "http://localhost:8090/api/usuarios";

export const authService = {
    login: async (email, senha) => {
        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, senha }),
            });

            if (response.status === 401) {
                throw new Error("Email ou senha incorretos.");
            }

            if (!response.ok) {
                throw new Error("Erro ao conectar com o servidor.");
            }

            const dados = await response.json();
            console.log("Login realizado:", dados);

            // --- ALTERAÇÃO AQUI ---
            // Como não veio token, salvamos o objeto inteiro do usuário
            // para saber quem está logado.
            if (dados.idUsuario) {
                localStorage.setItem('usuario_logado', JSON.stringify(dados));
            }

            return dados;
        } catch (error) {
            console.error("Erro na API:", error);
            throw error;
        }
    },

    // Função auxiliar para verificar se está logado
    usuarioEstaLogado: () => {
        const usuario = localStorage.getItem('usuario_logado');
        return !!usuario; // Retorna true se existir, false se não
    },

    // Função para pegar os dados do usuário logado
    obterUsuarioLogado: () => {
        const usuario = localStorage.getItem('usuario_logado');
        return usuario ? JSON.parse(usuario) : null;
    },

    logout: () => {
        localStorage.removeItem('usuario_logado');
        // Opcional: window.location.href = '/login';
    }
};