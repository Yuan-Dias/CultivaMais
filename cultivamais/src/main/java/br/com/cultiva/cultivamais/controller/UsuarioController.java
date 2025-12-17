package br.com.cultiva.cultivamais.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import br.com.cultiva.cultivamais.model.Usuario;
import br.com.cultiva.cultivamais.service.UsuarioService;
import br.com.cultiva.cultivamais.service.LogService;
import br.com.cultiva.cultivamais.dto.LoginRequest;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private LogService logService;

    private String getUsuarioLogado() {
        // Idealmente pegaria do SecurityContextHolder
        return "Yuan Admin";
    }

    @PostMapping
    public ResponseEntity<Usuario> criarUsuario(@RequestBody Usuario usuario) {
        Usuario usuarioSalvo = usuarioService.criarUsuario(usuario);
        // O log de criação já está no Service, ou pode adicionar aqui se preferir centralizar
        return ResponseEntity.ok(usuarioSalvo);
    }

    @GetMapping
    public ResponseEntity<List<Usuario>> listarUsuarios() {
        return ResponseEntity.ok(usuarioService.listarTodos());
    }

    // --- LÓGICA DE BLOQUEIO/DESBLOQUEIO ---
    @PutMapping("/{id}")
    public ResponseEntity<Usuario> atualizarUsuario(@PathVariable Long id, @RequestBody Usuario usuarioNovosDados) {

        // 1. Buscar o usuário ANTES da atualização
        Usuario usuarioAntigo = usuarioService.buscarPorId(id);

        if (usuarioAntigo == null) {
            return ResponseEntity.notFound().build();
        }

        // IMPORTANTÍSSIMO: Guardar o estado do boolean ANTES de chamar o service.atualizar
        // Se pegarmos depois, o objeto usuarioAntigo pode ter sido atualizado por referência pelo Hibernate
        boolean eraAtivo = Boolean.TRUE.equals(usuarioAntigo.getAtivo());

        // 2. Realizar a atualização no Banco
        Usuario atualizado = usuarioService.atualizarUsuario(id, usuarioNovosDados);

        // 3. Verificar como ficou o status AGORA (do objeto retornado do banco)
        boolean ficouAtivo = Boolean.TRUE.equals(atualizado.getAtivo());

        // 4. Definir a mensagem do Log
        String acaoLog = "Editou \"" + atualizado.getNomeUsuario() + "\""; // Padrão

        // Lógica de comparação
        if (eraAtivo && !ficouAtivo) {
            acaoLog = "Bloqueou o usuário \"" + atualizado.getNomeUsuario() + "\"";
        } else if (!eraAtivo && ficouAtivo) {
            acaoLog = "Desbloqueou o usuário \"" + atualizado.getNomeUsuario() + "\"";
        }
        // Se o status não mudou (ex: editou só o email), mantém "Editou..."

        // 5. Salvar o Log
        String ator = getUsuarioLogado();

        // Se o front enviar uma "reason" ou "mensagem" customizada, podemos concatenar (opcional)
        // Mas a lógica acima já garante o texto correto.
        logService.registrarLog(ator, acaoLog);

        return ResponseEntity.ok(atualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluirUsuario(@PathVariable Long id) {
        Usuario alvo = usuarioService.buscarPorId(id);
        String nomeAlvo = (alvo != null) ? alvo.getNomeUsuario() : "ID " + id;

        usuarioService.excluirUsuario(id);

        String ator = getUsuarioLogado();
        logService.registrarLog(ator, "Excluiu o usuário \"" + nomeAlvo + "\"");

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/login")
    public ResponseEntity<Usuario> login(@RequestBody LoginRequest loginRequest) {
        Usuario usuarioLogado = usuarioService.autenticar(
                loginRequest.getEmail(),
                loginRequest.getSenha()
        );

        if (usuarioLogado != null) {
            // O log já é feito no Service.autenticar, mas se quiser garantir:
            // logService.registrarLog(usuarioLogado.getNomeUsuario(), "Realizou Login");
            return ResponseEntity.ok(usuarioLogado);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    // --- Endpoints de Recuperação ---

    @PostMapping("/gerar-codigo")
    public ResponseEntity<Map<String, String>> gerarCodigo(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String codigo = usuarioService.gerarCodigoRecuperacao(email);

        if (codigo != null) {
            // Log já feito no service
            return ResponseEntity.ok(Map.of("codigo", codigo));
        }
        return ResponseEntity.badRequest().build();
    }

    @PostMapping("/redefinir-senha")
    public ResponseEntity<Void> redefinirSenha(@RequestBody Map<String, String> payload) {
        boolean sucesso = usuarioService.redefinirSenhaComCodigo(
                payload.get("email"), payload.get("codigo"), payload.get("novaSenha")
        );

        if (sucesso) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }
}