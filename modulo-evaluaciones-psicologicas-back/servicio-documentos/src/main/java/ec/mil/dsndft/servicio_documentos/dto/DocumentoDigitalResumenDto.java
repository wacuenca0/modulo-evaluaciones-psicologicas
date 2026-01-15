package ec.mil.dsndft.servicio_documentos.dto;

import java.time.OffsetDateTime;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class DocumentoDigitalResumenDto {

    Long id;

    String nombreTipoDocumento;

    Long fichaPsicologicaId;

    String fichaNumeroEvaluacion;

    String nombreOriginal;

    String rutaAlmacenamiento;

    String rutaRelativa;

    String origenModulo;

    String referenciaExterna;

    OffsetDateTime fechaRegistro;
}
