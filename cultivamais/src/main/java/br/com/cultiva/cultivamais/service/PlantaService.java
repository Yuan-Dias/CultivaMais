package br.com.cultiva.cultivamais.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.cultiva.cultivamais.model.Planta;
import br.com.cultiva.cultivamais.repository.PlantaRepository;

@Service
public class PlantaService {

    @Autowired
    private PlantaRepository plantaRepository;

    public Planta criarPlanta(Planta novaPlanta) {
        return plantaRepository.save(novaPlanta);
    }

    public List<Planta> listarTodas() {
        return plantaRepository.findAll();
    }

    public void excluirPlanta(Long id) {
        if (plantaRepository.existsById(id)) {
            plantaRepository.deleteById(id);
        } else {
            throw new RuntimeException("Planta não encontrada.");
        }
    }    

    public Planta atualizarPlanta(Long id, Planta dadosAtualizados) {
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
