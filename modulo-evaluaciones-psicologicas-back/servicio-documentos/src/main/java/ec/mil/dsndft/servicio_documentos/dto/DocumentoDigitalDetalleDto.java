package ec.mil.dsndft.servicio_documentos.dto;

import java.time.OffsetDateTime;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class DocumentoDigitalDetalleDto {

    Long id;

    String nombreTipoDocumento;

    Long fichaPsicologicaId;

    String fichaNumeroEvaluacion;

    String nombreOriginal;

    String rutaAlmacenamiento;

    String rutaRelativa;

    String tipoMime;

    Long tamanoBytes;

    String referenciaExterna;

    String origenModulo;

    String descripcion;

    String checksum;

    String metadatos;

    OffsetDateTime fechaRegistro;

    OffsetDateTime fechaActualizacion;

    Boolean activo;
}
