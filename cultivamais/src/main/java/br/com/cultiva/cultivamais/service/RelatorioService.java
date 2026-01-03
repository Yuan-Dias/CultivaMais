package br.com.cultiva.cultivamais.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.cultiva.cultivamais.exception.ResourceNotFoundException;
import br.com.cultiva.cultivamais.model.AreaCultivo;
import br.com.cultiva.cultivamais.model.Cultivo;
import br.com.cultiva.cultivamais.model.DoencaPraga;
import br.com.cultiva.cultivamais.model.Evento;
import br.com.cultiva.cultivamais.model.Irrigacao;
import br.com.cultiva.cultivamais.model.Planta;
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

    /**
     * CORREÇÃO: Verifica se a planta é compatível com o solo E com a luz da área.
     */
    public boolean verificarCompatibilidadeTotal(Long idPlanta, Long idArea) {
        Planta planta = plantaRepository.findById(idPlanta)
                .orElseThrow(() -> new ResourceNotFoundException("Planta não encontrada"));
        AreaCultivo area = areaCultivoRepository.findById(idArea)
                .orElseThrow(() -> new ResourceNotFoundException("Área não encontrada"));

        boolean soloOk = planta.getSolosRecomendados().contains(area.getTipoSolo());

        // Verifica luz (Assumindo que Planta tem o campo luzRecomendada agora)
        boolean luzOk = true;
        if (planta.getLuzRecomendada() != null) {
            luzOk = planta.getLuzRecomendada() == area.getQuantidadeLuz();
        }

        return soloOk && luzOk;
    }

    /**
     * EVOLUÇÃO: Performance otimizada via SQL (Repository)
     */
    public double calcularTotalColhidoArea(Long idArea) {
        return cultivoRepository.sumQuantidadeColhidaByArea(idArea);
    }

    public double calcularTotalAguaCultivo(@NonNull Long idCultivo) {
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
        AreaCultivo area = areaCultivoRepository.findById(idArea)
                .orElseThrow(() -> new ResourceNotFoundException("Área não encontrada com ID: " + idArea));

        return area.getCultivos();
    }
}