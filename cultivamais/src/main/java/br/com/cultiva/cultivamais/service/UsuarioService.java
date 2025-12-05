package br.com.cultiva.cultivamais.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.cultiva.cultivamais.exception.ResourceNotFoundException;
import br.com.cultiva.cultivamais.model.Usuario;
import br.com.cultiva.cultivamais.repository.UsuarioRepository;
import io.micrometer.common.lang.NonNull;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @SuppressWarnings("null")
    public Usuario criarUsuario(@NonNull Usuario novoUsuario) {
        // No futuro, criptografar a senha aqui antes de salvar
        return usuarioRepository.save(novoUsuario);
    }

    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
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
            return usuario;
        }
        
        return null;
    }
}