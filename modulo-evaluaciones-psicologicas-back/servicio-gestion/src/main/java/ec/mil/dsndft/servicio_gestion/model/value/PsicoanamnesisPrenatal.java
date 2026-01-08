package ec.mil.dsndft.servicio_gestion.model.value;

import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Embeddable
public class PsicoanamnesisPrenatal {

    private String condicionesBiologicasPadres;
    private String condicionesPsicologicasPadres;
    private String observacion;
}
