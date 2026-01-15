package ec.mil.dsndft.servicio_gestion.repository;

import ec.mil.dsndft.servicio_gestion.entity.FichaPsicologica;
import ec.mil.dsndft.servicio_gestion.model.dto.reportes.ReporteSeguimientoTransferenciaDTO;
import ec.mil.dsndft.servicio_gestion.model.enums.EstadoFichaEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

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

	    @Query("SELECT new ec.mil.dsndft.servicio_gestion.model.dto.reportes.ReporteSeguimientoTransferenciaDTO(" +
		    "f.personalMilitar.id, " +
		    "f.personalMilitar.apellidosNombres, " +
		    "f.personalMilitar.cedula, " +
		    "f.id, " +
		    "f.numeroEvaluacion, " +
		    "f.condicionClinica, " +
		    "f.psicologo.id, " +
		    "f.psicologo.apellidosNombres, " +
		    "f.psicologo.unidadMilitar, " +
		    "COUNT(DISTINCT s.id), " +
	    "MAX(COALESCE(s.fechaSeguimiento, f.fechaEvaluacion)), " +
	    "f.fechaEvaluacion, " +
	    "f.transferenciaInfo.unidadDestino, " +
	    "FUNCTION('DBMS_LOB.SUBSTR', f.transferenciaInfo.observacion, 4000, 1), " +
	    "f.transferenciaInfo.fechaTransferencia, " +
	    "f.proximoSeguimiento" +
		    ") " +
		    "FROM FichaPsicologica f " +
		    "LEFT JOIN SeguimientoPsicologico s ON s.fichaPsicologica = f " +
		    "WHERE f.condicionClinica IN (ec.mil.dsndft.servicio_gestion.model.enums.CondicionClinicaEnum.SEGUIMIENTO, ec.mil.dsndft.servicio_gestion.model.enums.CondicionClinicaEnum.TRANSFERENCIA) " +
		    "  AND (:psicologoId IS NULL OR f.psicologo.id = :psicologoId) " +
		    "  AND (:fechaDesde IS NULL OR f.fechaEvaluacion >= :fechaDesde) " +
		    "  AND (:fechaHasta IS NULL OR f.fechaEvaluacion <= :fechaHasta) " +
		    "  AND (:cedula IS NULL OR (f.personalMilitar.cedula IS NOT NULL AND UPPER(f.personalMilitar.cedula) = UPPER(:cedula))) " +
		    "  AND (:unidadMilitar IS NULL OR (f.psicologo.unidadMilitar IS NOT NULL AND UPPER(f.psicologo.unidadMilitar) = UPPER(:unidadMilitar))) " +
		    "GROUP BY f.personalMilitar.id, f.personalMilitar.apellidosNombres, f.personalMilitar.cedula, " +
		    "         f.id, f.numeroEvaluacion, f.condicionClinica, f.psicologo.id, f.psicologo.apellidosNombres, f.psicologo.unidadMilitar, f.fechaEvaluacion, " +
		    "         f.transferenciaInfo.unidadDestino, FUNCTION('DBMS_LOB.SUBSTR', f.transferenciaInfo.observacion, 4000, 1), f.transferenciaInfo.fechaTransferencia, f.proximoSeguimiento " +
		    "ORDER BY f.psicologo.apellidosNombres ASC, f.personalMilitar.apellidosNombres ASC")
	    List<ReporteSeguimientoTransferenciaDTO> obtenerSeguimientoOTransferencia(@Param("psicologoId") Long psicologoId,
								     @Param("fechaDesde") LocalDate fechaDesde,
								     @Param("fechaHasta") LocalDate fechaHasta,
						     @Param("cedula") String cedula,
								     @Param("unidadMilitar") String unidadMilitar);

	    @Query("SELECT new ec.mil.dsndft.servicio_gestion.model.dto.reportes.ReportePersonalDiagnosticoDTO(" +
	    "pm.id, " +
	    "pm.cedula, " +
	    "pm.apellidosNombres, " +
	    "pm.tipoPersona, " +
	    "pm.esMilitar, " +
	    "pm.grado, " +
	    "pm.unidadMilitar, " +
	    "f.numeroEvaluacion, " +
		"f.fechaEvaluacion, " +
		"f.diagnosticoCie10.codigo, " +
		"f.diagnosticoCie10.nombre, " +
		"f.diagnosticoCie10.categoriaPadre, " +
		"f.diagnosticoCie10.nivel, " +
		"f.diagnosticoCie10.descripcion, " +
	    "psi.id, " +
	    "psi.apellidosNombres, " +
	    "psi.unidadMilitar" +
	    ") " +
	    "FROM FichaPsicologica f " +
	    "JOIN f.personalMilitar pm " +
	    "LEFT JOIN f.psicologo psi " +
	    "WHERE pm.activo = true " +
	    "  AND pm.tipoPersona IN ('Militar', 'Dependiente') " +
	    "  AND (:fechaDesde IS NULL OR f.fechaEvaluacion >= :fechaDesde) " +
	    "  AND (:fechaHasta IS NULL OR f.fechaEvaluacion <= :fechaHasta) " +
		"  AND (:diagnosticoId IS NULL OR (f.diagnosticoCie10Catalogo IS NOT NULL AND f.diagnosticoCie10Catalogo.id = :diagnosticoId)) " +
	    "  AND (:cedula IS NULL OR (pm.cedula IS NOT NULL AND UPPER(pm.cedula) = UPPER(:cedula))) " +
	    "  AND (:grado IS NULL OR (pm.grado IS NOT NULL AND UPPER(pm.grado) = UPPER(:grado))) " +
	    "  AND (:unidadMilitar IS NULL OR (pm.unidadMilitar IS NOT NULL AND UPPER(pm.unidadMilitar) = UPPER(:unidadMilitar))) " +
	    "ORDER BY pm.apellidosNombres ASC, f.fechaEvaluacion DESC, f.numeroEvaluacion ASC")
	    List<ec.mil.dsndft.servicio_gestion.model.dto.reportes.ReportePersonalDiagnosticoDTO> obtenerReportePersonalDiagnostico(@Param("fechaDesde") LocalDate fechaDesde,
							     @Param("fechaHasta") LocalDate fechaHasta,
						 @Param("diagnosticoId") Long diagnosticoId,
						 @Param("cedula") String cedula,
							     @Param("grado") String grado,
							     @Param("unidadMilitar") String unidadMilitar);

    List<FichaPsicologica> findByPersonalMilitarIdOrderByFechaEvaluacionDesc(Long personalMilitarId);

	boolean existsByNumeroEvaluacion(String numeroEvaluacion);

	Optional<FichaPsicologica> findByNumeroEvaluacion(String numeroEvaluacion);
}