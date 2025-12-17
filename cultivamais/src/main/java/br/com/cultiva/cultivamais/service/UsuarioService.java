package br.com.cultiva.cultivamais.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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

    // Método auxiliar público para o Controller usar na comparação
    public Usuario buscarPorId(Long id) {
        return usuarioRepository.findById(id).orElse(null);
    }

    @SuppressWarnings("null")
    public Usuario criarUsuario(@NonNull Usuario novoUsuario) {
        if(novoUsuario.getAtivo() == null) {
            novoUsuario.setAtivo(true);
        }

        Usuario usuarioSalvo = usuarioRepository.save(novoUsuario);

        // Log de criação mantido aqui (ou pode mover para o controller se preferir padronizar)
        logRepository.save(new LogSistema("Sistema", "Criou novo usuário: " + usuarioSalvo.getNomeUsuario()));

        return usuarioSalvo;
    }

    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    public Usuario atualizarUsuario(Long id, Usuario dadosAtualizados) {
        Optional<Usuario> usuarioExistente = usuarioRepository.findById(id);

        if (usuarioExistente.isPresent()) {
            Usuario usuario = usuarioExistente.get();

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
            if (dadosAtualizados.getSenha() != null && !dadosAtualizados.getSenha().isEmpty()) {
                usuario.setSenha(dadosAtualizados.getSenha());
            }

            // O Log foi REMOVIDO daqui. Quem gera o log agora é o Controller.
            return usuarioRepository.save(usuario);

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

    public Usuario autenticar(String email, String senha) {
        Usuario usuario = usuarioRepository.findByEmail(email);

        if (usuario != null && usuario.getSenha().equals(senha)) {
            if (Boolean.TRUE.equals(usuario.getAtivo())) {
                logRepository.save(new LogSistema(usuario.getNomeUsuario(), "Realizou Login"));
                return usuario;
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
                usuario.setSenha(novaSenha);
                usuario.setCodigoRecuperacao(null);
                usuarioRepository.save(usuario);
                logRepository.save(new LogSistema(email, "Redefiniu a senha com sucesso"));
                return true;
            }
        }
        return false;
    }
}