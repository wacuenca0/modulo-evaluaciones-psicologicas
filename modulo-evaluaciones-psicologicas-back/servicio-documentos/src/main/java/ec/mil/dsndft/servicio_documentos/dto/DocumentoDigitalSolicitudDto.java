package ec.mil.dsndft.servicio_documentos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class DocumentoDigitalSolicitudDto {

    @NotBlank
    String nombreTipoDocumento;

    @NotNull
    Long fichaPsicologicaId;

    String fichaNumeroEvaluacion;

    @NotBlank
    String nombreOriginal;

    String rutaAlmacenamiento;

    @NotBlank
    String tipoMime;

    @NotNull
    @PositiveOrZero
    Long tamanoBytes;

    String origenModulo;

    String referenciaExterna;

    String checksum;

    String descripcion;

    String metadatos;
}
