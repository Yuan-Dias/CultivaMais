package br.com.cultiva.cultivamais.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.cultiva.cultivamais.model.Planta;
import br.com.cultiva.cultivamais.repository.PlantaRepository;
import io.micrometer.common.lang.NonNull;

@Service
public class PlantaService {

    @Autowired
    private PlantaRepository plantaRepository;

    @SuppressWarnings("null")
    public Planta criarPlanta(@NonNull Planta novaPlanta) {
        return plantaRepository.save(novaPlanta);
    }

    public List<Planta> listarTodas() {
        return plantaRepository.findAll();
    }

    @SuppressWarnings("null")
    public void excluirPlanta(@NonNull Long id) {
        if (plantaRepository.existsById(id)) {
            plantaRepository.deleteById(id);
        } else {
            throw new RuntimeException("Planta não encontrada.");
        }
    }    

    @SuppressWarnings("null")
    public Planta atualizarPlanta(@NonNull Long id, Planta dadosAtualizados) {
        return plantaRepository.findById(id)
            .map(plantaExistente -> {
                plantaExistente.setNomePopular(dadosAtualizados.getNomePopular());
                plantaExistente.setNomeCientifico(dadosAtualizados.getNomeCientifico());
                plantaExistente.setTipoPlanta(dadosAtualizados.getTipoPlanta());
                plantaExistente.setCicloMedioDias(dadosAtualizados.getCicloMedioDias());
                return plantaRepository.save(plantaExistente);
            })
            .orElseThrow(() -> new RuntimeException("Planta não encontrada para edição."));
    }
}
