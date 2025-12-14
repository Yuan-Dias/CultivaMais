package br.com.cultiva.cultivamais.service;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.cultiva.cultivamais.exception.ResourceNotFoundException;
import br.com.cultiva.cultivamais.model.Cultivo;
import br.com.cultiva.cultivamais.model.DoencaPraga;
import br.com.cultiva.cultivamais.model.Irrigacao;
import br.com.cultiva.cultivamais.model.LogSistema;
import br.com.cultiva.cultivamais.model.MetodoIrrigacao;
import br.com.cultiva.cultivamais.model.NivelAfetacao;
import br.com.cultiva.cultivamais.repository.CultivoRepository;
import br.com.cultiva.cultivamais.repository.DoencaPragaRepository;
import br.com.cultiva.cultivamais.repository.IrrigacaoRepository;
import br.com.cultiva.cultivamais.repository.LogRepository;
import io.micrometer.common.lang.NonNull;

@Service
public class EventoService {

    @Autowired private CultivoRepository cultivoRepository;
    @Autowired private IrrigacaoRepository irrigacaoRepository;
    @Autowired private DoencaPragaRepository doencaPragaRepository;
    @Autowired private LogRepository logRepository; // Log

    public Irrigacao registrarIrrigacao(@NonNull Long idCultivo, double volumeAgua, MetodoIrrigacao metodo, String observacao, LocalDateTime dataHora) {

        @SuppressWarnings("null")
        Cultivo cultivo = cultivoRepository.findById(idCultivo)
                .orElseThrow(() -> new ResourceNotFoundException("Cultivo não encontrado: " + idCultivo));

        Irrigacao novaIrrigacao = new Irrigacao(cultivo, dataHora, observacao, volumeAgua, metodo);
        Irrigacao salvo = irrigacaoRepository.save(novaIrrigacao);

        // Log
        logRepository.save(new LogSistema("Sistema", "Registrou irrigação de " + volumeAgua + "L no cultivo ID " + idCultivo));

        return salvo;
    }


    public DoencaPraga registrarDoencaPraga(@NonNull Long idCultivo, String nomePraga, NivelAfetacao nivel, String observacao, LocalDateTime dataHora) {

        @SuppressWarnings("null")
        Cultivo cultivo = cultivoRepository.findById(idCultivo).orElseThrow(
                () -> new ResourceNotFoundException("Cultivo não encontrado: " + idCultivo));

        DoencaPraga novaDoenca = new DoencaPraga(cultivo, dataHora, observacao, nomePraga, nivel);
        DoencaPraga salvo = doencaPragaRepository.save(novaDoenca);

        // Log
        logRepository.save(new LogSistema("Sistema", "Registrou praga/doença '" + nomePraga + "' no cultivo ID " + idCultivo));

        return salvo;
    }
}