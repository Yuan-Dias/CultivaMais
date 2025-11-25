package br.com.cultiva.cultivamais.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.cultiva.cultivamais.model.Cultivo;
import br.com.cultiva.cultivamais.service.CultivoService;

@RestController
@RequestMapping("/api/cultivos")
public class CultivoController {

    @Autowired
    private CultivoService cultivoService;

    @PostMapping
    public ResponseEntity<Cultivo> criarCultivo(
            @RequestParam Long idPlanta,
            @RequestParam Long idArea,
            @RequestParam double quantidadePlantada,
            @RequestParam LocalDate dataPlantio) {

        Cultivo cultivoSalvo = cultivoService.criarCultivo(
            idPlanta, idArea, quantidadePlantada, dataPlantio);

        return ResponseEntity.ok(cultivoSalvo);
    }

    @GetMapping
    public ResponseEntity<List<Cultivo>> listarCultivos() {
        List<Cultivo> lista = cultivoService.listarTodos();
        return ResponseEntity.ok(lista);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluirCultivo(@PathVariable Long id) {
        cultivoService.excluirCultivo(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Cultivo> atualizarCultivo(@PathVariable Long id, @RequestBody Cultivo cultivo) {
        Cultivo cultivoAtualizado = cultivoService.atualizarCultivo(id, cultivo);
        return ResponseEntity.ok(cultivoAtualizado);
    }
}