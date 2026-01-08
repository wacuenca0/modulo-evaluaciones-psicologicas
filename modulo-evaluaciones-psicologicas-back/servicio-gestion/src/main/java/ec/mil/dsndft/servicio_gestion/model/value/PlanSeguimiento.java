package ec.mil.dsndft.servicio_gestion.model.value;

import ec.mil.dsndft.servicio_gestion.model.enums.FrecuenciaSeguimientoEnum;
import ec.mil.dsndft.servicio_gestion.model.enums.TipoSesionEnum;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Embeddable
public class PlanSeguimiento {

    @Enumerated(EnumType.STRING)
    @Column(name = "plan_frecuencia", length = 20)
    private FrecuenciaSeguimientoEnum frecuencia;

    @Enumerated(EnumType.STRING)
    @Column(name = "plan_tipo_sesion", length = 20)
    private TipoSesionEnum tipoSesion;

    @Column(name = "plan_detalle", length = 500)
    private String detalle;
}
