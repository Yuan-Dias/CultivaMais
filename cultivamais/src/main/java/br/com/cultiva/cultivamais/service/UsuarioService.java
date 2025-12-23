package br.com.cultiva.cultivamais.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder; // <--- Importante
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // <--- Recomendado para DB

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
    private PasswordEncoder passwordEncoder; // <--- Injeção do Bean que criamos no SecurityConfig

    // Método auxiliar público para o Controller usar na comparação
    public Usuario buscarPorId(Long id) {
        return usuarioRepository.findById(id).orElse(null);
    }

    @Transactional // Garante que tudo salva ou nada salva
    @SuppressWarnings("null")
    public Usuario criarUsuario(@NonNull Usuario novoUsuario) {

        // 1. CRIPTOGRAFIA NA CRIAÇÃO
        // Pega a senha "123456", transforma em Hash e salva de volta no objeto
        String senhaCriptografada = passwordEncoder.encode(novoUsuario.getSenha());
        novoUsuario.setSenha(senhaCriptografada);

        if(novoUsuario.getAtivo() == null) {
            novoUsuario.setAtivo(true);
        }

        Usuario usuarioSalvo = usuarioRepository.save(novoUsuario);

        // Log de criação
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

            // 2. CRIPTOGRAFIA NA EDIÇÃO
            // Se o usuário mandou uma senha nova, temos que criptografar ela antes de salvar
            if (dadosAtualizados.getSenha() != null && !dadosAtualizados.getSenha().isEmpty()) {
                String novaSenhaHash = passwordEncoder.encode(dadosAtualizados.getSenha());
                usuario.setSenha(novaSenhaHash);
            }

            // O Log foi removido daqui pois está sendo tratado no Controller
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

    // --- AUTENTICAÇÃO COM BCRYPT ---
    public Usuario autenticar(String email, String senhaPlana) {
        Usuario usuario = usuarioRepository.findByEmail(email);

        if (usuario != null) {
            // 3. VERIFICAÇÃO DE HASH
            // Não usamos mais .equals(). Usamos .matches(senhaDigitada, hashDoBanco)
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
                return true;
            }
        }
        return false;
    }
}