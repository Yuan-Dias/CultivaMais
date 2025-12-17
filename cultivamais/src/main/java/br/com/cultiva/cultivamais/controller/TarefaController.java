package br.com.cultiva.cultivamais.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import br.com.cultiva.cultivamais.model.Tarefa;
import br.com.cultiva.cultivamais.service.TarefaService;
import br.com.cultiva.cultivamais.service.LogService; // Importar

@RestController
@RequestMapping("/api/tarefas")
public class TarefaController {

    @Autowired
    private TarefaService tarefaService;

    @Autowired
    private LogService logService; // Injetar

    @GetMapping
    public ResponseEntity<List<Tarefa>> listarTarefas() {
        return ResponseEntity.ok(tarefaService.listarTodas());
    }

    @PostMapping
    public ResponseEntity<Tarefa> criarTarefa(@RequestBody Tarefa tarefa, @RequestParam(required = false) Long idResponsavel) {
        Tarefa nova = tarefaService.criarTarefa(tarefa, idResponsavel);

        logService.registrarLog("Gerente", "Criou tarefa: " + nova.getTitulo());

        return ResponseEntity.ok(nova);
    }

    @PutMapping("/{id}/concluir")
    public ResponseEntity<Tarefa> alternarConclusao(@PathVariable Long id) {
        Tarefa t = tarefaService.alternarConclusao(id);

        String status = t.isConcluida() ? "Concluída" : "Pendente";
        logService.registrarLog("Colaborador", "Alterou status da tarefa " + id + " para " + status);

        return ResponseEntity.ok(t);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluirTarefa(@PathVariable Long id) {
        tarefaService.excluir(id);
        logService.registrarLog("Gerente", "Excluiu tarefa ID: " + id);
        return ResponseEntity.noContent().build();
    }
}