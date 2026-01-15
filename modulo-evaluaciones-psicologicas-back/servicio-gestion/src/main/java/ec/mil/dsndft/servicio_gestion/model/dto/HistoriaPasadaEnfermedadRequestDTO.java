package ec.mil.dsndft.servicio_gestion.model.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class HistoriaPasadaEnfermedadRequestDTO {

    @Size(max = 4000, message = "La descripción de la historia pasada de la enfermedad no debe superar 4000 caracteres")
    @JsonAlias({"descripcion"})
    private String descripcion;

    @JsonAlias({"toma_medicacion"})
    private Boolean tomaMedicacion;

    @Size(max = 200, message = "El tipo de medicación no debe superar 200 caracteres")
    @JsonAlias({"tipo_medicacion"})
    private String tipoMedicacion;

    @Valid
    @JsonAlias({"hospitalizacion_rehabilitacion"})
    private HospitalizacionRehabilitacionRequestDTO hospitalizacionRehabilitacion;
}
