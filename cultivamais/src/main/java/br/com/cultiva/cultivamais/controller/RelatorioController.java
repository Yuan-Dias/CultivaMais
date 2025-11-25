package br.com.cultiva.cultivamais.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.cultiva.cultivamais.model.Cultivo;
import br.com.cultiva.cultivamais.service.RelatorioService;


@RestController

@RequestMapping("/api/relatorios")
public class RelatorioController {
    
    @Autowired
    private RelatorioService relatorioService;

    @GetMapping("/agua/{idCultivo}")
    public ResponseEntity<Double> getRelatorioAgua(@PathVariable Long idCultivo) {
        double totalAgua = relatorioService.calcularTotalAguaCultivo(idCultivo);
        return ResponseEntity.ok(totalAgua);
    }

    @GetMapping("/compatibilidade/{idPlanta}/{idArea}")
    public ResponseEntity<Boolean> getCompatibilidadeSolo(@PathVariable Long idPlanta, @PathVariable Long idArea) {

        boolean compativel = relatorioService.verificarCompatibilidadeSolo(idPlanta, idArea);
        return ResponseEntity.ok(compativel);
    }

    @GetMapping("/colheita/{idArea}")
    public ResponseEntity<List<Cultivo>> previsaoColheita(@PathVariable Long idArea) {
        
        List<Cultivo> cultivos = relatorioService.obterCultivosDaArea(idArea);
        return ResponseEntity.ok(cultivos);
    }

    @GetMapping("/pragas/{idCultivo}")
    public ResponseEntity<List<br.com.cultiva.cultivamais.model.DoencaPraga>> historicoPragas(@PathVariable Long idCultivo) {
        
        List<br.com.cultiva.cultivamais.model.DoencaPraga> historico = relatorioService.obterHistoricoPragas(idCultivo);
        
        return ResponseEntity.ok(historico);
    }
}
