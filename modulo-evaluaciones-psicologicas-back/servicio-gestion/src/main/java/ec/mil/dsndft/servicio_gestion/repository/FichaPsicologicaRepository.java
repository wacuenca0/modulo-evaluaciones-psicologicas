package ec.mil.dsndft.servicio_gestion.repository;

import ec.mil.dsndft.servicio_gestion.entity.FichaPsicologica;
import ec.mil.dsndft.servicio_gestion.model.enums.EstadoFichaEnum;
import ec.mil.dsndft.servicio_gestion.model.dto.reportes.ReportePersonalObservacionDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface FichaPsicologicaRepository extends JpaRepository<FichaPsicologica, Long> {

	@Query("SELECT f FROM FichaPsicologica f " +
	"WHERE (:psicologoId IS NULL OR f.psicologo.id = :psicologoId) " +
	"AND (:personalMilitarId IS NULL OR f.personalMilitar.id = :personalMilitarId) " +
	"AND (:estado IS NULL OR f.estado = :estado) " +
	"AND (:condicionClinica IS NULL OR f.condicionClinica = :condicionClinica) " +
	"AND (:soloActivas IS NULL OR (:soloActivas = TRUE AND f.estado = ec.mil.dsndft.servicio_gestion.model.enums.EstadoFichaEnum.ACTIVA)) " +
	"ORDER BY f.fechaEvaluacion DESC, f.createdAt DESC")
    List<FichaPsicologica> findByFilters(@Param("psicologoId") Long psicologoId,
				  @Param("personalMilitarId") Long personalMilitarId,
				  @Param("estado") EstadoFichaEnum estado,
				  @Param("condicionClinica") ec.mil.dsndft.servicio_gestion.model.enums.CondicionClinicaEnum condicionClinica,
				  @Param("soloActivas") Boolean soloActivas);

    @Query("SELECT new ec.mil.dsndft.servicio_gestion.model.dto.reportes.ReportePersonalObservacionDTO(" +
	    "f.id, " +
	    "f.personalMilitar.id, " +
	    "f.personalMilitar.apellidosNombres, " +
	    "f.personalMilitar.cedula, " +
	    "f.psicologo.id, " +
	    "f.psicologo.apellidosNombres, " +
	    "f.fechaEvaluacion, " +
	    "f.estado, " +
	    "f.condicionClinica, " +
	    "MAX(COALESCE(s.fechaSeguimiento, f.fechaEvaluacion))" +
	    ") " +
	    "FROM FichaPsicologica f " +
	    "LEFT JOIN SeguimientoPsicologico s ON s.fichaPsicologica = f " +
	    "WHERE f.estado = ec.mil.dsndft.servicio_gestion.model.enums.EstadoFichaEnum.OBSERVACION " +
	    "  AND (:psicologoId IS NULL OR f.psicologo.id = :psicologoId) " +
	    "  AND (:fechaDesde IS NULL OR f.fechaEvaluacion >= :fechaDesde) " +
	    "  AND (:fechaHasta IS NULL OR f.fechaEvaluacion <= :fechaHasta) " +
	    "GROUP BY f.id, f.personalMilitar.id, f.personalMilitar.apellidosNombres, f.personalMilitar.cedula, " +
	    "         f.psicologo.id, f.psicologo.apellidosNombres, f.fechaEvaluacion, f.estado, f.condicionClinica " +
	    "ORDER BY MAX(COALESCE(s.fechaSeguimiento, f.fechaEvaluacion)) DESC")
    List<ReportePersonalObservacionDTO> obtenerPersonalEnObservacion(@Param("psicologoId") Long psicologoId,
									      @Param("fechaDesde") LocalDate fechaDesde,
									      @Param("fechaHasta") LocalDate fechaHasta);

    @Query("SELECT " +
	    "COUNT(f), " +
	    "COUNT(DISTINCT f.personalMilitar.id), " +
	    "COALESCE(SUM(CASE WHEN f.estado = ec.mil.dsndft.servicio_gestion.model.enums.EstadoFichaEnum.ACTIVA THEN 1 ELSE 0 END), 0), " +
	    "COALESCE(SUM(CASE WHEN f.estado = ec.mil.dsndft.servicio_gestion.model.enums.EstadoFichaEnum.OBSERVACION THEN 1 ELSE 0 END), 0), " +
	    "COALESCE(SUM(CASE WHEN f.seccionInfancia.discapacidadIntelectual = TRUE THEN 1 ELSE 0 END), 0), " +
	    "COALESCE(SUM(CASE WHEN f.seccionInfancia.trastornos IS NOT NULL AND f.seccionInfancia.trastornos <> '' THEN 1 ELSE 0 END), 0), " +
	    "COALESCE(SUM(CASE WHEN f.seccionInfancia.tratamientosPsicologicosPsiquiatricos = TRUE THEN 1 ELSE 0 END), 0) " +
	    "FROM FichaPsicologica f " +
	    "WHERE (:fechaDesde IS NULL OR f.fechaEvaluacion >= :fechaDesde) " +
	    "  AND (:fechaHasta IS NULL OR f.fechaEvaluacion <= :fechaHasta)")
    Object[] obtenerIndicadoresEpidemiologicos(@Param("fechaDesde") LocalDate fechaDesde,
						     @Param("fechaHasta") LocalDate fechaHasta);

    @Query("SELECT UPPER(p.sexo), COUNT(f) " +
	    "FROM FichaPsicologica f " +
	    "JOIN f.personalMilitar p " +
	    "WHERE (:fechaDesde IS NULL OR f.fechaEvaluacion >= :fechaDesde) " +
	    "  AND (:fechaHasta IS NULL OR f.fechaEvaluacion <= :fechaHasta) " +
	    "GROUP BY UPPER(p.sexo)")
    List<Object[]> obtenerDistribucionPorSexo(@Param("fechaDesde") LocalDate fechaDesde,
						    @Param("fechaHasta") LocalDate fechaHasta);

    @Query("SELECT f.estado, COUNT(f) " +
	    "FROM FichaPsicologica f " +
	    "WHERE (:fechaDesde IS NULL OR f.fechaEvaluacion >= :fechaDesde) " +
	    "  AND (:fechaHasta IS NULL OR f.fechaEvaluacion <= :fechaHasta) " +
	    "GROUP BY f.estado")
    List<Object[]> obtenerDistribucionPorEstado(@Param("fechaDesde") LocalDate fechaDesde,
		      @Param("fechaHasta") LocalDate fechaHasta);

    List<FichaPsicologica> findByPersonalMilitarIdOrderByFechaEvaluacionDesc(Long personalMilitarId);

	boolean existsByNumeroEvaluacion(String numeroEvaluacion);

	java.util.Optional<FichaPsicologica> findByNumeroEvaluacion(String numeroEvaluacion);
}