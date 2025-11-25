package br.com.cultiva.cultivamais.repository;

import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import br.com.cultiva.cultivamais.model.Planta;

@Repository
public interface PlantaRepository extends JpaRepository<Planta, Long> {
    
}
