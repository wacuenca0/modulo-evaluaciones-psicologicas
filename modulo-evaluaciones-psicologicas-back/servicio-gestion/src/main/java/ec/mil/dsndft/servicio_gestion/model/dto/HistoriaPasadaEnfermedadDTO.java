package ec.mil.dsndft.servicio_gestion.model.dto;

import lombok.Data;

@Data
public class HistoriaPasadaEnfermedadDTO {
    private String descripcion;
    private Boolean tomaMedicacion;
    private String tipoMedicacion;
    private HospitalizacionRehabilitacionDTO hospitalizacionRehabilitacion;
}
