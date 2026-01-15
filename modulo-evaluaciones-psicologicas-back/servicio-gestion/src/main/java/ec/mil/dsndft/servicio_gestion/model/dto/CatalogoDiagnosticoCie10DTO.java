package ec.mil.dsndft.servicio_gestion.model.dto;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class CatalogoDiagnosticoCie10DTO {
    Long id;
    String codigo;
    String nombre;
    String descripcion;
    String categoriaPadre;
    Integer nivel;
    Boolean activo;
    LocalDateTime fechaCreacion;
    LocalDateTime fechaActualizacion;
}
