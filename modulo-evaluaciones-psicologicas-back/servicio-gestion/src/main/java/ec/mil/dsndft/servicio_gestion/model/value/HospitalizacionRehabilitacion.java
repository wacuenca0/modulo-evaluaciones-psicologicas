package ec.mil.dsndft.servicio_gestion.model.value;

import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Embeddable
public class HospitalizacionRehabilitacion {

    private Boolean requiere;
    private String tipo;
    private String duracion;
}
