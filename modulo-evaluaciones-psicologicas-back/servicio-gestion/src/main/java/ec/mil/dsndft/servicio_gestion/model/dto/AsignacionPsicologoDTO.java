package ec.mil.dsndft.servicio_gestion.model.dto;

import lombok.Data;

@Data
public class AsignacionPsicologoDTO {
    private Long id;
    private Long psicologoId;
    private Long personalMilitarId;
    private String motivoAsignacion;
    private Boolean activo;
}