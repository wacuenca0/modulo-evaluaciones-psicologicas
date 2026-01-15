package ec.mil.dsndft.servicio_documentos.service.impl;

import ec.mil.dsndft.servicio_documentos.dto.DocumentoDigitalDetalleDto;
import ec.mil.dsndft.servicio_documentos.dto.DocumentoDigitalRespuestaDto;
import ec.mil.dsndft.servicio_documentos.dto.DocumentoDigitalResumenDto;
import ec.mil.dsndft.servicio_documentos.dto.DocumentoDigitalSolicitudDto;
import ec.mil.dsndft.servicio_documentos.entity.DocumentoDigital;
import ec.mil.dsndft.servicio_documentos.entity.TipoDocumento;
import ec.mil.dsndft.servicio_documentos.repository.DocumentoDigitalRepository;
import ec.mil.dsndft.servicio_documentos.repository.TipoDocumentoRepository;
import ec.mil.dsndft.servicio_documentos.service.DocumentoDigitalService;
import ec.mil.dsndft.servicio_documentos.service.mapper.DocumentoDigitalMapper;
import ec.mil.dsndft.servicio_documentos.service.storage.DocumentoStorageService;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class DocumentoDigitalServiceImpl implements DocumentoDigitalService {

    private final DocumentoDigitalRepository documentoDigitalRepository;
    private final TipoDocumentoRepository tipoDocumentoRepository;
    private final DocumentoStorageService storageService;

    @Override
    public DocumentoDigitalRespuestaDto crear(DocumentoDigitalSolicitudDto solicitud) {
        TipoDocumento tipoDocumento = obtenerTipoDocumento(solicitud.getNombreTipoDocumento());
        if (solicitud.getChecksum() != null) {
            documentoDigitalRepository.findByChecksum(solicitud.getChecksum())
                    .ifPresent(doc -> {
                        throw new IllegalStateException("Ya existe un documento con el mismo checksum");
                    });
        }
        DocumentoDigital entidad = DocumentoDigitalMapper.fromSolicitud(solicitud, tipoDocumento);
        DocumentoStorageService.StorageLocation ubicacion = storageService.prepararUbicacion(
            solicitud.getFichaPsicologicaId(), solicitud.getNombreOriginal());
        entidad.setRutaAlmacenamiento(ubicacion.rutaAbsoluta().toString());
        entidad.setRutaRelativa(ubicacion.rutaRelativa().toString());
        DocumentoDigital guardado = documentoDigitalRepository.save(entidad);
        return DocumentoDigitalMapper.toRespuestaDto(guardado);
    }

    @Override
    public DocumentoDigitalRespuestaDto actualizar(Long documentoId, DocumentoDigitalSolicitudDto solicitud) {
        DocumentoDigital entidad = obtenerDocumento(documentoId);
        TipoDocumento tipoDocumento = obtenerTipoDocumento(solicitud.getNombreTipoDocumento());
        Long fichaAnterior = entidad.getFichaPsicologicaId();
        String nombreAnterior = entidad.getNombreOriginal();
        DocumentoDigitalMapper.actualizarEntidad(entidad, solicitud, tipoDocumento);
        boolean requiereReubicacion = !Objects.equals(fichaAnterior, entidad.getFichaPsicologicaId())
            || (nombreAnterior != null && !nombreAnterior.equals(entidad.getNombreOriginal()));
        if (requiereReubicacion || entidad.getRutaAlmacenamiento() == null) {
            DocumentoStorageService.StorageLocation ubicacion = storageService.prepararUbicacion(
                entidad.getFichaPsicologicaId(), entidad.getNombreOriginal());
            entidad.setRutaAlmacenamiento(ubicacion.rutaAbsoluta().toString());
            entidad.setRutaRelativa(ubicacion.rutaRelativa().toString());
        }
        DocumentoDigital actualizado = documentoDigitalRepository.save(entidad);
        return DocumentoDigitalMapper.toRespuestaDto(actualizado);
    }

    @Override
    public void eliminarLogicamente(Long documentoId) {
        DocumentoDigital entidad = obtenerDocumento(documentoId);
        entidad.setActivo(Boolean.FALSE);
        documentoDigitalRepository.save(entidad);
    }

    @Override
    @Transactional(readOnly = true)
    public DocumentoDigitalDetalleDto obtenerPorId(Long documentoId) {
        DocumentoDigital entidad = obtenerDocumento(documentoId);
        return DocumentoDigitalMapper.toDetalleDto(entidad);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DocumentoDigitalResumenDto> listarPorTipo(String nombreTipoDocumento, Pageable pageable) {
        return documentoDigitalRepository
                .findByTipoDocumentoNombreIgnoreCase(nombreTipoDocumento, pageable)
                .map(DocumentoDigitalMapper::toResumenDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DocumentoDigitalResumenDto> listarActivos() {
        return documentoDigitalRepository.findByActivoTrue().stream()
                .map(DocumentoDigitalMapper::toResumenDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DocumentoDigitalResumenDto> listarPorFicha(Long fichaPsicologicaId) {
        return documentoDigitalRepository
            .findByFichaPsicologicaIdAndActivoTrueOrderByCreatedAtDesc(fichaPsicologicaId)
            .stream()
            .map(DocumentoDigitalMapper::toResumenDto)
            .collect(Collectors.toList());
    }

    private DocumentoDigital obtenerDocumento(Long documentoId) {
        return documentoDigitalRepository.findById(documentoId)
                .orElseThrow(() -> new IllegalArgumentException("Documento digital no encontrado"));
    }

    private TipoDocumento obtenerTipoDocumento(String nombreTipoDocumento) {
        return tipoDocumentoRepository.findByNombreIgnoreCase(nombreTipoDocumento)
                .orElseThrow(() -> new IllegalArgumentException("Tipo de documento no encontrado"));
    }
}
