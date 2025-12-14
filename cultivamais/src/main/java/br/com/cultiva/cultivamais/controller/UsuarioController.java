package br.com.cultiva.cultivamais.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import br.com.cultiva.cultivamais.model.Usuario;
import br.com.cultiva.cultivamais.model.LogSistema;
import br.com.cultiva.cultivamais.service.UsuarioService;
import br.com.cultiva.cultivamais.repository.LogRepository;
import br.com.cultiva.cultivamais.dto.LoginRequest;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private LogRepository logRepository; // Mantido APENAS para a rota de leitura dos logs

    // --- ROTA DE LEITURA (Mantém aqui para o Frontend consultar) ---
    @GetMapping("/logs")
    public ResponseEntity<List<LogSistema>> listarLogs() {
        List<LogSistema> logs = logRepository.findAllByOrderByDataHoraDesc();
        return ResponseEntity.ok(logs);
    }

    @PostMapping
    public ResponseEntity<Usuario> criarUsuario(@RequestBody Usuario usuario) {
        // O log agora é gerado automaticamente dentro do service
        Usuario usuarioSalvo = usuarioService.criarUsuario(usuario);
        return ResponseEntity.ok(usuarioSalvo);
    }

    @GetMapping
    public ResponseEntity<List<Usuario>> listarUsuarios() {
        List<Usuario> lista = usuarioService.listarTodos();
        return ResponseEntity.ok(lista);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Usuario> atualizarUsuario(@PathVariable Long id, @RequestBody Usuario usuario) {
        Usuario atualizado = usuarioService.atualizarUsuario(id, usuario);
        return ResponseEntity.ok(atualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluirUsuario(@PathVariable Long id) {
        usuarioService.excluirUsuario(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/login")
    public ResponseEntity<Usuario> login(@RequestBody LoginRequest loginRequest) {
        Usuario usuarioLogado = usuarioService.autenticar(
                loginRequest.getEmail(),
                loginRequest.getSenha()
        );

        if (usuarioLogado != null) {
            return ResponseEntity.ok(usuarioLogado);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    // --- Endpoints de Segurança ---

    @PostMapping("/gerar-codigo")
    public ResponseEntity<Map<String, String>> gerarCodigo(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String codigo = usuarioService.gerarCodigoRecuperacao(email);

        if (codigo != null) {
            return ResponseEntity.ok(Map.of("codigo", codigo));
        }
        return ResponseEntity.badRequest().build();
    }

    @PostMapping("/redefinir-senha")
    public ResponseEntity<Void> redefinirSenha(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String codigo = payload.get("codigo");
        String novaSenha = payload.get("novaSenha");

        boolean sucesso = usuarioService.redefinirSenhaComCodigo(email, codigo, novaSenha);

        if (sucesso) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }
}