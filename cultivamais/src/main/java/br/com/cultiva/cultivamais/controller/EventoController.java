package br.com.cultiva.cultivamais.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.cultiva.cultivamais.model.*;
import br.com.cultiva.cultivamais.service.EventoService;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/eventos")
public class EventoController {

    @Autowired
    private EventoService eventoService;

    @PostMapping("/irrigacao")
    public ResponseEntity<Irrigacao> registrarIrrigacao(
            @RequestParam Long cultivoId,
            @RequestParam double volume,
            @RequestParam MetodoIrrigacao metodo,
            @RequestParam(required = false) String obs,
            @RequestParam LocalDateTime dataHora) {

        Irrigacao irrigacaoSalva = eventoService.registrarIrrigacao(
            cultivoId, volume, metodo, obs, dataHora);
            
        return ResponseEntity.ok(irrigacaoSalva);
    }

    @PostMapping("/praga")
    public ResponseEntity<DoencaPraga> registrarDoencaPraga(
            @RequestParam Long cultivoId,
            @RequestParam String nome,
            @RequestParam NivelAfetacao nivel,
            @RequestParam(required = false) String obs,
            @RequestParam LocalDateTime dataHora) {

        DoencaPraga doencaSalva = eventoService.registrarDoencaPraga(
            cultivoId, nome, nivel, obs, dataHora);
            
        return ResponseEntity.ok(doencaSalva);
    }
}