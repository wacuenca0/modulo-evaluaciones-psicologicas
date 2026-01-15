package ec.mil.dsndft.servicio_gestion.repository;

import ec.mil.dsndft.servicio_gestion.entity.FichaHistorica;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FichaHistoricaRepository extends JpaRepository<FichaHistorica, Long> {
    List<FichaHistorica> findByNumeroCedulaOrderByFechaEvaluacionDesc(String numeroCedula);
}
