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

import br.com.cultiva.cultivamais.model.AreaCultivo;
import br.com.cultiva.cultivamais.service.AreaCultivoService;
import br.com.cultiva.cultivamais.service.GeolocalizacaoService;
import br.com.cultiva.cultivamais.service.GeolocalizacaoService.DadosSolares;


@RestController
@RequestMapping("/api/areas")
public class AreaCultivoController {

    @Autowired
    private AreaCultivoService areaCultivoService;

    @Autowired
    private GeolocalizacaoService geolocalizacaoService;

    @PostMapping
    public ResponseEntity<AreaCultivo> criarAreaCultivo(@RequestBody AreaCultivo area) {
        
        AreaCultivo areaSalva = areaCultivoService.criarAreaCultivo(area);
        
        return ResponseEntity.ok(areaSalva);
    }

    @GetMapping
    public ResponseEntity<List<AreaCultivo>> listarAreas() {
        List<AreaCultivo> lista = areaCultivoService.listarTodas();
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/{id}/clima")
    public ResponseEntity<DadosSolares> obterDadosClimaticos(@PathVariable Long id) {
        DadosSolares dados = geolocalizacaoService.buscarDadosExternos(id);
        
        if (dados != null) {
            return ResponseEntity.ok(dados);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluirArea(@PathVariable Long id) {
        areaCultivoService.excluirArea(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<AreaCultivo> atualizarArea(@PathVariable Long id, @RequestBody AreaCultivo area) {
        AreaCultivo areaAtualizada = areaCultivoService.atualizarArea(id, area);
        return ResponseEntity.ok(areaAtualizada);
    }
}
