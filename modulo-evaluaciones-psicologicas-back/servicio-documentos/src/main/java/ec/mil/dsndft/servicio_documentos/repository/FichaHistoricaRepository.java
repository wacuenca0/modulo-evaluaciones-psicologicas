package ec.mil.dsndft.servicio_documentos.repository;

import ec.mil.dsndft.servicio_documentos.entity.FichaHistorica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FichaHistoricaRepository extends JpaRepository<FichaHistorica, Long> {
    List<FichaHistorica> findByDatosIdentificacionNumeroCedulaOrderByFechaEvaluacionDesc(String numeroCedula);
}
