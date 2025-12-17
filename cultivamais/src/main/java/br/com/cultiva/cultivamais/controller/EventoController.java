package br.com.cultiva.cultivamais.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import br.com.cultiva.cultivamais.model.*;
import br.com.cultiva.cultivamais.service.EventoService;
import br.com.cultiva.cultivamais.service.LogService; // Importar
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/eventos")
public class EventoController {

    @Autowired
    private EventoService eventoService;

    @Autowired
    private LogService logService; // Injetar

    @PostMapping("/irrigacao")
    public ResponseEntity<Irrigacao> registrarIrrigacao(
            @RequestParam Long cultivoId,
            @RequestParam double volume,
            @RequestParam MetodoIrrigacao metodo,
            @RequestParam(required = false) String obs,
            @RequestParam LocalDateTime dataHora) {

        Irrigacao irrigacaoSalva = eventoService.registrarIrrigacao(cultivoId, volume, metodo, obs, dataHora);

        logService.registrarLog("Operador", "Registrou irrigação no cultivo " + cultivoId + ". Volume: " + volume);

        return ResponseEntity.ok(irrigacaoSalva);
    }

    @PostMapping("/praga")
    public ResponseEntity<DoencaPraga> registrarDoencaPraga(
            @RequestParam Long cultivoId,
            @RequestParam String nome,
            @RequestParam NivelAfetacao nivel,
            @RequestParam(required = false) String obs,
            @RequestParam LocalDateTime dataHora) {

        DoencaPraga doencaSalva = eventoService.registrarDoencaPraga(cultivoId, nome, nivel, obs, dataHora);

        logService.registrarLog("Agrônomo", "Reportou praga/doença: " + nome + " (Nível: " + nivel + ")");

        return ResponseEntity.ok(doencaSalva);
    }
}