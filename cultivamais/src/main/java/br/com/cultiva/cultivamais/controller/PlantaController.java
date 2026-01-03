package br.com.cultiva.cultivamais.controller;

import java.util.List;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import br.com.cultiva.cultivamais.model.Planta;
import br.com.cultiva.cultivamais.service.PlantaService;
import br.com.cultiva.cultivamais.security.UsuarioPrincipal;

@RestController
@RequestMapping("/api/plantas")
public class PlantaController {

    @Autowired
    private PlantaService plantaService;

    // MÉTODO 1: Via Contexto de Autenticação (Original Corrigido)
    @PostMapping
    @Operation(summary = "Cadastrar nova planta via Token", description = "Adiciona uma espécie ao catálogo usando o ID extraído do Token JWT")
    public ResponseEntity<Planta> criar(@RequestBody Planta planta, Authentication auth) {
        if (auth == null) {
            throw new RuntimeException("Usuário não autenticado no contexto de segurança.");
        }
        UsuarioPrincipal principal = (UsuarioPrincipal) auth.getPrincipal();
        Long idLogado = principal.getId();
        return ResponseEntity.ok(plantaService.criarPlanta(idLogado, planta));
    }

    // MÉTODO 2: Via ID na URL (Fallback para quando o Front enviar o ID explicitamente)
    @PostMapping("/usuario/{idUsuario}")
    @Operation(summary = "Cadastrar nova planta via ID", description = "Adiciona uma espécie ao catálogo usando o ID passado na URL")
    public ResponseEntity<Planta> criarComId(@PathVariable Long idUsuario, @RequestBody Planta planta) {
        return ResponseEntity.ok(plantaService.criarPlanta(idUsuario, planta));
    }

    @GetMapping
    public ResponseEntity<List<Planta>> listarPlantas() {
        return ResponseEntity.ok(plantaService.listarTodas());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Planta> atualizarPlanta(@PathVariable Long id, @RequestBody Planta planta) {
        return ResponseEntity.ok(plantaService.atualizarPlanta(id, planta));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluirPlanta(@PathVariable Long id) {
        plantaService.excluirPlanta(id);
        return ResponseEntity.noContent().build();
    }
}