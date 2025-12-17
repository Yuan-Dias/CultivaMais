package br.com.cultiva.cultivamais.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import br.com.cultiva.cultivamais.model.AreaCultivo;
import br.com.cultiva.cultivamais.service.AreaCultivoService;
import br.com.cultiva.cultivamais.service.GeolocalizacaoService;
import br.com.cultiva.cultivamais.service.GeolocalizacaoService.DadosSolares;
import br.com.cultiva.cultivamais.service.LogService; // Importar

@RestController
@RequestMapping("/api/areas")
public class AreaCultivoController {

    @Autowired
    private AreaCultivoService areaCultivoService;

    @Autowired
    private GeolocalizacaoService geolocalizacaoService;

    @Autowired
    private LogService logService; // Injetar

    @PostMapping
    public ResponseEntity<AreaCultivo> criarAreaCultivo(@RequestBody AreaCultivo area) {
        AreaCultivo areaSalva = areaCultivoService.criarAreaCultivo(area);

        logService.registrarLog("Sistema", "Cadastrou nova área de cultivo: " + areaSalva.getNomeArea());

        return ResponseEntity.ok(areaSalva);
    }

    @GetMapping
    public ResponseEntity<List<AreaCultivo>> listarAreas() {
        return ResponseEntity.ok(areaCultivoService.listarTodas());
    }

    @GetMapping("/{id}/clima")
    public ResponseEntity<DadosSolares> obterDadosClimaticos(@PathVariable Long id) {
        DadosSolares dados = geolocalizacaoService.buscarDadosExternos(id);
        if (dados != null) return ResponseEntity.ok(dados);
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluirArea(@PathVariable Long id) {
        areaCultivoService.excluirArea(id);

        logService.registrarLog("Sistema", "Removeu a área de cultivo ID: " + id);

        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<AreaCultivo> atualizarArea(@PathVariable Long id, @RequestBody AreaCultivo area) {
        AreaCultivo areaAtualizada = areaCultivoService.atualizarArea(id, area);

        logService.registrarLog("Sistema", "Atualizou a área de cultivo ID: " + id);

        return ResponseEntity.ok(areaAtualizada);
    }
}