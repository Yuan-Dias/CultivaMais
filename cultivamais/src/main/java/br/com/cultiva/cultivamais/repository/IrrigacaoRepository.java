package br.com.cultiva.cultivamais.repository;

import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import br.com.cultiva.cultivamais.model.Irrigacao;

@Repository
public interface IrrigacaoRepository extends JpaRepository<Irrigacao, Long> {
    
}
