package ec.mil.dsndft.servicio_gestion.repository;

import ec.mil.dsndft.servicio_gestion.entity.SeguimientoPsicologico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface SeguimientoPsicologicoRepository extends JpaRepository<SeguimientoPsicologico, Long> {
		@Query("SELECT s FROM SeguimientoPsicologico s " +
					 "WHERE (:fichaId IS NULL OR s.fichaPsicologica.id = :fichaId) " +
					 "AND (:psicologoId IS NULL OR s.psicologo.id = :psicologoId) " +
					 "AND (:personalMilitarId IS NULL OR s.fichaPsicologica.personalMilitar.id = :personalMilitarId) " +
					 "AND (:fechaDesde IS NULL OR s.fechaSeguimiento >= :fechaDesde) " +
					 "AND (:fechaHasta IS NULL OR s.fechaSeguimiento <= :fechaHasta) " +
					 "ORDER BY s.fechaSeguimiento DESC, s.id DESC")
		List<SeguimientoPsicologico> findByFilters(@Param("fichaId") Long fichaId,
																							 @Param("psicologoId") Long psicologoId,
																							 @Param("personalMilitarId") Long personalMilitarId,
																							 @Param("fechaDesde") LocalDate fechaDesde,
																							 @Param("fechaHasta") LocalDate fechaHasta);

		List<SeguimientoPsicologico> findByFichaPsicologicaIdOrderByFechaSeguimientoAsc(Long fichaPsicologicaId);

					long countByFichaPsicologicaId(Long fichaPsicologicaId);

		Optional<SeguimientoPsicologico> findTopByFichaPsicologicaIdOrderByFechaSeguimientoDescIdDesc(Long fichaPsicologicaId);
}