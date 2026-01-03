package br.com.cultiva.cultivamais.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.cultiva.cultivamais.model.Cultivo;
import br.com.cultiva.cultivamais.model.DoencaPraga;
import br.com.cultiva.cultivamais.service.RelatorioService;

@RestController
@RequestMapping("/api/relatorios")
public class RelatorioController {

    @Autowired
    private RelatorioService relatorioService;

    @GetMapping("/agua/{idCultivo}")
    public ResponseEntity<Double> getRelatorioAgua(@PathVariable Long idCultivo) {
        return ResponseEntity.ok(relatorioService.calcularTotalAguaCultivo(idCultivo));
    }

    @GetMapping("/compatibilidade/{idPlanta}/{idArea}")
    public ResponseEntity<Boolean> getCompatibilidadeTotal(@PathVariable Long idPlanta, @PathVariable Long idArea) {
        return ResponseEntity.ok(relatorioService.verificarCompatibilidadeTotal(idPlanta, idArea));
    }

    @GetMapping("/colheita/{idArea}")
    public ResponseEntity<Double> getTotalColhidoArea(@PathVariable Long idArea) {
        // CORREÇÃO: Retorna o valor Double somado pelo banco
        return ResponseEntity.ok(relatorioService.calcularTotalColhidoArea(idArea));
    }

    @GetMapping("/previsao/{idArea}")
    public ResponseEntity<List<Cultivo>> previsaoColheita(@PathVariable Long idArea) {
        return ResponseEntity.ok(relatorioService.obterCultivosDaArea(idArea));
    }

    @GetMapping("/pragas/{idCultivo}")
    public ResponseEntity<List<DoencaPraga>> historicoPragas(@PathVariable Long idCultivo) {
        return ResponseEntity.ok(relatorioService.obterHistoricoPragas(idCultivo));
    }
}