package br.com.cultiva.cultivamais.repository;

import br.com.cultiva.cultivamais.model.LogSistema;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LogRepository extends JpaRepository<LogSistema, Long> {
    // Busca logs ordenando do mais recente para o mais antigo
    List<LogSistema> findAllByOrderByDataHoraDesc();
}