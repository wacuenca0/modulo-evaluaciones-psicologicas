package ec.mil.dsndft.servicio_gestion.model.value;

import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Embeddable
public class ObservacionClinica {

    private String observacionClinica;
    private String motivoConsulta;
    private String enfermedadActual;
}
