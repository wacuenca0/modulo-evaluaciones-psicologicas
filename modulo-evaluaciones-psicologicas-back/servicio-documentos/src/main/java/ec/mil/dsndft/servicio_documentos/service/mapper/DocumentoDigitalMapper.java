package ec.mil.dsndft.servicio_documentos.service.mapper;

import ec.mil.dsndft.servicio_documentos.dto.DocumentoDigitalDetalleDto;
import ec.mil.dsndft.servicio_documentos.dto.DocumentoDigitalRespuestaDto;
import ec.mil.dsndft.servicio_documentos.dto.DocumentoDigitalResumenDto;
import ec.mil.dsndft.servicio_documentos.dto.DocumentoDigitalSolicitudDto;
import ec.mil.dsndft.servicio_documentos.entity.DocumentoDigital;
import ec.mil.dsndft.servicio_documentos.entity.TipoDocumento;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;

public final class DocumentoDigitalMapper {

    private DocumentoDigitalMapper() {
    }

    public static DocumentoDigital fromSolicitud(DocumentoDigitalSolicitudDto solicitud, TipoDocumento tipoDocumento) {
        DocumentoDigital entidad = new DocumentoDigital();
        entidad.setTipoDocumento(tipoDocumento);
        entidad.setFichaPsicologicaId(solicitud.getFichaPsicologicaId());
        entidad.setFichaNumeroEvaluacion(solicitud.getFichaNumeroEvaluacion());
        entidad.setNombreOriginal(solicitud.getNombreOriginal());
        entidad.setTipoMime(solicitud.getTipoMime());
        entidad.setTamanoBytes(solicitud.getTamanoBytes());
        entidad.setDescripcion(solicitud.getDescripcion());
        entidad.setOrigenModulo(solicitud.getOrigenModulo());
        entidad.setReferenciaExterna(solicitud.getReferenciaExterna());
        entidad.setMetadatos(solicitud.getMetadatos());
        entidad.setChecksum(solicitud.getChecksum());
        entidad.setActivo(Boolean.TRUE);
        return entidad;
    }

    public static void actualizarEntidad(DocumentoDigital entidad, DocumentoDigitalSolicitudDto solicitud, TipoDocumento tipoDocumento) {
        entidad.setTipoDocumento(tipoDocumento);
        entidad.setFichaPsicologicaId(solicitud.getFichaPsicologicaId());
        entidad.setFichaNumeroEvaluacion(solicitud.getFichaNumeroEvaluacion());
        entidad.setNombreOriginal(solicitud.getNombreOriginal());
        entidad.setTipoMime(solicitud.getTipoMime());
        entidad.setTamanoBytes(solicitud.getTamanoBytes());
        entidad.setDescripcion(solicitud.getDescripcion());
        entidad.setOrigenModulo(solicitud.getOrigenModulo());
        entidad.setReferenciaExterna(solicitud.getReferenciaExterna());
        entidad.setMetadatos(solicitud.getMetadatos());
        entidad.setChecksum(solicitud.getChecksum());
    }

    public static DocumentoDigitalRespuestaDto toRespuestaDto(DocumentoDigital entidad) {
        return DocumentoDigitalRespuestaDto.builder()
                .id(entidad.getId())
                .nombreTipoDocumento(entidad.getTipoDocumento() != null ? entidad.getTipoDocumento().getNombre() : null)
                .fichaPsicologicaId(entidad.getFichaPsicologicaId())
                .fichaNumeroEvaluacion(entidad.getFichaNumeroEvaluacion())
                .nombreOriginal(entidad.getNombreOriginal())
                .rutaAlmacenamiento(entidad.getRutaAlmacenamiento())
                .rutaRelativa(entidad.getRutaRelativa())
                .tipoMime(entidad.getTipoMime())
                .tamanoBytes(entidad.getTamanoBytes())
                .referenciaExterna(entidad.getReferenciaExterna())
                .origenModulo(entidad.getOrigenModulo())
                .descripcion(entidad.getDescripcion())
                .metadatos(entidad.getMetadatos())
                .fechaRegistro(toOffset(entidad.getCreatedAt()))
                .fechaActualizacion(toOffset(entidad.getUpdatedAt()))
                .build();
    }

    public static DocumentoDigitalDetalleDto toDetalleDto(DocumentoDigital entidad) {
        return DocumentoDigitalDetalleDto.builder()
                .id(entidad.getId())
                .nombreTipoDocumento(entidad.getTipoDocumento() != null ? entidad.getTipoDocumento().getNombre() : null)
                .fichaPsicologicaId(entidad.getFichaPsicologicaId())
                .fichaNumeroEvaluacion(entidad.getFichaNumeroEvaluacion())
                .nombreOriginal(entidad.getNombreOriginal())
                .rutaAlmacenamiento(entidad.getRutaAlmacenamiento())
                .rutaRelativa(entidad.getRutaRelativa())
                .tipoMime(entidad.getTipoMime())
                .tamanoBytes(entidad.getTamanoBytes())
                .referenciaExterna(entidad.getReferenciaExterna())
                .origenModulo(entidad.getOrigenModulo())
                .descripcion(entidad.getDescripcion())
                .checksum(entidad.getChecksum())
                .metadatos(entidad.getMetadatos())
                .fechaRegistro(toOffset(entidad.getCreatedAt()))
                .fechaActualizacion(toOffset(entidad.getUpdatedAt()))
                .activo(entidad.getActivo())
                .build();
    }

    public static DocumentoDigitalResumenDto toResumenDto(DocumentoDigital entidad) {
        return DocumentoDigitalResumenDto.builder()
                .id(entidad.getId())
                .nombreTipoDocumento(entidad.getTipoDocumento() != null ? entidad.getTipoDocumento().getNombre() : null)
                .fichaPsicologicaId(entidad.getFichaPsicologicaId())
                .fichaNumeroEvaluacion(entidad.getFichaNumeroEvaluacion())
                .nombreOriginal(entidad.getNombreOriginal())
                .rutaAlmacenamiento(entidad.getRutaAlmacenamiento())
                .rutaRelativa(entidad.getRutaRelativa())
                .origenModulo(entidad.getOrigenModulo())
                .referenciaExterna(entidad.getReferenciaExterna())
                .fechaRegistro(toOffset(entidad.getCreatedAt()))
                .build();
    }

    private static OffsetDateTime toOffset(LocalDateTime fecha) {
        if (fecha == null) {
            return null;
        }
        return fecha.atZone(ZoneId.systemDefault()).toOffsetDateTime();
    }
}
