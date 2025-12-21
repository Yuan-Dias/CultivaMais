package br.com.cultiva.cultivamais.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import br.com.cultiva.cultivamais.model.Tarefa;

@Repository
public interface TarefaRepository extends JpaRepository<Tarefa, Long> {

    // Spring Data JPA entende automaticamente:
    // "Busque na tabela Tarefa, onde o campo 'responsavel' tenha o 'idUsuario' igual ao parâmetro"
    List<Tarefa> findByResponsavelIdUsuario(Long idUsuario);
}