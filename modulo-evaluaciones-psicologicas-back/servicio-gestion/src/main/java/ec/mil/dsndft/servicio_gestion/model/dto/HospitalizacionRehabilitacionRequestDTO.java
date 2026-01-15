package ec.mil.dsndft.servicio_gestion.model.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class HospitalizacionRehabilitacionRequestDTO {

    private Boolean requiere;

    @Size(max = 200, message = "El tipo de hospitalización/rehabilitación no debe superar 200 caracteres")
    @JsonAlias({"tipo"})
    private String tipo;

    @Size(max = 100, message = "La duración de la hospitalización/rehabilitación no debe superar 100 caracteres")
    @JsonAlias({"duracion"})
    private String duracion;
}
