package br.com.cultiva.cultivamais.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.cultiva.cultivamais.model.AreaCultivo;
import br.com.cultiva.cultivamais.repository.AreaCultivoRepository;

@Service
public class AreaCultivoService {

    @Autowired
    private AreaCultivoRepository areaCultivoRepository;

    public AreaCultivo criarAreaCultivo(AreaCultivo novaArea) {
        return areaCultivoRepository.save(novaArea);
    }

    public List<AreaCultivo> listarTodas() {
        return areaCultivoRepository.findAll();
    }

    public void excluirArea(Long id) {
        if (areaCultivoRepository.existsById(id)) {
            areaCultivoRepository.deleteById(id);
        } else {
            throw new RuntimeException("Área não encontrada para exclusão.");
        }
    }
    
    public AreaCultivo atualizarArea(Long id, AreaCultivo dadosAtualizados) {
        return areaCultivoRepository.findById(id)
            .map(areaExistente -> {
                areaExistente.setNomeArea(dadosAtualizados.getNomeArea());
                areaExistente.setLocalizacaoArea(dadosAtualizados.getLocalizacaoArea());
                areaExistente.setTamanhoArea(dadosAtualizados.getTamanhoArea());
                areaExistente.setTipoSolo(dadosAtualizados.getTipoSolo());
                
                if (dadosAtualizados.getLatitudeArea() != 0) 
                    areaExistente.setLatitudeArea(dadosAtualizados.getLatitudeArea());
                if (dadosAtualizados.getLongitudeArea() != 0) 
                    areaExistente.setLongitudeArea(dadosAtualizados.getLongitudeArea());

                return areaCultivoRepository.save(areaExistente);
            })
            .orElseThrow(() -> new RuntimeException("Área não encontrada para edição."));
    }
}
