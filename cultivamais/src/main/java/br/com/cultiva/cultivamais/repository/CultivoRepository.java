package br.com.cultiva.cultivamais.repository;

import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import br.com.cultiva.cultivamais.model.Cultivo;

@Repository
public interface CultivoRepository extends JpaRepository<Cultivo, Long> {
    
}
