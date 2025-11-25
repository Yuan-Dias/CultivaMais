package br.com.cultiva.cultivamais.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.cultiva.cultivamais.model.AreaCultivo;
import br.com.cultiva.cultivamais.model.Cultivo;
import br.com.cultiva.cultivamais.model.Planta;
import br.com.cultiva.cultivamais.repository.AreaCultivoRepository;
import br.com.cultiva.cultivamais.repository.CultivoRepository;
import br.com.cultiva.cultivamais.repository.PlantaRepository;

@Service
public class CultivoService {

    @Autowired
    private CultivoRepository cultivoRepository;

    @Autowired
    private PlantaRepository plantaRepository;

    @Autowired
    private AreaCultivoRepository areaCultivoRepository;

    public Cultivo criarCultivo(Long idPlanta, Long idArea, double quantidadePlantada, LocalDate dataPlantio) {

        Planta planta = plantaRepository.findById(idPlanta).orElseThrow(
            () -> new RuntimeException("Planta não encontrada com ID: " + idPlanta));

        AreaCultivo areaCultivo = areaCultivoRepository.findById(idArea).orElseThrow(
            () -> new RuntimeException("Área não encontrada com o ID: " + idArea));

        Cultivo novoCultivo = new Cultivo(planta, areaCultivo, dataPlantio, quantidadePlantada);

        return cultivoRepository.save(novoCultivo);
    }

    public List<Cultivo> listarTodos() {
        return cultivoRepository.findAll();
    }

    public void excluirCultivo(Long id) {
        if (cultivoRepository.existsById(id)) {
            cultivoRepository.deleteById(id);
        } else {
            throw new RuntimeException("Cultivo não encontrado para exclusão.");
        }
    }

    public Cultivo atualizarCultivo(Long id, Cultivo dadosAtualizados) {
        return cultivoRepository.findById(id)
            .map(cultivoExistente -> {
                cultivoExistente.setQuantidadePlantada(dadosAtualizados.getQuantidadePlantada());
                cultivoExistente.setQuantidadeColhida(dadosAtualizados.getQuantidadeColhida());
                cultivoExistente.setDataPlantio(dadosAtualizados.getDataPlantio());
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
            .orElseThrow(() -> new RuntimeException("Cultivo não encontrado para edição."));
    }
}
