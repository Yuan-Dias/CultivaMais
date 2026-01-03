package br.com.cultiva.cultivamais.repository;

import br.com.cultiva.cultivamais.model.LogSistema;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LogRepository extends JpaRepository<LogSistema, Long> {
    List<LogSistema> findAllByOrderByDataHoraDesc();
}