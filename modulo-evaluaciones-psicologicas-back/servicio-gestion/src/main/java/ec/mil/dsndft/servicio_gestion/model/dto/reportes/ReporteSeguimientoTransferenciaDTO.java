package ec.mil.dsndft.servicio_gestion.model.dto.reportes;

import ec.mil.dsndft.servicio_gestion.model.enums.CondicionClinicaEnum;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
public class ReporteSeguimientoTransferenciaDTO {
    private Long personalMilitarId;
    private String personalMilitarNombre;
    private String personalMilitarCedula;
    private Long fichaId;
    private String numeroEvaluacion;
    private CondicionClinicaEnum condicionClinica;
    private String condicionClinicaCanonical;
    private Long psicologoId;
    private String psicologoNombre;
    private String psicologoUnidadMilitar;
    private long totalSeguimientos;
    private LocalDate ultimaFechaSeguimiento;
    private LocalDate proximoSeguimiento;
    private LocalDate fechaTransferencia;
    private String unidadTransferencia;
    private String observacionTransferencia;
    private LocalDate fechaEvaluacion;
    private String filtroCedula;
    private String filtroUnidadMilitar;
    private LocalDate filtroFechaDesde;
    private LocalDate filtroFechaHasta;

    public ReporteSeguimientoTransferenciaDTO(Long personalMilitarId,
                                              String personalMilitarNombre,
                                              String personalMilitarCedula,
                                              Long fichaId,
                                              String numeroEvaluacion,
                                              CondicionClinicaEnum condicionClinica,
                                              Long psicologoId,
                                              String psicologoNombre,
                                              String psicologoUnidadMilitar,
                                              long totalSeguimientos,
                                              LocalDate ultimaFechaSeguimiento,
                                              LocalDate fechaEvaluacion,
                                              String unidadTransferencia,
                                              String observacionTransferencia,
                                              LocalDate fechaTransferencia,
                                              LocalDate proximoSeguimiento) {
        this.personalMilitarId = personalMilitarId;
        this.personalMilitarNombre = personalMilitarNombre;
        this.personalMilitarCedula = personalMilitarCedula;
        this.fichaId = fichaId;
        this.numeroEvaluacion = numeroEvaluacion;
        this.condicionClinica = condicionClinica;
        this.psicologoId = psicologoId;
        this.psicologoNombre = psicologoNombre;
        this.psicologoUnidadMilitar = psicologoUnidadMilitar;
        this.totalSeguimientos = totalSeguimientos;
        this.ultimaFechaSeguimiento = ultimaFechaSeguimiento;
        this.fechaEvaluacion = fechaEvaluacion;
        this.unidadTransferencia = unidadTransferencia;
        this.observacionTransferencia = observacionTransferencia;
        this.fechaTransferencia = fechaTransferencia;
        this.proximoSeguimiento = proximoSeguimiento;
    }
}
