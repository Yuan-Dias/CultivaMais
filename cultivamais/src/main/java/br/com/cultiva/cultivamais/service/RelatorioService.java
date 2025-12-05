package br.com.cultiva.cultivamais.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.cultiva.cultivamais.exception.ResourceNotFoundException;
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
import io.micrometer.common.lang.NonNull;

@Service
public class RelatorioService {

    @Autowired
    private CultivoRepository cultivoRepository;

    @Autowired
    private PlantaRepository plantaRepository;

    @Autowired
    private AreaCultivoRepository areaCultivoRepository;


    public boolean verificarCompatibilidadeSolo(@NonNull Long idPlanta, @NonNull Long idAreaCultivo) {

        @SuppressWarnings("null")
        Planta planta = plantaRepository.findById(idPlanta)
            .orElseThrow(() -> new ResourceNotFoundException("Planta não encontrada com ID: " + idPlanta));

        @SuppressWarnings("null")
        AreaCultivo areaCultivo = areaCultivoRepository.findById(idAreaCultivo)
            .orElseThrow(() -> new ResourceNotFoundException("Área não encontrada com ID: " + idAreaCultivo));

        if (areaCultivo.getTipoSolo() == null) {
            throw new IllegalArgumentException("A área selecionada não possui tipo de solo definido.");
        }

        TipoSolo soloDaArea = areaCultivo.getTipoSolo();
        Set<TipoSolo> solosIdeais = planta.getSolosRecomendados();

        return solosIdeais.contains(soloDaArea);
    }

    public double calcularTotalColhidoArea(@NonNull Long idAreaCultivo) {
        @SuppressWarnings("null")
        AreaCultivo areaCultivo = areaCultivoRepository.findById(idAreaCultivo)
            .orElseThrow(() -> new ResourceNotFoundException("Área não encontrada com ID: " + idAreaCultivo));

        double totalColhido = 0.0;

        for (Cultivo cultivo : areaCultivo.getCultivos()) {
            totalColhido += cultivo.getQuantidadeColhida();
        }
        return totalColhido;
    }

    public double calcularTotalAguaCultivo(@NonNull Long idCultivo) {
        @SuppressWarnings("null")
        Cultivo cultivo = cultivoRepository.findById(idCultivo)
            .orElseThrow(() -> new ResourceNotFoundException("Cultivo não encontrado com ID: " + idCultivo));

        double totalVolume = 0.0;

        for (Evento evento : cultivo.getEventosRegistrados()) {
            if (evento instanceof Irrigacao irrigacao) {
                totalVolume += irrigacao.getVolumeAgua();
            }
        }
        return totalVolume;
    }

    public List<DoencaPraga> obterHistoricoPragas(@NonNull Long idCultivo) {
        @SuppressWarnings("null")
        Cultivo cultivo = cultivoRepository.findById(idCultivo)
            .orElseThrow(() -> new ResourceNotFoundException("Cultivo não encontrado com ID: " + idCultivo));

        List<DoencaPraga> historicoPragas = new ArrayList<>();

        for (Evento evento : cultivo.getEventosRegistrados()) {
            
            if (evento instanceof DoencaPraga doencaPraga) {
                historicoPragas.add(doencaPraga);
            }
        }
        return historicoPragas;
    }

    public List<Cultivo> obterCultivosDaArea(@NonNull Long idArea) {
        @SuppressWarnings("null")
        AreaCultivo area = areaCultivoRepository.findById(idArea)
            .orElseThrow(() -> new ResourceNotFoundException("Área não encontrada com ID: " + idArea));
        
        return area.getCultivos();
    }
}