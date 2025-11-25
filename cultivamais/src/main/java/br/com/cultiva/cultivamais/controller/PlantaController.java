package br.com.cultiva.cultivamais.controller;

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
import org.springframework.web.bind.annotation.RestController;

import br.com.cultiva.cultivamais.model.Planta;
import br.com.cultiva.cultivamais.service.PlantaService;



@RestController
@RequestMapping("/api/plantas")
public class PlantaController {

    @Autowired
    private PlantaService plantaService;

    @PostMapping
    public ResponseEntity<Planta> criarPlanta(@RequestBody Planta planta) {
        Planta plantaSalva = plantaService.criarPlanta(planta);
        return ResponseEntity.ok(plantaSalva);
    }
    
    @GetMapping
    public ResponseEntity<List<Planta>> listarPlantas() {
        List<Planta> lista = plantaService.listarTodas();
        return ResponseEntity.ok(lista);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluirPlanta(@PathVariable Long id) {
        plantaService.excluirPlanta(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Planta> atualizarPlanta(@PathVariable Long id, @RequestBody Planta planta) {
        Planta plantaAtualizada = plantaService.atualizarPlanta(id, planta);
        return ResponseEntity.ok(plantaAtualizada);
    }
}
