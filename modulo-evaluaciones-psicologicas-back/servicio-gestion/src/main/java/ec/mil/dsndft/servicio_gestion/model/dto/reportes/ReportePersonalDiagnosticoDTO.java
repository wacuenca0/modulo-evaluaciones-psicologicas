package ec.mil.dsndft.servicio_gestion.model.dto.reportes;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
public class ReportePersonalDiagnosticoDTO {
    private Long personalMilitarId;
    private String personalMilitarCedula;
    private String personalMilitarNombre;
    private String tipoPersona;
    private Boolean esMilitar;
    private String grado;
    private String unidadMilitar;
    private String numeroEvaluacion;
    private LocalDate fechaEvaluacion;
    private String diagnosticoCodigo;
    private String diagnosticoNombre;
    private String diagnosticoCategoriaPadre;
    private Integer diagnosticoNivel;
    private String diagnosticoDescripcion;
    private Long psicologoId;
    private String psicologoNombre;
    private String psicologoUnidadMilitar;
    private LocalDate filtroFechaDesde;
    private LocalDate filtroFechaHasta;
    private Long filtroDiagnosticoId;
    private String filtroDiagnosticoCodigo;
    private String filtroDiagnosticoTexto;
    private String filtroCedula;
    private String filtroGrado;
    private String filtroUnidadMilitar;

    public ReportePersonalDiagnosticoDTO(Long personalMilitarId,
                                         String personalMilitarCedula,
                                         String personalMilitarNombre,
                                         String tipoPersona,
                                         Boolean esMilitar,
                                         String grado,
                                         String unidadMilitar,
                                         String numeroEvaluacion,
                                         LocalDate fechaEvaluacion,
                                         String diagnosticoCodigo,
                                         String diagnosticoNombre,
                                         String diagnosticoCategoriaPadre,
                                         Integer diagnosticoNivel,
                                         String diagnosticoDescripcion,
                                         Long psicologoId,
                                         String psicologoNombre,
                                         String psicologoUnidadMilitar) {
        this.personalMilitarId = personalMilitarId;
        this.personalMilitarCedula = personalMilitarCedula;
        this.personalMilitarNombre = personalMilitarNombre;
        this.tipoPersona = tipoPersona;
        this.esMilitar = esMilitar;
        this.grado = grado;
        this.unidadMilitar = unidadMilitar;
        this.numeroEvaluacion = numeroEvaluacion;
        this.fechaEvaluacion = fechaEvaluacion;
        this.diagnosticoCodigo = diagnosticoCodigo;
        this.diagnosticoNombre = diagnosticoNombre;
        this.diagnosticoCategoriaPadre = diagnosticoCategoriaPadre;
        this.diagnosticoNivel = diagnosticoNivel;
        this.diagnosticoDescripcion = diagnosticoDescripcion;
        this.psicologoId = psicologoId;
        this.psicologoNombre = psicologoNombre;
        this.psicologoUnidadMilitar = psicologoUnidadMilitar;
    }
}
