package br.com.cultiva.cultivamais.repository;

import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import br.com.cultiva.cultivamais.model.AreaCultivo;

@Repository
public interface AreaCultivoRepository extends JpaRepository<AreaCultivo, Long> {
    
}
