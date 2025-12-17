package br.com.cultiva.cultivamais.repository;

import br.com.cultiva.cultivamais.model.LogSistema;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LogRepository extends JpaRepository<LogSistema, Long> {
    // Este nome precisa ser EXATO, senão o Spring lança erro 500
    List<LogSistema> findAllByOrderByDataHoraDesc();
}