// 1. AJUSTE AQUI: Definimos a raiz da API, não a rota de usuários
const API_ROOT = "http://localhost:8090/api";

// Definimos os endpoints específicos
const ENDPOINT_USUARIOS = `${API_ROOT}/usuarios`;
const ENDPOINT_LOGS = `${API_ROOT}/logs`;

// --- SERVIÇO DE AUTENTICAÇÃO ---
export const authService = {
    login: async (email, senha) => {
        try {
            // Ajustado para usar ENDPOINT_USUARIOS
            const response = await fetch(`${ENDPOINT_USUARIOS}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha }),
            });

            if (response.status === 401) throw new Error("Email ou senha incorretos.");
            if (!response.ok) throw new Error("Erro ao conectar com o servidor.");

            const dados = await response.json();

            if (dados.idUsuario || dados.id) {
                const usuarioNormalizado = {
                    ...dados,
                    id: dados.idUsuario || dados.id
                };
                localStorage.setItem('usuario_logado', JSON.stringify(usuarioNormalizado));
            }

            return dados;
        } catch (error) {
            console.error("Erro na API:", error);
            throw error;
        }
    },

    usuarioEstaLogado: () => !!localStorage.getItem('usuario_logado'),

    obterUsuarioLogado: () => {
        const u = localStorage.getItem('usuario_logado');
        return u ? JSON.parse(u) : null;
    },

    logout: () => localStorage.removeItem('usuario_logado')
};

// --- SERVIÇO DE USUÁRIOS ---
export const userService = {

    // 1. LISTAR TODOS
    listar: async () => {
        // Ajustado para ENDPOINT_USUARIOS
        const response = await fetch(ENDPOINT_USUARIOS);
        if (!response.ok) throw new Error("Erro ao buscar usuários");
        return await response.json();
    },

    // --- CORREÇÃO FEITA AQUI ---
    // Agora ele aponta para /api/logs corretamente
    listarLogs: async () => {
        try {
            // Usa a constante ENDPOINT_LOGS que aponta para /api/logs
            const response = await fetch(ENDPOINT_LOGS);

            if (!response.ok) {
                console.error("Erro ao buscar logs:", response.status);
                return [];
            }
            return await response.json();
        } catch (error) {
            console.error("Erro de conexão ao buscar logs:", error);
            return [];
        }
    },

    // 2. CRIAR USUÁRIO
    criar: async (formData) => {
        const payload = {
            nomeUsuario: formData.nome, // Certifique-se que o Java espera "nomeUsuario" ou "nome"
            nome: formData.nome,        // Enviando os dois para garantir compatibilidade
            email: formData.email,
            funcao: formData.tipo,
            senha: "123",
            ativo: true
        };

        const response = await fetch(ENDPOINT_USUARIOS, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("Erro ao criar usuário");
        return await response.json();
    },

    // 3. ATUALIZAR USUÁRIO
    atualizar: async (id, formData) => {
        const payload = {};
        if (formData.nome) {
            payload.nomeUsuario = formData.nome;
            payload.nome = formData.nome;
        }
        if (formData.email) payload.email = formData.email;
        if (formData.tipo) payload.funcao = formData.tipo;
        if (formData.ativo !== undefined) payload.ativo = formData.ativo;

        const response = await fetch(`${ENDPOINT_USUARIOS}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("Erro ao atualizar usuário");
        return await response.json();
    },

    // 4. EXCLUIR USUÁRIO
    excluir: async (id) => {
        const response = await fetch(`${ENDPOINT_USUARIOS}/${id}`, {
            method: "DELETE"
        });
        if (!response.ok) throw new Error("Erro ao excluir usuário");
        return true;
    },

    // 5. GERAR CÓDIGO
    gerarCodigo: async (email) => {
        const response = await fetch(`${ENDPOINT_USUARIOS}/gerar-codigo`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email })
        });

        if (!response.ok) throw new Error("Erro ao gerar código.");
        return await response.json();
    },

    // 6. REDEFINIR SENHA
    redefinirSenha: async (email, codigo, novaSenha) => {
        const response = await fetch(`${ENDPOINT_USUARIOS}/redefinir-senha`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, codigo, novaSenha })
        });

        if (!response.ok) throw new Error("Código inválido ou expirado.");
        return true;
    }
};