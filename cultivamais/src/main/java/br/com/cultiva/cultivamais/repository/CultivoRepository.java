package br.com.cultiva.cultivamais.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import br.com.cultiva.cultivamais.model.Cultivo;

@Repository
public interface CultivoRepository extends JpaRepository<Cultivo, Long> {

    @Query("SELECT COALESCE(SUM(c.quantidadeColhida), 0.0) FROM Cultivo c WHERE c.areaCultivo.idArea = :idArea")
    Double sumQuantidadeColhidaByArea(@Param("idArea") Long idArea);
}