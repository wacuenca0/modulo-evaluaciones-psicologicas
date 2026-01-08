package ec.mil.dsndft.servicio_gestion.model.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class FichaDatosGeneralesRequestDTO {

    @NotNull(message = "El identificador del personal militar es obligatorio")
    @JsonAlias({"personal_militar_id"})
    private Long personalMilitarId;

    @JsonAlias({"psicologo_id"})
    private Long psicologoId;

    @NotNull(message = "La fecha de evaluación es obligatoria")
    @JsonAlias({"fecha_evaluacion"})
    private LocalDate fechaEvaluacion;

    @NotBlank(message = "El tipo de evaluación es obligatorio")
    @Size(max = 40, message = "El tipo de evaluación no debe superar 40 caracteres")
    @JsonAlias({"tipo_evaluacion"})
    private String tipoEvaluacion;

    @NotBlank(message = "El estado de la ficha es obligatorio")
    @JsonAlias({"estado"})
    private String estado;

    public Long getPersonalMilitarId() {
        return personalMilitarId;
    }

    public void setPersonalMilitarId(Long personalMilitarId) {
        this.personalMilitarId = personalMilitarId;
    }

    public Long getPsicologoId() {
        return psicologoId;
    }

    public void setPsicologoId(Long psicologoId) {
        this.psicologoId = psicologoId;
    }

    public LocalDate getFechaEvaluacion() {
        return fechaEvaluacion;
    }

    public void setFechaEvaluacion(LocalDate fechaEvaluacion) {
        this.fechaEvaluacion = fechaEvaluacion;
    }

    public String getTipoEvaluacion() {
        return tipoEvaluacion;
    }

    public void setTipoEvaluacion(String tipoEvaluacion) {
        this.tipoEvaluacion = tipoEvaluacion;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }
}
