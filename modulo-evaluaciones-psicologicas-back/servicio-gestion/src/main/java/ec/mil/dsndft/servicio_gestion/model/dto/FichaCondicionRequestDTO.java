package ec.mil.dsndft.servicio_gestion.model.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public class FichaCondicionRequestDTO {

    @NotBlank(message = "La condición clínica es obligatoria")
    @JsonAlias({"condicion"})
    private String condicion;

    @JsonAlias({"diagnostico_cie10_id"})
    private Long diagnosticoCie10Id;

    @Size(max = 15, message = "El código CIE-10 no debe superar 15 caracteres")
    @JsonAlias({"diagnostico_cie10_codigo"})
    private String diagnosticoCie10Codigo;

    @Size(max = 500, message = "El nombre del diagnóstico no debe superar 500 caracteres")
    @JsonAlias({"diagnostico_cie10_nombre"})
    private String diagnosticoCie10Nombre;

    @Size(max = 15, message = "La categoría padre no debe superar 15 caracteres")
    @JsonAlias({"diagnostico_cie10_categoria_padre"})
    private String diagnosticoCie10CategoriaPadre;

    @JsonAlias({"diagnostico_cie10_nivel"})
    private Integer diagnosticoCie10Nivel;

    @JsonAlias({"diagnostico_cie10_descripcion"})
    private String diagnosticoCie10Descripcion;

    @JsonAlias({"plan_frecuencia"})
    private String planFrecuencia;

    @JsonAlias({"plan_tipo_sesion"})
    private String planTipoSesion;

    @Size(max = 500, message = "El detalle del plan no debe superar 500 caracteres")
    @JsonAlias({"plan_detalle"})
    private String planDetalle;

    @JsonAlias({"proximo_seguimiento"})
    private LocalDate proximoSeguimiento;

    @JsonAlias({"transferencia_unidad"})
    private String transferenciaUnidad;

    @JsonAlias({"transferencia_observacion"})
    private String transferenciaObservacion;

    public String getCondicion() {
        return condicion;
    }

    public void setCondicion(String condicion) {
        this.condicion = condicion;
    }

    public String getDiagnosticoCie10Codigo() {
        return diagnosticoCie10Codigo;
    }

    public String getDiagnosticoCie10Nombre() {
        return diagnosticoCie10Nombre;
    }

    public Long getDiagnosticoCie10Id() {
        return diagnosticoCie10Id;
    }

    public void setDiagnosticoCie10Id(Long diagnosticoCie10Id) {
        this.diagnosticoCie10Id = diagnosticoCie10Id;
    }

    public void setDiagnosticoCie10Codigo(String diagnosticoCie10Codigo) {
        this.diagnosticoCie10Codigo = diagnosticoCie10Codigo;
    }

    public void setDiagnosticoCie10Nombre(String diagnosticoCie10Nombre) {
        this.diagnosticoCie10Nombre = diagnosticoCie10Nombre;
    }

    public String getDiagnosticoCie10Descripcion() {
        return diagnosticoCie10Descripcion;
    }

    public void setDiagnosticoCie10Descripcion(String diagnosticoCie10Descripcion) {
        this.diagnosticoCie10Descripcion = diagnosticoCie10Descripcion;
    }

    public String getDiagnosticoCie10CategoriaPadre() {
        return diagnosticoCie10CategoriaPadre;
    }

    public void setDiagnosticoCie10CategoriaPadre(String diagnosticoCie10CategoriaPadre) {
        this.diagnosticoCie10CategoriaPadre = diagnosticoCie10CategoriaPadre;
    }

    public Integer getDiagnosticoCie10Nivel() {
        return diagnosticoCie10Nivel;
    }

    public void setDiagnosticoCie10Nivel(Integer diagnosticoCie10Nivel) {
        this.diagnosticoCie10Nivel = diagnosticoCie10Nivel;
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

    public LocalDate getProximoSeguimiento() {
        return proximoSeguimiento;
    }

    public void setProximoSeguimiento(LocalDate proximoSeguimiento) {
        this.proximoSeguimiento = proximoSeguimiento;
    }

    public String getTransferenciaUnidad() {
        return transferenciaUnidad;
    }

    public void setTransferenciaUnidad(String transferenciaUnidad) {
        this.transferenciaUnidad = transferenciaUnidad;
    }

    public String getTransferenciaObservacion() {
        return transferenciaObservacion;
    }

    public void setTransferenciaObservacion(String transferenciaObservacion) {
        this.transferenciaObservacion = transferenciaObservacion;
    }
}
