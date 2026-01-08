package ec.mil.dsndft.servicio_gestion.model.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class FichaCondicionRequestDTO {

    @NotBlank(message = "La condición clínica es obligatoria")
    @JsonAlias({"condicion"})
    private String condicion;

    @Size(max = 10, message = "El código CIE-10 no debe superar 10 caracteres")
    @JsonAlias({"diagnostico_cie10_codigo"})
    private String diagnosticoCie10Codigo;

    @JsonAlias({"diagnostico_cie10_descripcion"})
    private String diagnosticoCie10Descripcion;

    @JsonAlias({"plan_frecuencia"})
    private String planFrecuencia;

    @JsonAlias({"plan_tipo_sesion"})
    private String planTipoSesion;

    @Size(max = 500, message = "El detalle del plan no debe superar 500 caracteres")
    @JsonAlias({"plan_detalle"})
    private String planDetalle;

    public String getCondicion() {
        return condicion;
    }

    public void setCondicion(String condicion) {
        this.condicion = condicion;
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
