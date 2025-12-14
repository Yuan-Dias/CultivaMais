const API_BASE_URL = "http://localhost:8090/api/usuarios";

// --- SERVIÇO DE AUTENTICAÇÃO ---
export const authService = {
    login: async (email, senha) => {
        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
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
        const response = await fetch(API_BASE_URL);
        if (!response.ok) throw new Error("Erro ao buscar usuários");
        return await response.json();
    },

    // --- NOVA FUNÇÃO: LISTAR LOGS (AUDITORIA) ---
    // Adicione esta rota no seu Backend Java depois
    listarLogs: async () => {
        // Tenta buscar na rota de logs. Se não existir, retorna array vazio para não quebrar a tela.
        try {
            const response = await fetch(`${API_BASE_URL}/logs`);
            if (!response.ok) return [];
            return await response.json();
        } catch (error) {
            console.warn("Rota de logs ainda não criada no backend.");
            return [];
        }
    },

    // 2. CRIAR USUÁRIO
    criar: async (formData) => {
        const payload = {
            nomeUsuario: formData.nome,
            email: formData.email,
            funcao: formData.tipo,
            senha: "123",
            ativo: true
        };

        const response = await fetch(API_BASE_URL, {
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
        if (formData.nome) payload.nomeUsuario = formData.nome;
        if (formData.email) payload.email = formData.email;
        if (formData.tipo) payload.funcao = formData.tipo;
        if (formData.ativo !== undefined) payload.ativo = formData.ativo;

        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("Erro ao atualizar usuário");
        return await response.json();
    },

    // 4. EXCLUIR USUÁRIO
    excluir: async (id) => {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: "DELETE"
        });
        if (!response.ok) throw new Error("Erro ao excluir usuário");
        return true;
    },

    // 5. GERAR CÓDIGO
    gerarCodigo: async (email) => {
        const response = await fetch(`${API_BASE_URL}/gerar-codigo`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email })
        });

        if (!response.ok) throw new Error("Erro ao gerar código.");
        return await response.json();
    },

    // 6. REDEFINIR SENHA
    redefinirSenha: async (email, codigo, novaSenha) => {
        const response = await fetch(`${API_BASE_URL}/redefinir-senha`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, codigo, novaSenha })
        });

        if (!response.ok) throw new Error("Código inválido ou expirado.");
        return true;
    }
};