package br.com.cultiva.cultivamais.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.cultiva.cultivamais.exception.ResourceNotFoundException;
import br.com.cultiva.cultivamais.model.LogSistema;
import br.com.cultiva.cultivamais.model.Planta;
import br.com.cultiva.cultivamais.repository.LogRepository;
import br.com.cultiva.cultivamais.repository.PlantaRepository;
import io.micrometer.common.lang.NonNull;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PlantaService {

    @Autowired
    private PlantaRepository plantaRepository;

    @Autowired
    private LogRepository logRepository;

    @Autowired
    private NotificacaoService notificacaoService;

    @Transactional
    public Planta criarPlanta(@NonNull Long idUsuario, @NonNull Planta novaPlanta) {
        Planta salva = plantaRepository.save(novaPlanta);

        logRepository.save(new LogSistema("Usuario ID " + idUsuario, "Cadastrou planta: " + salva.getNomePopular()));

        notificacaoService.criarNotificacao(
                idUsuario,
                "Nova Espécie Cadastrada",
                salva.getNomePopular() + " agora faz parte do catálogo.",
                "info"
        );

        return salva;
    }
    public List<Planta> listarTodas() {
        return plantaRepository.findAll();
    }

    @SuppressWarnings("null")
    public void excluirPlanta(@NonNull Long id) {
        if (plantaRepository.existsById(id)) {
            plantaRepository.deleteById(id);
            logRepository.save(new LogSistema("Sistema", "Excluiu planta ID: " + id));
        } else {
            throw new ResourceNotFoundException("Planta não encontrada.");
        }
    }

    @Transactional
    public Planta atualizarPlanta(@NonNull Long id, Planta dadosAtualizados) {
        return plantaRepository.findById(id)
                .map(plantaExistente -> {
                    plantaExistente.setNomePopular(dadosAtualizados.getNomePopular());
                    plantaExistente.setNomeCientifico(dadosAtualizados.getNomeCientifico());
                    plantaExistente.setTipoPlanta(dadosAtualizados.getTipoPlanta());
                    plantaExistente.setCicloMedioDias(dadosAtualizados.getCicloMedioDias());
                    plantaExistente.setLuzRecomendada(dadosAtualizados.getLuzRecomendada());
                    plantaExistente.setAguaRecomendada(dadosAtualizados.getAguaRecomendada());
                    plantaExistente.setSolosRecomendados(dadosAtualizados.getSolosRecomendados());

                    Planta salva = plantaRepository.save(plantaExistente);
                    logRepository.save(new LogSistema("Sistema", "Atualizou cadastro da planta: " + salva.getNomePopular()));
                    return salva;
                })
                .orElseThrow(() -> new ResourceNotFoundException("Planta não encontrada para edição."));
    }
}