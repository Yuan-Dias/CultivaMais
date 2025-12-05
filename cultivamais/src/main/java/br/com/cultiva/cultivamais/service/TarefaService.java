package br.com.cultiva.cultivamais.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import br.com.cultiva.cultivamais.exception.ResourceNotFoundException;
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

    public List<Tarefa> listarTodas() {
        return tarefaRepository.findAll();
    }

    public Tarefa criarTarefa(@NonNull Tarefa tarefa, Long idResponsavel) {
        // Se um ID de responsável for passado, verificamos se o usuário existe
        if (idResponsavel != null) {
            Usuario usuario = usuarioRepository.findById(idResponsavel)
                .orElseThrow(() -> new ResourceNotFoundException("Erro ao criar tarefa: Usuário responsável com ID " + idResponsavel + " não encontrado."));
            
            tarefa.setResponsavel(usuario);
        }
        return tarefaRepository.save(tarefa);
    }
    
    public void excluir(@NonNull Long id) {
        if (!tarefaRepository.existsById(id)) {
            throw new ResourceNotFoundException("Tarefa não encontrada para exclusão com ID: " + id);
        }
        tarefaRepository.deleteById(id);
    }

    public Tarefa alternarConclusao(@NonNull Long id) {
        return tarefaRepository.findById(id)
            .map(tarefa -> {
                tarefa.setConcluida(!tarefa.isConcluida());
                return tarefaRepository.save(tarefa);
            })
            .orElseThrow(() -> new ResourceNotFoundException("Tarefa não encontrada com ID: " + id));
    }
}