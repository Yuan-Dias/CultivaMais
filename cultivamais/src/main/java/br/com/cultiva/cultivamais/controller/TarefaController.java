package br.com.cultiva.cultivamais.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import br.com.cultiva.cultivamais.model.Tarefa;
import br.com.cultiva.cultivamais.service.TarefaService;

@RestController
@RequestMapping("/api/tarefas")
public class TarefaController {

    @Autowired
    private TarefaService tarefaService;

    // --- MÉTODO LISTAR (AJUSTADO PARA O DASHBOARD) ---
    @GetMapping
    public ResponseEntity<?> listar(@RequestParam(required=false) Long idUsuario, @RequestParam(required=false) String funcao) {
        try {
            // CENÁRIO 1: DASHBOARD (Sem parâmetros)
            // Se o React chamar sem ID, retornamos TODAS as tarefas para gerar os gráficos
            if (idUsuario == null || funcao == null) {
                // Certifique-se que seu Service tem esse método.
                // Se não tiver, crie lá: return tarefaRepository.findAll();
                List<Tarefa> todas = tarefaService.listarTodas();
                return ResponseEntity.ok(todas);
            }

            // CENÁRIO 2: APP MOBILE / USUÁRIO ESPECÍFICO (Com parâmetros)
            List<Tarefa> lista = tarefaService.listarTarefasPorUsuario(idUsuario, funcao);
            return ResponseEntity.ok(lista);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erro interno: " + e.getMessage());
        }
    }

    @PostMapping
    public Tarefa criar(@RequestParam Long idCriador, @RequestParam(required=false) Long idResponsavel, @RequestBody Tarefa tarefa) {
        Long resp = (idResponsavel != null) ? idResponsavel : idCriador;
        return tarefaService.criarTarefa(idCriador, resp, tarefa);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(
            @PathVariable Long id,
            @RequestBody Tarefa tarefa,
            @RequestParam Long idUsuarioLogado) {

        try {
            Tarefa atualizada = tarefaService.atualizarTarefa(id, tarefa, idUsuarioLogado);
            return ResponseEntity.ok(atualizada);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }

    @PutMapping("/{id}/concluir")
    public ResponseEntity<Tarefa> concluir(
            @PathVariable Long id,
            @RequestParam Long idUsuarioLogado,
            @RequestBody(required = false) Map<String, String> payload
    ) {
        String obs = (payload != null) ? payload.get("observacao") : "";
        Tarefa t = tarefaService.concluirTarefa(id, idUsuarioLogado, obs);

        if (t != null) return ResponseEntity.ok(t);
        return ResponseEntity.badRequest().build();
    }

    @PutMapping("/{id}/cancelar")
    public ResponseEntity<Tarefa> cancelar(@PathVariable Long id, @RequestParam Long idUsuarioLogado) {
        Tarefa t = tarefaService.cancelarTarefa(id, idUsuarioLogado);
        if (t != null) return ResponseEntity.ok(t);
        return ResponseEntity.status(403).body(null);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id, @RequestParam Long idUsuarioLogado) {
        boolean sucesso = tarefaService.excluirTarefa(id, idUsuarioLogado);
        if (sucesso) return ResponseEntity.noContent().build();
        return ResponseEntity.status(403).build();
    }
}