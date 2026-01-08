package ec.mil.dsndft.servicio_gestion.model.value;

import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Embeddable
public class PsicoanamnesisNatal {

    private Boolean partoNormal;
    private String termino;
    private String complicaciones;
    private String observacion;
}
