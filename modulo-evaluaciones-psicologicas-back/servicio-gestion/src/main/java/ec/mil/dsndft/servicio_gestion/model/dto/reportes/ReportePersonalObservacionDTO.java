package ec.mil.dsndft.servicio_gestion.model.dto.reportes;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
public class ReportePersonalObservacionDTO {
    private Long fichaId;
    private Long personalMilitarId;
    private String personalMilitarNombre;
    private String personalMilitarCedula;
    private Long psicologoId;
    private String psicologoNombre;
    private LocalDate fechaEvaluacion;
    private String estadoFicha;
    private String condicionFicha;
    private LocalDate ultimaSesion;

    public ReportePersonalObservacionDTO(Long fichaId,
                                         Long personalMilitarId,
                                         String personalMilitarNombre,
                                         String personalMilitarCedula,
                                         Long psicologoId,
                                         String psicologoNombre,
                                         LocalDate fechaEvaluacion,
                                         ec.mil.dsndft.servicio_gestion.model.enums.EstadoFichaEnum estadoFicha,
                                         ec.mil.dsndft.servicio_gestion.model.enums.CondicionClinicaEnum condicionFicha,
                                         LocalDate ultimaSesion) {
        this.fichaId = fichaId;
        this.personalMilitarId = personalMilitarId;
        this.personalMilitarNombre = personalMilitarNombre;
        this.personalMilitarCedula = personalMilitarCedula;
        this.psicologoId = psicologoId;
        this.psicologoNombre = psicologoNombre;
        this.fechaEvaluacion = fechaEvaluacion;
        this.estadoFicha = estadoFicha != null ? estadoFicha.getCanonical() : null;
        this.condicionFicha = condicionFicha != null ? condicionFicha.getCanonical() : null;
        this.ultimaSesion = ultimaSesion;
    }
}
