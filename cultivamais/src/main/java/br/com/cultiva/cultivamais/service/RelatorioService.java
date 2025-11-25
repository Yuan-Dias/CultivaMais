package br.com.cultiva.cultivamais.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.cultiva.cultivamais.model.AreaCultivo;
import br.com.cultiva.cultivamais.model.Cultivo;
import br.com.cultiva.cultivamais.model.DoencaPraga;
import br.com.cultiva.cultivamais.model.Evento;
import br.com.cultiva.cultivamais.model.Irrigacao;
import br.com.cultiva.cultivamais.model.Planta;
import br.com.cultiva.cultivamais.model.TipoSolo;
import br.com.cultiva.cultivamais.repository.AreaCultivoRepository;
import br.com.cultiva.cultivamais.repository.CultivoRepository;
import br.com.cultiva.cultivamais.repository.PlantaRepository;

@Service
public class RelatorioService {

    @Autowired
    private CultivoRepository cultivoRepository;

    @Autowired
    private PlantaRepository plantaRepository;

    @Autowired
    private AreaCultivoRepository areaCultivoRepository;


    public boolean verificarCompatibilidadeSolo(Long idPlanta, Long idAreaCultivo) {

        Planta planta = plantaRepository.findById(idPlanta).orElse(null);
        AreaCultivo areaCultivo = areaCultivoRepository.findById(idAreaCultivo).orElse(null);

        if (planta == null || areaCultivo == null || areaCultivo.getTipoSolo() == null) {
            return false;
        }

        TipoSolo soloDaArea = areaCultivo.getTipoSolo();
        
        Set<TipoSolo> solosIdeais = planta.getSolosRecomendados();

        return solosIdeais.contains(soloDaArea);
    }

    public double calcularTotalColhidoArea(Long idAreaCultivo) {
        AreaCultivo areaCultivo = areaCultivoRepository.findById(idAreaCultivo).orElse(null);

        if(areaCultivo == null) {
            return 0.0;
        }

        double totalColhido = 0.0;

        for (Cultivo cultivo : areaCultivo.getCultivos()) {
            totalColhido += cultivo.getQuantidadeColhida();
        }
        return totalColhido;
    }

    public double calcularTotalAguaCultivo(Long idCultivo) {
        Cultivo cultivo = cultivoRepository.findById(idCultivo).orElse(null);

        if(cultivo == null) {
            return 0.0;
        }

        double totalVolume = 0.0;

        for (Evento evento : cultivo.getEventosRegistrados()) {
            if (evento instanceof Irrigacao irrigacao) {
                totalVolume += irrigacao.getVolumeAgua();
            }
        }
        return totalVolume;
    }

    public List<DoencaPraga> obterHistoricoPragas(Long idCultivo) {
        Cultivo cultivo = cultivoRepository.findById(idCultivo).orElse(null);

        if(cultivo == null) {
            return new ArrayList<>();
        }

        List<DoencaPraga> historicoPragas = new ArrayList<>();

        for (Evento evento : cultivo.getEventosRegistrados()) {
            
            if (evento instanceof DoencaPraga doencaPraga) {
                historicoPragas.add(doencaPraga);
            }
        }
        return historicoPragas;
    }

    public List<Cultivo> obterCultivosDaArea(Long idArea) {
        AreaCultivo area = areaCultivoRepository.findById(idArea).orElse(null);
        
        if (area == null) {
            return new ArrayList<>();
        }
        
        return area.getCultivos();
    }
}