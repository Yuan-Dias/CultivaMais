const API_ROOT = "http://localhost:8090/api";

const ENDPOINT_USUARIOS = `${API_ROOT}/usuarios`;
const ENDPOINT_LOGS = `${API_ROOT}/logs`;
const ENDPOINT_NOTIFICACOES = `${API_ROOT}/notificacoes`;

// --- FUNÇÃO AUXILIAR PARA CABEÇALHOS (HEADERS) ---
// Esta função injeta o Token JWT automaticamente em cada requisição
export const getHeaders = () => {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

// --- SERVIÇO DE AUTENTICAÇÃO ---
export const authService = {
    login: async (email, senha) => {
        try {
            const response = await fetch(`${ENDPOINT_USUARIOS}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }, // No login ainda não tem token
                body: JSON.stringify({ email, senha }),
            });

            if (response.status === 401) throw new Error("Email ou senha incorretos.");
            if (!response.ok) throw new Error("Erro ao conectar com o servidor.");

            const dados = await response.json();

            // Salva o Token JWT recebido do Java
            if (dados.token) {
                localStorage.setItem('token', dados.token);
            }

            // Salva os dados do usuário
            if (dados.idUsuario) {
                localStorage.setItem('usuario_logado', JSON.stringify(dados));
            }

            return dados;
        } catch (error) {
            console.error("Erro no login:", error);
            throw error;
        }
    },

    usuarioEstaLogado: () => !!localStorage.getItem('token'),

    obterUsuarioLogado: () => {
        const u = localStorage.getItem('usuario_logado');
        return u ? JSON.parse(u) : null;
    },

    logout: () => {
        localStorage.removeItem('usuario_logado');
        localStorage.removeItem('token');
    }
};

// --- SERVIÇO DE USUÁRIOS E LOGS ---
export const userService = {

    listar: async () => {
        const response = await fetch(ENDPOINT_USUARIOS, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error("Erro ao buscar usuários");
        return await response.json();
    },

    obterPorId: async (id) => {
        const response = await fetch(`${ENDPOINT_USUARIOS}/${id}`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error("Erro ao buscar dados do perfil.");
        return await response.json();
    },

    registrarLog: async (acao, detalhes, usuarioId) => {
        try {
            const payload = {
                acao,
                detalhes,
                usuarioId,
                dataHora: new Date().toISOString()
            };

            await fetch(ENDPOINT_LOGS, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify(payload)
            });
        } catch (error) {
            console.error("Falha silenciosa ao registrar log:", error);
        }
    },

    criar: async (formData) => {
        const payload = {
            nomeUsuario: formData.nome || formData.nomeUsuario,
            email: formData.email,
            funcao: formData.tipo || formData.funcao,
            // Senha que atende aos requisitos do seu Java:
            // Maiúscula, minúscula, número, especial e +8 caracteres
            senha: "CultivaMais@2026",
            ativo: true
        };

        const response = await fetch(ENDPOINT_USUARIOS, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            // Tenta ler a mensagem de validação vinda do Spring Boot
            const erroJson = await response.json().catch(() => ({}));
            const mensagem = erroJson.message || "Erro de validação no servidor (Verifique a senha)";
            throw new Error(mensagem);
        }
        return await response.json();
    },

    atualizar: async (id, dados) => {
        // Mapeamento para garantir consistência com o Java
        const payload = {
            nomeUsuario: dados.nome || dados.nomeUsuario,
            email: dados.email,
            funcao: dados.tipo || dados.funcao,
            ativo: dados.ativo
        };

        // Se houver senha nova (troca de senha)
        if (dados.senha) payload.senha = dados.senha;

        const response = await fetch(`${ENDPOINT_USUARIOS}/${id}`, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || "Erro ao atualizar usuário");
        }
        return await response.json();
    },

    excluir: async (id) => {
        const response = await fetch(`${ENDPOINT_USUARIOS}/${id}`, {
            method: "DELETE",
            headers: getHeaders()
        });
        if (!response.ok) throw new Error("Erro ao excluir usuário");
        return true;
    },

    gerarCodigo: async (email) => {
        const response = await fetch(`${ENDPOINT_USUARIOS}/gerar-codigo`, {
            method: "POST",
            headers: { "Content-Type": "application/json" }, // Rota pública
            body: JSON.stringify({ email })
        });
        if (!response.ok) throw new Error("Erro ao gerar código.");
        return await response.json();
    },

    redefinirSenha: async (email, codigo, novaSenha) => {
        const response = await fetch(`${ENDPOINT_USUARIOS}/redefinir-senha`, {
            method: "POST",
            headers: { "Content-Type": "application/json" }, // Rota pública
            body: JSON.stringify({ email, codigo, novaSenha })
        });
        if (!response.ok) throw new Error("Código inválido.");
        return true;
    }
};

// --- SERVIÇO DE NOTIFICAÇÕES ---

const getUsuarioId = () => {
    const u = authService.obterUsuarioLogado();
    return u ? (u.idUsuario || u.id) : null;
};

export const notificationService = {

    listar: async () => {
        const idUser = getUsuarioId();
        if (!idUser) return [];

        try {
            const response = await fetch(`${ENDPOINT_NOTIFICACOES}/usuario/${idUser}`, {
                headers: getHeaders()
            });
            if (!response.ok) throw new Error("Erro ao buscar notificações");
            return await response.json();
        } catch (error) {
            console.error("Falha ao buscar notificações:", error);
            return [];
        }
    },

    criar: async (titulo, mensagem, tipo) => {
        const idUser = getUsuarioId();
        if (!idUser) return;

        try {
            const response = await fetch(ENDPOINT_NOTIFICACOES, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({
                    idUsuario: idUser,
                    titulo,
                    mensagem,
                    tipo
                })
            });
            return await response.json();
        } catch (error) {
            console.error("Erro ao criar notificação", error);
        }
    },

    marcarComoLida: async (idNotificacao) => {
        try {
            await fetch(`${ENDPOINT_NOTIFICACOES}/${idNotificacao}/lida`, {
                method: "PUT",
                headers: getHeaders()
            });
            return true;
        } catch (error) {
            console.error("Erro ao marcar como lida", error);
            return false;
        }
    },

    marcarTodasComoLidas: async () => {
        const idUser = getUsuarioId();
        if (!idUser) return;

        try {
            await fetch(`${ENDPOINT_NOTIFICACOES}/usuario/${idUser}/ler-todas`, {
                method: "PUT",
                headers: getHeaders()
            });
            return true;
        } catch (error) {
            console.error("Erro ao marcar todas como lidas", error);
            return false;
        }
    },

    excluir: async (idNotificacao) => {
        try {
            await fetch(`${ENDPOINT_NOTIFICACOES}/${idNotificacao}`, {
                method: "DELETE",
                headers: getHeaders()
            });
            return true;
        } catch (error) {
            console.error("Erro ao excluir notificação", error);
            return false;
        }
    }
};

// --- SERVIÇO DE PLANTAS ---
const ENDPOINT_PLANTAS = `${API_ROOT}/plantas`;

export const plantaService = {
    listar: async () => {
        const response = await fetch(ENDPOINT_PLANTAS, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error("Erro ao buscar catálogo de plantas");
        return await response.json();
    },

    criar: async (plantaData) => {
        const idUser = getUsuarioId(); // Pega o ID do usuário logado

        const response = await fetch(`${ENDPOINT_PLANTAS}/${idUser}`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(plantaData)
        });

        if (!response.ok) {
            const erro = await response.json().catch(() => ({}));
            throw new Error(erro.message || "Erro ao salvar planta no servidor");
        }
        return await response.json();
    },

    excluir: async (id) => {
        const response = await fetch(`${ENDPOINT_PLANTAS}/${id}`, {
            method: "DELETE",
            headers: getHeaders()
        });
        if (!response.ok) throw new Error("Erro ao excluir planta");
        return true;
    }
};