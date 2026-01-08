package ec.mil.dsndft.servicio_gestion.model.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class SeguimientoPsicologicoRequestDTO {

    @NotNull(message = "El identificador de la ficha psicológica es obligatorio")
    @JsonAlias({"ficha_psicologica_id"})
    private Long fichaPsicologicaId;

    @JsonAlias({"psicologo_id"})
    private Long psicologoId;

    @JsonAlias({"fecha_seguimiento"})
    private LocalDate fechaSeguimiento;

    @NotBlank(message = "Las observaciones del seguimiento son obligatorias")
    @Size(max = 5000, message = "Las observaciones no deben superar 5000 caracteres")
    @JsonAlias({"observaciones"})
    private String observaciones;

    @JsonAlias({"condicion", "condicion_ficha"})
    private String condicionFicha;

    @JsonAlias({"diagnostico_cie10_codigo"})
    private String diagnosticoCie10Codigo;

    @JsonAlias({"diagnostico_cie10_descripcion"})
    private String diagnosticoCie10Descripcion;

    @JsonAlias({"plan_frecuencia"})
    private String planFrecuencia;

    @JsonAlias({"plan_tipo_sesion"})
    private String planTipoSesion;

    @JsonAlias({"plan_detalle"})
    private String planDetalle;

    public Long getFichaPsicologicaId() {
        return fichaPsicologicaId;
    }

    public void setFichaPsicologicaId(Long fichaPsicologicaId) {
        this.fichaPsicologicaId = fichaPsicologicaId;
    }

    public Long getPsicologoId() {
        return psicologoId;
    }

    public void setPsicologoId(Long psicologoId) {
        this.psicologoId = psicologoId;
    }

    public LocalDate getFechaSeguimiento() {
        return fechaSeguimiento;
    }

    public void setFechaSeguimiento(LocalDate fechaSeguimiento) {
        this.fechaSeguimiento = fechaSeguimiento;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

    public String getCondicionFicha() {
        return condicionFicha;
    }

    public void setCondicionFicha(String condicionFicha) {
        this.condicionFicha = condicionFicha;
    }

    public String getDiagnosticoCie10Codigo() {
        return diagnosticoCie10Codigo;
    }

    public void setDiagnosticoCie10Codigo(String diagnosticoCie10Codigo) {
        this.diagnosticoCie10Codigo = diagnosticoCie10Codigo;
    }

    public String getDiagnosticoCie10Descripcion() {
        return diagnosticoCie10Descripcion;
    }

    public void setDiagnosticoCie10Descripcion(String diagnosticoCie10Descripcion) {
        this.diagnosticoCie10Descripcion = diagnosticoCie10Descripcion;
    }

    public String getPlanFrecuencia() {
        return planFrecuencia;
    }

    public void setPlanFrecuencia(String planFrecuencia) {
        this.planFrecuencia = planFrecuencia;
    }

    public String getPlanTipoSesion() {
        return planTipoSesion;
    }

    public void setPlanTipoSesion(String planTipoSesion) {
        this.planTipoSesion = planTipoSesion;
    }

    public String getPlanDetalle() {
        return planDetalle;
    }

    public void setPlanDetalle(String planDetalle) {
        this.planDetalle = planDetalle;
    }
}
