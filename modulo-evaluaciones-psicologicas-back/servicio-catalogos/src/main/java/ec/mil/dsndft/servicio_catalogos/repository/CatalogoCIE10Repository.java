package ec.mil.dsndft.servicio_catalogos.repository;

import ec.mil.dsndft.servicio_catalogos.entity.CatalogoCIE10;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CatalogoCIE10Repository extends JpaRepository<CatalogoCIE10, Long> {
	boolean existsByCodigoIgnoreCase(String codigo);

	Optional<CatalogoCIE10> findByCodigoIgnoreCase(String codigo);

	List<CatalogoCIE10> findByActivoTrueOrderByCodigoAsc();
}