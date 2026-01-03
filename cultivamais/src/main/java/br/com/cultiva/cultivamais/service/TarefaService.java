package br.com.cultiva.cultivamais.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import br.com.cultiva.cultivamais.model.Tarefa;
import br.com.cultiva.cultivamais.model.Usuario;
import br.com.cultiva.cultivamais.repository.TarefaRepository;
import br.com.cultiva.cultivamais.repository.UsuarioRepository;

@Service
public class TarefaService {

    @Autowired
    private TarefaRepository tarefaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private LogService logService;

    // Injeção para enviar notificações
    @Autowired
    private NotificacaoService notificacaoService;

    // --- CRIAR ---
    public Tarefa criarTarefa(Long idCriador, Long idResponsavel, Tarefa novaTarefa) {
        Usuario criador = usuarioRepository.findById(idCriador).orElse(null);
        Usuario responsavel = usuarioRepository.findById(idResponsavel).orElse(null);

        if (criador != null) {
            novaTarefa.setCriador(criador);
            // Se o responsável não for informado, define o próprio criador
            novaTarefa.setResponsavel(responsavel != null ? responsavel : criador);
            novaTarefa.setConcluida(false);
            novaTarefa.setCancelada(false); // Tarefa nasce ativa
            novaTarefa.setDataCriacao(LocalDateTime.now());

            Tarefa salva = tarefaRepository.save(novaTarefa);

            logService.registrarLog(criador.getNomeUsuario(),
                    "Criou a tarefa \"" + salva.getTitulo() + "\" para " + salva.getResponsavel().getNomeUsuario());

            // NOTIFICAÇÃO
            if (responsavel != null) {
                notificacaoService.criarNotificacao(
                        responsavel.getIdUsuario(),
                        "Nova Tarefa Atribuída",
                        "Você foi designado para: " + salva.getTitulo(),
                        "info"
                );
            }

            return salva;
        }
        return null;
    }

    // --- LISTAR TODAS (USADO PELO DASHBOARD) ---
    public List<Tarefa> listarTodas() {
        return tarefaRepository.findAll();
    }

    // --- LISTAR POR USUÁRIO (MANTIDA A HIERARQUIA) ---
    public List<Tarefa> listarTarefasPorUsuario(Long idUsuario, String funcao) {
        // Se for ADMIN, EMPRESA ou ADMINISTRADOR, vê tudo.
        if ("ADMIN".equalsIgnoreCase(funcao) || "EMPRESA".equalsIgnoreCase(funcao) || "ADMINISTRADOR".equalsIgnoreCase(funcao)) {
            return tarefaRepository.findAll();
        } else {
            // Busca tarefas onde ele é RESPONSÁVEL *OU* onde ele é o CRIADOR.
            return tarefaRepository.findByResponsavel_IdUsuarioOrCriador_IdUsuario(idUsuario, idUsuario);
        }
    }

    // --- ATUALIZAR (COM RESTRIÇÃO) ---
    public Tarefa atualizarTarefa(Long idTarefa, Tarefa dadosNovos, Long idUsuarioLogado) {
        Tarefa tarefa = tarefaRepository.findById(idTarefa).orElse(null);
        Usuario quemEditou = usuarioRepository.findById(idUsuarioLogado).orElse(null);

        if (tarefa != null && quemEditou != null) {

            // VERIFICAÇÃO DE PERMISSÃO: Só Criador ou Admin
            boolean isCriador = tarefa.getCriador().getIdUsuario().equals(idUsuarioLogado);
            boolean isAdmin = quemEditou.getFuncao().toString().contains("ADMIN") || quemEditou.getFuncao().toString().contains("EMPRESA");

            if (!isCriador && !isAdmin) {
                throw new RuntimeException("Permissão negada: Apenas o criador ou admin podem editar.");
            }

            String tituloAntigo = tarefa.getTitulo();

            // Atualiza campos
            tarefa.setTitulo(dadosNovos.getTitulo());
            tarefa.setDescricao(dadosNovos.getDescricao());
            tarefa.setPrioridade(dadosNovos.getPrioridade());
            tarefa.setCategoria(dadosNovos.getCategoria());
            tarefa.setDataPrazo(dadosNovos.getDataPrazo());

            // Reatribuição de responsável
            if (dadosNovos.getResponsavel() != null && dadosNovos.getResponsavel().getIdUsuario() != null) {
                Usuario novoResponsavel = usuarioRepository.findById(dadosNovos.getResponsavel().getIdUsuario()).orElse(null);

                // Se mudou o responsável, avisa o novo
                if (novoResponsavel != null && !novoResponsavel.equals(tarefa.getResponsavel())) {
                    tarefa.setResponsavel(novoResponsavel);

                    notificacaoService.criarNotificacao(
                            novoResponsavel.getIdUsuario(),
                            "Tarefa Transferida",
                            "A tarefa '" + tarefa.getTitulo() + "' foi repassada para você.",
                            "info"
                    );
                }
            }

            Tarefa salva = tarefaRepository.save(tarefa);

            logService.registrarLog(quemEditou.getNomeUsuario(),
                    "Editou a tarefa \"" + tituloAntigo + "\" (Agora: " + salva.getTitulo() + ")");

            return salva;
        }
        return null;
    }

