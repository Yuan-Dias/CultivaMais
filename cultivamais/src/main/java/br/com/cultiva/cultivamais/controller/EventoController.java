package br.com.cultiva.cultivamais.controller;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.cultiva.cultivamais.model.DoencaPraga;
import br.com.cultiva.cultivamais.model.Irrigacao;
import br.com.cultiva.cultivamais.model.MetodoIrrigacao;
import br.com.cultiva.cultivamais.model.NivelAfetacao;
import br.com.cultiva.cultivamais.service.EventoService;

@RestController
@RequestMapping("/api/eventos")
public class EventoController {

    @Autowired
    private EventoService eventoService;

    // --- REGISTRAR IRRIGAÇÃO ---
    @PostMapping("/irrigacao/{idCultivo}")
    public ResponseEntity<Irrigacao> registrarIrrigacao(
            @PathVariable Long idCultivo,
            @RequestParam Long idUsuario,
            @RequestParam double volumeAgua,
            @RequestParam MetodoIrrigacao metodo,
            @RequestParam(required = false) String observacao,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataHora) {

        // Se a data não for informada, usa o momento atual
        if (dataHora == null) {
            dataHora = LocalDateTime.now();
        }

        Irrigacao irrigacao = eventoService.registrarIrrigacao(idUsuario, idCultivo, volumeAgua, metodo, observacao, dataHora);

        return ResponseEntity.ok(irrigacao);
    }

    // --- REGISTRAR DOENÇA/PRAGA ---
    @PostMapping("/praga/{idCultivo}")
    public ResponseEntity<DoencaPraga> registrarPraga(
            @PathVariable Long idCultivo,
            @RequestParam Long idUsuario,
            @RequestParam String nomePraga,
            @RequestParam NivelAfetacao nivel,
            @RequestParam(required = false) String observacao,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataHora) {

        if (dataHora == null) {
            dataHora = LocalDateTime.now();
        }

        DoencaPraga praga = eventoService.registrarDoencaPraga(idUsuario, idCultivo, nomePraga, nivel, observacao, dataHora);

        return ResponseEntity.ok(praga);
    }
}