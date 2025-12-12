package ec.mil.dsndft.servicio_documentos.repository;

import ec.mil.dsndft.servicio_documentos.entity.DocumentoFicha;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentoFichaRepository extends JpaRepository<DocumentoFicha, Long> {
    List<DocumentoFicha> findByFichaIdAndActivoTrue(Long fichaId);
}
