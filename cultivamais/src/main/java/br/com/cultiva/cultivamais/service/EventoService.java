package br.com.cultiva.cultivamais.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.cultiva.cultivamais.model.*;
import br.com.cultiva.cultivamais.repository.*;

import java.time.LocalDateTime;

@Service
public class EventoService {

    @Autowired private CultivoRepository cultivoRepository;
    @Autowired private IrrigacaoRepository irrigacaoRepository;
    @Autowired private DoencaPragaRepository doencaPragaRepository;

    public Irrigacao registrarIrrigacao(Long idCultivo, double volumeAgua, MetodoIrrigacao metodo, String observacao, LocalDateTime dataHora) {
        
        Cultivo cultivo = cultivoRepository.findById(idCultivo).orElseThrow(
            () -> new RuntimeException("Cultivo não encontrado: " + idCultivo));

        Irrigacao novaIrrigacao = new Irrigacao(
            cultivo, 
            dataHora,
            observacao, 
            volumeAgua, 
            metodo
        );

        return irrigacaoRepository.save(novaIrrigacao);
    }


    public DoencaPraga registrarDoencaPraga(Long idCultivo, String nomePraga, NivelAfetacao nivel, String observacao, LocalDateTime dataHora) {
        
        Cultivo cultivo = cultivoRepository.findById(idCultivo).orElseThrow(
            () -> new RuntimeException("Cultivo não encontrado: " + idCultivo));

        DoencaPraga novaDoenca = new DoencaPraga(
            cultivo, 
            dataHora,
            observacao, 
            nomePraga, 
            nivel
        );

        return doencaPragaRepository.save(novaDoenca);
    }
}