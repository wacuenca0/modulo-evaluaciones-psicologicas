package ec.mil.dsndft.servicio_gestion.model.dto;

import lombok.Data;

@Data
public class HospitalizacionRehabilitacionDTO {
    private Boolean requiere;
    private String tipo;
    private String duracion;
}
