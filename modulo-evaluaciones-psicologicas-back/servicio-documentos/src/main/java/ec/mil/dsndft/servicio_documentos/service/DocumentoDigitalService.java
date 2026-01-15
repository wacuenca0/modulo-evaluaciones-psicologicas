package ec.mil.dsndft.servicio_documentos.service;

import ec.mil.dsndft.servicio_documentos.dto.DocumentoDigitalDetalleDto;
import ec.mil.dsndft.servicio_documentos.dto.DocumentoDigitalRespuestaDto;
import ec.mil.dsndft.servicio_documentos.dto.DocumentoDigitalResumenDto;
import ec.mil.dsndft.servicio_documentos.dto.DocumentoDigitalSolicitudDto;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface DocumentoDigitalService {

    DocumentoDigitalRespuestaDto crear(DocumentoDigitalSolicitudDto solicitud);

    DocumentoDigitalRespuestaDto actualizar(Long documentoId, DocumentoDigitalSolicitudDto solicitud);

    void eliminarLogicamente(Long documentoId);

    DocumentoDigitalDetalleDto obtenerPorId(Long documentoId);

    Page<DocumentoDigitalResumenDto> listarPorTipo(String nombreTipoDocumento, Pageable pageable);

    List<DocumentoDigitalResumenDto> listarActivos();

    List<DocumentoDigitalResumenDto> listarPorFicha(Long fichaPsicologicaId);
}
