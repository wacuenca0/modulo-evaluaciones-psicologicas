package ec.mil.dsndft.servicio_gestion.model.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class FichaSeccionObservacionRequestDTO {

    @NotBlank(message = "La observación clínica es obligatoria")
    @JsonAlias({"observacion_clinica"})
    private String observacionClinica;

    @NotBlank(message = "El motivo de la consulta es obligatorio")
    @JsonAlias({"motivo_consulta"})
    private String motivoConsulta;

    @Size(max = 4000, message = "La enfermedad actual no debe superar 4000 caracteres")
    @JsonAlias({"enfermedad_actual"})
    private String enfermedadActual;

    @Valid
    @JsonAlias({"historia_pasada_enfermedad"})
    private HistoriaPasadaEnfermedadRequestDTO historiaPasadaEnfermedad;

    public String getObservacionClinica() {
        return observacionClinica;
    }

    public void setObservacionClinica(String observacionClinica) {
        this.observacionClinica = observacionClinica;
    }

    public String getMotivoConsulta() {
        return motivoConsulta;
    }

    public void setMotivoConsulta(String motivoConsulta) {
        this.motivoConsulta = motivoConsulta;
    }

    public String getEnfermedadActual() {
        return enfermedadActual;
    }

    public void setEnfermedadActual(String enfermedadActual) {
        this.enfermedadActual = enfermedadActual;
    }

    public HistoriaPasadaEnfermedadRequestDTO getHistoriaPasadaEnfermedad() {
        return historiaPasadaEnfermedad;
    }

    public void setHistoriaPasadaEnfermedad(HistoriaPasadaEnfermedadRequestDTO historiaPasadaEnfermedad) {
        this.historiaPasadaEnfermedad = historiaPasadaEnfermedad;
    }
}
