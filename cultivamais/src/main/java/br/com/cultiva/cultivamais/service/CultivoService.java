package br.com.cultiva.cultivamais.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.cultiva.cultivamais.exception.ResourceNotFoundException;
import br.com.cultiva.cultivamais.model.AreaCultivo;
import br.com.cultiva.cultivamais.model.Cultivo;
import br.com.cultiva.cultivamais.model.Planta;
import br.com.cultiva.cultivamais.repository.AreaCultivoRepository;
import br.com.cultiva.cultivamais.repository.CultivoRepository;
import br.com.cultiva.cultivamais.repository.PlantaRepository;
import io.micrometer.common.lang.NonNull;

@Service
public class CultivoService {

    @Autowired
    private CultivoRepository cultivoRepository;

    @Autowired
    private PlantaRepository plantaRepository;

    @Autowired
    private AreaCultivoRepository areaCultivoRepository;

    public Cultivo criarCultivo(@NonNull Long idPlanta, @NonNull Long idArea, double quantidadePlantada, LocalDate dataPlantio) {

        @SuppressWarnings("null")
        Planta planta = plantaRepository.findById(idPlanta).orElseThrow(
            () -> new ResourceNotFoundException("Planta não encontrada com ID: " + idPlanta));

        @SuppressWarnings("null")
        AreaCultivo areaCultivo = areaCultivoRepository.findById(idArea).orElseThrow(
            () -> new ResourceNotFoundException("Área não encontrada com o ID: " + idArea));

        Cultivo novoCultivo = new Cultivo(planta, areaCultivo, dataPlantio, quantidadePlantada);

        return cultivoRepository.save(novoCultivo);
    }

    public List<Cultivo> listarTodos() {
        return cultivoRepository.findAll();
    }

    @SuppressWarnings("null")
    public void excluirCultivo(Long id) {
        if (cultivoRepository.existsById(id)) {
            cultivoRepository.deleteById(id);
        } else {
            throw new ResourceNotFoundException("Cultivo não encontrado para exclusão.");
        }
    }

    @SuppressWarnings("null")
    public Cultivo atualizarCultivo(@NonNull Long id, Cultivo dadosAtualizados) {
        return cultivoRepository.findById(id)
            .map(cultivoExistente -> {
                cultivoExistente.setQuantidadePlantada(dadosAtualizados.getQuantidadePlantada());
                cultivoExistente.setQuantidadeColhida(dadosAtualizados.getQuantidadeColhida());
                cultivoExistente.setDataPlantio(dadosAtualizados.getDataPlantio());
                cultivoExistente.setDataColheitaFinal(dadosAtualizados.getDataColheitaFinal());
                cultivoExistente.setStatusCultivo(dadosAtualizados.getStatusCultivo());
                cultivoExistente.setEstadoPlanta(dadosAtualizados.getEstadoPlanta());
                cultivoExistente.setObservacaoCultivo(dadosAtualizados.getObservacaoCultivo());
                
                if (cultivoExistente.getPlantaCultivada() != null && dadosAtualizados.getDataPlantio() != null) {
                     cultivoExistente.setPrevisaoColheita(
                        dadosAtualizados.getDataPlantio().plusDays(
                            cultivoExistente.getPlantaCultivada().getCicloMedioDias()
                        )
                     );
                }

                return cultivoRepository.save(cultivoExistente);
            })
            .orElseThrow(() -> new ResourceNotFoundException("Cultivo não encontrado para edição."));
    }
}
