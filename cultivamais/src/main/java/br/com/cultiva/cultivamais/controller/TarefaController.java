package br.com.cultiva.cultivamais.controller;

import java.util.List;
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

    // 1. Listar todas as tarefas (GET)
    @GetMapping
    public ResponseEntity<List<Tarefa>> listarTarefas() {
        return ResponseEntity.ok(tarefaService.listarTodas());
    }

    // 2. Criar tarefa (POST)
    // Recebe o objeto Tarefa no corpo e o ID do responsável na URL (opcional)
    @PostMapping
    public ResponseEntity<Tarefa> criarTarefa(
            @RequestBody Tarefa tarefa, 
            @RequestParam(required = false) Long idResponsavel) {
        
        return ResponseEntity.ok(tarefaService.criarTarefa(tarefa, idResponsavel));
    }

    // 3. Marcar como concluída/pendente (PUT)
    @PutMapping("/{id}/concluir")
    public ResponseEntity<Tarefa> alternarConclusao(@PathVariable Long id) {
        Tarefa t = tarefaService.alternarConclusao(id);
        return ResponseEntity.ok(t);
    }
    
    // 4. Excluir tarefa (DELETE)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluirTarefa(@PathVariable Long id) {
        tarefaService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}