package br.com.cultiva.cultivamais.controller;

import br.com.cultiva.cultivamais.model.Notificacao;
import br.com.cultiva.cultivamais.service.NotificacaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notificacoes")
public class NotificacaoController {

    @Autowired
    private NotificacaoService service;

    // DTO auxiliar para criação
    public static class NotificacaoDTO {
        public Long idUsuario;
        public String titulo;
        public String mensagem;
        public String tipo;
    }

    // Listar notificações do usuário
    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<Notificacao>> listar(@PathVariable Long idUsuario) {
        return ResponseEntity.ok(service.listarPorUsuario(idUsuario));
    }

    // Criar nova notificação
    @PostMapping
    public ResponseEntity<Notificacao> criar(@RequestBody NotificacaoDTO dto) {
        Notificacao nova = service.criarNotificacao(dto.idUsuario, dto.titulo, dto.mensagem, dto.tipo);
        return ResponseEntity.ok(nova);
    }

    // Marcar uma como lida
    @PutMapping("/{id}/lida")
    public ResponseEntity<Void> marcarLida(@PathVariable Long id) {
        service.marcarComoLida(id);
        return ResponseEntity.noContent().build();
    }

    // Marcar TODAS como lidas
    @PutMapping("/usuario/{idUsuario}/ler-todas")
    public ResponseEntity<Void> marcarTodasLidas(@PathVariable Long idUsuario) {
        service.marcarTodasComoLidas(idUsuario);
        return ResponseEntity.noContent().build();
    }

    // Excluir notificação
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }
}