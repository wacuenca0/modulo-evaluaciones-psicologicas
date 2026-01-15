package ec.mil.dsndft.servicio_gestion.repository;

import ec.mil.dsndft.servicio_gestion.entity.Psicologo;
import ec.mil.dsndft.servicio_gestion.model.dto.reportes.ReporteAtencionPsicologoDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface PsicologoRepository extends JpaRepository<Psicologo, Long> {

	Optional<Psicologo> findByUsernameIgnoreCase(String username);

	Optional<Psicologo> findByCedula(String cedula);

	List<Psicologo> findByActivoTrueOrderByApellidosNombresAsc();

    @Query("SELECT new ec.mil.dsndft.servicio_gestion.model.dto.reportes.ReporteAtencionPsicologoDTO(" +
	    "p.id, " +
	    "p.apellidosNombres, " +
	    "p.username, " +
	    "p.unidadMilitar, " +
	    "COUNT(DISTINCT f.id), " +
	    "COALESCE(SUM(CASE WHEN UPPER(f.estado) = 'ACTIVA' THEN 1 ELSE 0 END), 0), " +
	    "COALESCE(SUM(CASE WHEN UPPER(f.estado) = 'OBSERVACION' THEN 1 ELSE 0 END), 0), " +
	    "COUNT(DISTINCT s.id), " +
	    "COUNT(DISTINCT CASE WHEN f.id IS NOT NULL THEN f.personalMilitar.id ELSE NULL END), " +
	    "MAX(COALESCE(s.fechaSeguimiento, f.fechaEvaluacion))" +
	    ") " +
	    "FROM Psicologo p " +
	    "LEFT JOIN FichaPsicologica f ON f.psicologo.id = p.id " +
	    "  AND (:fechaDesde IS NULL OR f.fechaEvaluacion >= :fechaDesde) " +
	    "  AND (:fechaHasta IS NULL OR f.fechaEvaluacion <= :fechaHasta) " +
		"  AND (:diagnosticoId IS NULL OR (f.diagnosticoCie10Catalogo IS NOT NULL AND f.diagnosticoCie10Catalogo.id = :diagnosticoId)) " +
	    "  AND (:cedula IS NULL OR (f.personalMilitar.cedula IS NOT NULL AND UPPER(f.personalMilitar.cedula) = UPPER(:cedula))) " +
	    "LEFT JOIN SeguimientoPsicologico s ON s.fichaPsicologica = f " +
	    "  AND (:fechaDesde IS NULL OR s.fechaSeguimiento >= :fechaDesde) " +
	    "  AND (:fechaHasta IS NULL OR s.fechaSeguimiento <= :fechaHasta) " +
	    "WHERE p.activo = true " +
	    "AND (:psicologoId IS NULL OR p.id = :psicologoId) " +
	    "AND (:unidadMilitar IS NULL OR (p.unidadMilitar IS NOT NULL AND UPPER(p.unidadMilitar) = UPPER(:unidadMilitar))) " +
	    "GROUP BY p.id, p.apellidosNombres, p.username, p.unidadMilitar " +
	    "ORDER BY p.apellidosNombres ASC")
    List<ReporteAtencionPsicologoDTO> obtenerReporteAtenciones(@Param("psicologoId") Long psicologoId,
										@Param("fechaDesde") LocalDate fechaDesde,
										@Param("fechaHasta") LocalDate fechaHasta,
					@Param("diagnosticoId") Long diagnosticoId,
					@Param("cedula") String cedula,
					@Param("unidadMilitar") String unidadMilitar);
}