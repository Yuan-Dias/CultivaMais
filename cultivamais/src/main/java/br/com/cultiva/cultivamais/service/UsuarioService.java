package br.com.cultiva.cultivamais.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException; // IMPORTANTE: Para tratar e-mail duplicado
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.cultiva.cultivamais.exception.ResourceNotFoundException;
import br.com.cultiva.cultivamais.model.LogSistema;
import br.com.cultiva.cultivamais.model.Usuario;
import br.com.cultiva.cultivamais.repository.LogRepository;
import br.com.cultiva.cultivamais.repository.UsuarioRepository;
import io.micrometer.common.lang.NonNull;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private LogRepository logRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Injeção de Notificações
    @Autowired
    private NotificacaoService notificacaoService;

    // Método auxiliar público para o Controller usar na comparação
    public Usuario buscarPorId(Long id) {
        return usuarioRepository.findById(id).orElse(null);
    }

    @Transactional
    @SuppressWarnings("null")
    public Usuario criarUsuario(@NonNull Usuario novoUsuario) {
        try {
            // 1. CRIPTOGRAFIA NA CRIAÇÃO
            String senhaCriptografada = passwordEncoder.encode(novoUsuario.getSenha());
            novoUsuario.setSenha(senhaCriptografada);

            if (novoUsuario.getAtivo() == null) {
                novoUsuario.setAtivo(true);
            }

            // Tenta salvar o usuário (Aqui que dava o erro 500 se o email fosse repetido)
            Usuario usuarioSalvo = usuarioRepository.save(novoUsuario);

            // Log de criação
            logRepository.save(new LogSistema("Sistema", "Criou novo usuário: " + usuarioSalvo.getNomeUsuario()));

            // NOTIFICAÇÕES (Em bloco try separado para não falhar o cadastro se a notificação der erro)
            try {
                // HIERARQUIA 1: O usuário recebe boas-vindas
                notificacaoService.criarNotificacao(
                        usuarioSalvo.getIdUsuario(),
                        "Bem-vindo ao Cultiva+!",
                        "Seu perfil de " + usuarioSalvo.getFuncao() + " foi ativado com sucesso.",
                        "sucesso"
                );

                // HIERARQUIA 2: Admins são avisados do novo cadastro (Monitoramento)
                notificarAdministradores(
                        "Novo Cadastro no Sistema",
                        "O usuário " + usuarioSalvo.getNomeUsuario() + " (" + usuarioSalvo.getFuncao() + ") acabou de se registrar.",
                        "info"
                );
            } catch (Exception e) {
                System.err.println("Erro ao enviar notificação de boas-vindas (ignorado): " + e.getMessage());
            }

            return usuarioSalvo;

        } catch (DataIntegrityViolationException e) {
            // CORREÇÃO DO ERRO 500: Lança uma mensagem amigável para o Front-end
            throw new RuntimeException("Erro: O e-mail informado já está cadastrado no sistema.");
        }
    }

    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    public Usuario atualizarUsuario(Long id, Usuario dadosAtualizados) {
        Optional<Usuario> usuarioExistente = usuarioRepository.findById(id);

        if (usuarioExistente.isPresent()) {
            Usuario usuario = usuarioExistente.get();
            boolean senhaAlterada = false;

            if (dadosAtualizados.getNomeUsuario() != null && !dadosAtualizados.getNomeUsuario().isEmpty()) {
                usuario.setNomeUsuario(dadosAtualizados.getNomeUsuario());
            }
            if (dadosAtualizados.getEmail() != null && !dadosAtualizados.getEmail().isEmpty()) {
                usuario.setEmail(dadosAtualizados.getEmail());
            }
            if (dadosAtualizados.getFuncao() != null) {
                usuario.setFuncao(dadosAtualizados.getFuncao());
            }
            if (dadosAtualizados.getAtivo() != null) {
                usuario.setAtivo(dadosAtualizados.getAtivo());
            }

            // 2. CRIPTOGRAFIA NA EDIÇÃO
            if (dadosAtualizados.getSenha() != null && !dadosAtualizados.getSenha().isEmpty()) {
                String novaSenhaHash = passwordEncoder.encode(dadosAtualizados.getSenha());
                usuario.setSenha(novaSenhaHash);
                senhaAlterada = true;
            }

            Usuario salvo = usuarioRepository.save(usuario);

            // Se a senha foi trocada numa edição de perfil, avisa o usuário (segurança)
            if (senhaAlterada) {
                try {
                    notificacaoService.criarNotificacao(
                            salvo.getIdUsuario(),
                            "Senha Atualizada",
                            "Sua senha foi alterada através da edição de perfil.",
                            "alerta"
                    );
                } catch (Exception e) {
                    System.err.println("Erro notificação senha: " + e.getMessage());
                }
            }

            return salvo;

        } else {
            throw new ResourceNotFoundException("Usuário não encontrado com ID: " + id);
        }
    }

    @SuppressWarnings("null")
    public void excluirUsuario(@NonNull Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new ResourceNotFoundException("Usuário não encontrado com ID: " + id);
        }
        usuarioRepository.deleteById(id);
    }

    // --- AUTENTICAÇÃO COM BCRYPT ---
    public Usuario autenticar(String email, String senhaPlana) {
        Usuario usuario = usuarioRepository.findByEmail(email);

        if (usuario != null) {
            // 3. VERIFICAÇÃO DE HASH
            if (passwordEncoder.matches(senhaPlana, usuario.getSenha())) {

                if (Boolean.TRUE.equals(usuario.getAtivo())) {
                    logRepository.save(new LogSistema(usuario.getNomeUsuario(), "Realizou Login"));
                    return usuario;
                }
            }
        }
        return null;
    }

    // --- Métodos de Recuperação de Senha ---

    public String gerarCodigoRecuperacao(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email);

        if (usuario != null) {
            String codigo = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
            usuario.setCodigoRecuperacao(codigo);
            usuarioRepository.save(usuario);
            logRepository.save(new LogSistema(email, "Solicitou código de recuperação de senha"));
            return codigo;
        }
        return null;
    }

    public boolean redefinirSenhaComCodigo(String email, String codigoInput, String novaSenha) {
        Usuario usuario = usuarioRepository.findByEmail(email);

        if (usuario != null) {
            String codigoSalvo = usuario.getCodigoRecuperacao();

            if (codigoSalvo != null && codigoSalvo.equals(codigoInput)) {

                // 4. CRIPTOGRAFIA NA REDEFINIÇÃO
                usuario.setSenha(passwordEncoder.encode(novaSenha));

                usuario.setCodigoRecuperacao(null);
                usuarioRepository.save(usuario);
                logRepository.save(new LogSistema(email, "Redefiniu a senha com sucesso"));

                try {
                    // NOTIFICAÇÃO 1: Usuário recebe aviso de segurança
                    notificacaoService.criarNotificacao(
                            usuario.getIdUsuario(),
                            "Senha Alterada",
                            "Sua senha foi redefinida. Se não foi você, contate o suporte.",
                            "alerta"
                    );

                    // NOTIFICAÇÃO 2: Admins recebem alerta de auditoria (Hierarquia)
                    notificarAdministradores(
                            "Segurança: Redefinição de Senha",
                            "O usuário " + usuario.getNomeUsuario() + " (" + email + ") redefiniu a senha via código.",
                            "info"
                    );
                } catch (Exception e) {
                    System.err.println("Erro notificação recuperação: " + e.getMessage());
                }

                return true;
            }
        }
        return false;
    }

    // --- MÉTODO PRIVADO PARA HIERARQUIA DE ADM ---
    private void notificarAdministradores(String titulo, String mensagem, String tipo) {
        // Busca todos e filtra quem tem permissão de Admin
        List<Usuario> todos = usuarioRepository.findAll();
        for (Usuario u : todos) {
            // Verifica se a função não é nula antes de chamar o .name()
            if (u.getFuncao() != null) {
                String funcao = u.getFuncao().name().toUpperCase();
                if (funcao.contains("ADMIN") || funcao.contains("EMPRESA")) {
                    notificacaoService.criarNotificacao(u.getIdUsuario(), titulo, mensagem, tipo);
                }
            }
        }
    }
}