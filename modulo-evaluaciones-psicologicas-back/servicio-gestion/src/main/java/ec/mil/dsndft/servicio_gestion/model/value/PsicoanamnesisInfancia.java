package ec.mil.dsndft.servicio_gestion.model.value;

import ec.mil.dsndft.servicio_gestion.model.enums.GradoDiscapacidadEnum;
import ec.mil.dsndft.servicio_gestion.model.enums.GradoSociabilidadEnum;
import ec.mil.dsndft.servicio_gestion.model.enums.RelacionFamiliarEnum;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Embeddable
public class PsicoanamnesisInfancia {

    @Enumerated(EnumType.STRING)
    private GradoSociabilidadEnum gradoSociabilidad;

    @Enumerated(EnumType.STRING)
    private RelacionFamiliarEnum relacionPadresHermanos;

    private Boolean discapacidadIntelectual;

    @Enumerated(EnumType.STRING)
    private GradoDiscapacidadEnum gradoDiscapacidad;

    private String trastornos;

    private Boolean tratamientosPsicologicosPsiquiatricos;

    private String observacion;
}
