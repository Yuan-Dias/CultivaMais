package br.com.cultiva.cultivamais.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import br.com.cultiva.cultivamais.model.Tarefa;

@Repository
public interface TarefaRepository extends JpaRepository<Tarefa, Long> {

    List<Tarefa> findByResponsavelIdUsuario(Long idUsuario);

    List<Tarefa> findByResponsavel_IdUsuarioOrCriador_IdUsuario(Long idResponsavel, Long idCriador);
}