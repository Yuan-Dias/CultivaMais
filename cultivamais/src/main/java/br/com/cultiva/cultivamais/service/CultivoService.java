package br.com.cultiva.cultivamais.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.cultiva.cultivamais.model.AreaCultivo;
import br.com.cultiva.cultivamais.model.Cultivo;
import br.com.cultiva.cultivamais.model.EstadoPlanta;
import br.com.cultiva.cultivamais.model.Planta;
import br.com.cultiva.cultivamais.model.StatusCultivo;
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

    @Autowired
    private LogService logService;

    // --- CRIAR CULTIVO ---
    @Transactional
    public Cultivo criarCultivo(Long idPlanta, Long idArea, double quantidadePlantada, LocalDate dataPlantio) {
        Optional<Planta> plantaOpt = plantaRepository.findById(idPlanta);
        Optional<AreaCultivo> areaOpt = areaCultivoRepository.findById(idArea);

        if (plantaOpt.isPresent() && areaOpt.isPresent()) {
            Planta planta = plantaOpt.get();
            AreaCultivo area = areaOpt.get();

            // Usa o construtor do seu Model que já define:
            // Status = ATIVO, Estado = SAUDAVEL e calcula a Previsão de Colheita
            Cultivo novoCultivo = new Cultivo(planta, area, dataPlantio, quantidadePlantada);

            Cultivo salvo = cultivoRepository.save(novoCultivo);

            logService.registrarLog("Sistema",
                    "Iniciou cultivo de " + planta.getNomePopular() + " na área " + area.getNomeArea());

            return salvo;
        } else {
            throw new RuntimeException("Planta ou Área de Cultivo não encontrados.");
        }
    }

    // --- LISTAR TODOS ---
    public List<Cultivo> listarTodos() {
        return cultivoRepository.findAll();
    }

    // --- ATUALIZAR ---
    @Transactional
    public Cultivo atualizarCultivo(Long id, Cultivo dadosNovos) {
        Optional<Cultivo> cultivoOpt = cultivoRepository.findById(id);

        if (cultivoOpt.isPresent()) {
            Cultivo cultivo = cultivoOpt.get();

            // 1. Atualiza Quantidade e Observação
            // Verificamos se é > 0 para não zerar sem querer, a menos que seja intencional
            if(dadosNovos.getQuantidadePlantada() > 0) {
                cultivo.setQuantidadePlantada(dadosNovos.getQuantidadePlantada());
            }
            if (dadosNovos.getObservacaoCultivo() != null) {
                cultivo.setObservacaoCultivo(dadosNovos.getObservacaoCultivo());
            }

            // 2. Atualiza Status (Ex: mudar de EM_PREPARO para ATIVO ou CANCELADO)
            if (dadosNovos.getStatusCultivo() != null) {
                cultivo.setStatusCultivo(dadosNovos.getStatusCultivo());
            }

            // 3. Atualiza Estado da Planta (Ex: mudar de SAUDAVEL para PRAGA ou ATENCAO)
            if (dadosNovos.getEstadoPlanta() != null) {
                cultivo.setEstadoPlanta(dadosNovos.getEstadoPlanta());

                // Se ficar CRITICO, gera um log específico
                if(dadosNovos.getEstadoPlanta() == EstadoPlanta.CRITICO) {
                    logService.registrarLog("Alerta", "O cultivo ID " + id + " entrou em estado CRÍTICO.");
                }
            }

            // 4. Lógica de Colheita
            // Se o usuário mandou a data da colheita, finalizamos o ciclo
            if (dadosNovos.getDataColheitaFinal() != null) {
                cultivo.setDataColheitaFinal(dadosNovos.getDataColheitaFinal());
                cultivo.setQuantidadeColhida(dadosNovos.getQuantidadeColhida());

                // Atualiza automaticamente para COLHIDO
                cultivo.setStatusCultivo(StatusCultivo.COLHIDO);

                logService.registrarLog("Sistema", "Cultivo ID " + id + " foi colhido com sucesso.");
            }

            return cultivoRepository.save(cultivo);
        }
        return null;
    }

    // --- EXCLUIR ---
    public void excluirCultivo(Long id) {
        if (cultivoRepository.existsById(id)) {
            cultivoRepository.deleteById(id);
            logService.registrarLog("Sistema", "Removeu cultivo ID: " + id);
        } else {
            throw new RuntimeException("Cultivo não encontrado para exclusão.");
        }
    }
}