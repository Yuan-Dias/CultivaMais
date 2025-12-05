package br.com.cultiva.cultivamais.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.cultiva.cultivamais.exception.ResourceNotFoundException;
import br.com.cultiva.cultivamais.model.AreaCultivo;
import br.com.cultiva.cultivamais.repository.AreaCultivoRepository;
import io.micrometer.common.lang.NonNull;

@Service
public class AreaCultivoService {

    @Autowired
    private AreaCultivoRepository areaCultivoRepository;

    @SuppressWarnings("null")
    public AreaCultivo criarAreaCultivo(@NonNull AreaCultivo novaArea) {
        return areaCultivoRepository.save(novaArea);
    }

    public List<AreaCultivo> listarTodas() {
        return areaCultivoRepository.findAll();
    }

    @SuppressWarnings("null")
    public void excluirArea(@NonNull Long id) {
        if (areaCultivoRepository.existsById(id)) {
            areaCultivoRepository.deleteById(id);
        } else {
            throw new ResourceNotFoundException("Área não encontrada para exclusão.");
        }
    }
    
    @SuppressWarnings("null")
    public AreaCultivo atualizarArea(@NonNull Long id, @NonNull AreaCultivo dadosAtualizados) {
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
            .orElseThrow(() -> new ResourceNotFoundException("Área não encontrada para edição."));
    }
}