    // --- CONCLUIR COM OBSERVAÇÃO ---
    public Tarefa concluirTarefa(Long idTarefa, Long idUsuarioLogado, String observacao) {
        Tarefa t = tarefaRepository.findById(idTarefa).orElse(null);
        Usuario quemFez = usuarioRepository.findById(idUsuarioLogado).orElse(null);

        if (t != null && quemFez != null) {
            boolean vaiConcluir = !t.isConcluida(); // Inverte o estado atual
            t.setConcluida(vaiConcluir);

            if (vaiConcluir) {
                // ESTÁ CONCLUINDO
                t.setDataConclusao(LocalDateTime.now());
                t.setObservacaoConclusao(observacao); // Salva o texto
                logService.registrarLog(quemFez.getNomeUsuario(), "Concluiu a tarefa \"" + t.getTitulo() + "\". Obs: " + observacao);

                // NOTIFICAÇÃO: Se quem fez não foi o criador, avisa o criador (Feedback de trabalho feito)
                if (!t.getCriador().getIdUsuario().equals(quemFez.getIdUsuario())) {
                    notificacaoService.criarNotificacao(
                            t.getCriador().getIdUsuario(),
                            "Tarefa Concluída",
                            quemFez.getNomeUsuario() + " finalizou: " + t.getTitulo(),
                            "sucesso"
                    );
                }

            } else {
                // ESTÁ REABRINDO
                t.setDataConclusao(null);
                t.setObservacaoConclusao(null); // Limpa a observação antiga
                logService.registrarLog(quemFez.getNomeUsuario(), "Reabriu a tarefa \"" + t.getTitulo() + "\"");
            }
            return tarefaRepository.save(t);
        }
        return null;
    }

    // --- CANCELAR ---
    public Tarefa cancelarTarefa(Long idTarefa, Long idUsuarioLogado) {
        Tarefa t = tarefaRepository.findById(idTarefa).orElse(null);
        Usuario quemCancelou = usuarioRepository.findById(idUsuarioLogado).orElse(null);

        if (t != null && quemCancelou != null) {
            // REGRA: Só Criador ou Admin
            boolean isCriador = t.getCriador().getIdUsuario().equals(idUsuarioLogado);
            boolean isAdmin = quemCancelou.getFuncao().toString().contains("ADMIN") || quemCancelou.getFuncao().toString().contains("EMPRESA");

            if (isCriador || isAdmin) {
                t.setCancelada(true);
                t.setConcluida(false); // Garante que não conte como concluída

                logService.registrarLog(quemCancelou.getNomeUsuario(), "Cancelou a tarefa \"" + t.getTitulo() + "\"");

                // NOTIFICAÇÃO: Avisa o responsável que a tarefa foi cancelada
                if (!t.getResponsavel().getIdUsuario().equals(quemCancelou.getIdUsuario())) {
                    notificacaoService.criarNotificacao(
                            t.getResponsavel().getIdUsuario(),
                            "Tarefa Cancelada",
                            "A tarefa '" + t.getTitulo() + "' foi cancelada pelo gestor.",
                            "alerta"
                    );
                }

                return tarefaRepository.save(t);
            }
        }
        return null; // Retorna null se não tiver permissão
    }

    // --- EXCLUIR ---
    public boolean excluirTarefa(Long idTarefa, Long idUsuarioLogado) {
        Tarefa t = tarefaRepository.findById(idTarefa).orElse(null);
        Usuario quemExclui = usuarioRepository.findById(idUsuarioLogado).orElse(null);

        if (t != null && quemExclui != null) {
            // REGRA: Só Criador ou Admin
            boolean isCriador = t.getCriador().getIdUsuario().equals(idUsuarioLogado);
            boolean isAdmin = quemExclui.getFuncao().toString().contains("ADMIN") || quemExclui.getFuncao().toString().contains("EMPRESA");

            if (isCriador || isAdmin) {
                String titulo = t.getTitulo();
                tarefaRepository.deleteById(idTarefa);
                logService.registrarLog(quemExclui.getNomeUsuario(), "Excluiu a tarefa \"" + titulo + "\"");
                return true;
            }
        }
        return false;
    }

    // --- AUTOMAÇÃO (CRON) ---
    // Executa todo dia às 08:00 AM para verificar atrasos
    @Scheduled(cron = "0 0 8 * * *")
    public void verificarTarefasAtrasadas() {
        System.out.println(">>> Verificando tarefas atrasadas...");

        List<Tarefa> tarefas = tarefaRepository.findAll();
        LocalDate hoje = LocalDate.now();

        for (Tarefa t : tarefas) {
            if (t.isConcluida() || t.isCancelada()) continue;

            if (t.getDataPrazo() != null && t.getDataPrazo().toLocalDate().isBefore(hoje)) {

                // NOTIFICAÇÃO DE COBRANÇA
                notificacaoService.criarNotificacao(
                        t.getResponsavel().getIdUsuario(),
                        "Tarefa Atrasada",
                        "Atenção: A tarefa '" + t.getTitulo() + "' venceu em " + t.getDataPrazo(),
                        "erro" // Vermelho
                );
            }
        }
    }
}