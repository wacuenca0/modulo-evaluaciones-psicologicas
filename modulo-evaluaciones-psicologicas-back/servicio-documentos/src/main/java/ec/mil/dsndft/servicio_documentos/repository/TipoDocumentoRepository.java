package ec.mil.dsndft.servicio_documentos.repository;

import ec.mil.dsndft.servicio_documentos.entity.TipoDocumento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TipoDocumentoRepository extends JpaRepository<TipoDocumento, Long> {
    Optional<TipoDocumento> findByNombreIgnoreCase(String nombre);
}
