package ec.mil.dsndft.servicio_gestion.repository;

import ec.mil.dsndft.servicio_gestion.entity.CatalogoDiagnosticoCie10;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CatalogoDiagnosticoCie10Repository extends JpaRepository<CatalogoDiagnosticoCie10, Long> {

    Optional<CatalogoDiagnosticoCie10> findByIdAndActivoTrue(Long id);

    Optional<CatalogoDiagnosticoCie10> findByCodigoIgnoreCase(String codigo);

    List<CatalogoDiagnosticoCie10> findByActivoTrueOrderByCodigoAsc();

    @Query("SELECT c FROM CatalogoDiagnosticoCie10 c "
        + "WHERE c.activo = true "
        + "AND (" 
        + "    (:term IS NULL) "
        + "    OR LOWER(c.codigo) LIKE CONCAT('%', CONCAT(LOWER(:term), '%')) "
        + "    OR LOWER(c.nombre) LIKE CONCAT('%', CONCAT(LOWER(:term), '%')) "
        + "    OR LOWER(COALESCE(c.descripcion, '')) LIKE CONCAT('%', CONCAT(LOWER(:term), '%'))"
        + ") "
        + "ORDER BY c.codigo ASC")
    List<CatalogoDiagnosticoCie10> searchActivos(@Param("term") String term);
}
