package br.com.cultiva.cultivamais.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

// Usar exceção padrão do Jakarta/JPA para evitar erro de classe não encontrada
import jakarta.persistence.EntityNotFoundException;

import br.com.cultiva.cultivamais.model.LogSistema;
import br.com.cultiva.cultivamais.model.Tarefa;
import br.com.cultiva.cultivamais.model.Usuario;
import br.com.cultiva.cultivamais.repository.LogRepository;
import br.com.cultiva.cultivamais.repository.TarefaRepository;
import br.com.cultiva.cultivamais.repository.UsuarioRepository;

@Service
public class TarefaService {

    @Autowired private TarefaRepository tarefaRepository;
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private LogRepository logRepository;

    public List<Tarefa> listarTodas() {
        return tarefaRepository.findAll();
    }

    public Tarefa criarTarefa(@NonNull Tarefa tarefa, Long idResponsavel) {
        String responsavelNome = "Sem responsável";

        // Lógica de vincular responsável
        if (idResponsavel != null) {
            Usuario usuario = usuarioRepository.findById(idResponsavel)
                    .orElseThrow(() -> new EntityNotFoundException("Erro ao criar tarefa: Usuário responsável não encontrado."));
            tarefa.setResponsavel(usuario);
            responsavelNome = usuario.getNomeUsuario();
        }

        // Salva a tarefa
        Tarefa salva = tarefaRepository.save(tarefa);

        // Grava o Log
        try {
            logRepository.save(new LogSistema("Sistema", "Criou tarefa '" + salva.getTitulo() + "' atribuída a: " + responsavelNome));
        } catch (Exception e) {
            System.err.println("Erro ao salvar log: " + e.getMessage()); // Evita travar se o log falhar
        }

        return salva;
    }

    public void excluir(@NonNull Long id) {
        if (!tarefaRepository.existsById(id)) {
            throw new EntityNotFoundException("Tarefa não encontrada para exclusão com ID: " + id);
        }
        tarefaRepository.deleteById(id);

        // Log simples
        try {
            logRepository.save(new LogSistema("Sistema", "Excluiu tarefa ID: " + id));
        } catch (Exception e) {
            System.err.println("Erro log exclusão: " + e.getMessage());
        }
    }

    public Tarefa alternarConclusao(@NonNull Long id) {
        Tarefa tarefa = tarefaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Tarefa não encontrada com ID: " + id));

        boolean novoStatus = !tarefa.isConcluida();
        tarefa.setConcluida(novoStatus);
        Tarefa salva = tarefaRepository.save(tarefa);

        String statusMsg = novoStatus ? "CONCLUÍDA" : "PENDENTE";

        // Log de alteração
        try {
            logRepository.save(new LogSistema("Sistema", "Alterou status da tarefa '" + tarefa.getTitulo() + "' para " + statusMsg));
        } catch (Exception e) {
            System.err.println("Erro log alteração: " + e.getMessage());
        }

        return salva;
    }
}