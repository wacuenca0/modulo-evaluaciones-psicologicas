package ec.mil.dsndft.servicio_documentos.repository;

import ec.mil.dsndft.servicio_documentos.entity.DocumentoDigital;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DocumentoDigitalRepository extends JpaRepository<DocumentoDigital, Long> {

    Page<DocumentoDigital> findByTipoDocumentoNombreIgnoreCase(String nombreTipoDocumento, Pageable pageable);

    List<DocumentoDigital> findByActivoTrue();

    List<DocumentoDigital> findByFichaPsicologicaIdAndActivoTrueOrderByCreatedAtDesc(Long fichaPsicologicaId);

    List<DocumentoDigital> findByReferenciaExternaAndActivoTrue(String referenciaExterna);

    List<DocumentoDigital> findByOrigenModuloAndActivoTrue(String origenModulo);

    Optional<DocumentoDigital> findByChecksum(String checksum);
}
