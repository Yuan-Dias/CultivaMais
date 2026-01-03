package br.com.cultiva.cultivamais.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.cultiva.cultivamais.exception.ResourceNotFoundException;
import br.com.cultiva.cultivamais.model.AreaCultivo;
import br.com.cultiva.cultivamais.model.LogSistema; // Import Log
import br.com.cultiva.cultivamais.repository.AreaCultivoRepository;
import br.com.cultiva.cultivamais.repository.LogRepository; // Import Repo
import io.micrometer.common.lang.NonNull;

@Service
public class AreaCultivoService {

    @Autowired
    private AreaCultivoRepository areaCultivoRepository;

    @Autowired
    private LogRepository logRepository;

    @SuppressWarnings("null")
    public AreaCultivo criarAreaCultivo(@NonNull AreaCultivo novaArea) {
        AreaCultivo salva = areaCultivoRepository.save(novaArea);

        // Log
        logRepository.save(new LogSistema("Sistema", "Criou nova área de cultivo: " + salva.getNomeArea()));

        return salva;
    }

    public List<AreaCultivo> listarTodas() {
        return areaCultivoRepository.findAll();
    }

    @SuppressWarnings("null")
    public void excluirArea(@NonNull Long id) {
        if (areaCultivoRepository.existsById(id)) {
            areaCultivoRepository.deleteById(id);
            // Log
            logRepository.save(new LogSistema("Sistema", "Excluiu a área de cultivo ID: " + id));
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

                    AreaCultivo atualizada = areaCultivoRepository.save(areaExistente);

                    // Log
                    logRepository.save(new LogSistema("Sistema", "Atualizou a área de cultivo: " + atualizada.getNomeArea()));

                    return atualizada;
                })
                .orElseThrow(() -> new ResourceNotFoundException("Área não encontrada para edição."));
    }
}