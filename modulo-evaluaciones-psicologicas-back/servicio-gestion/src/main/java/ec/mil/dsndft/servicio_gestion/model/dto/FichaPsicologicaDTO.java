package ec.mil.dsndft.servicio_gestion.model.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class FichaPsicologicaDTO {
    private Long id;
    private Long personalMilitarId;
    private String personalMilitarNombre;
    private String personalMilitarCedula;
    private Long psicologoId;
    private String psicologoNombre;
    private String psicologoUsername;
    private String numeroEvaluacion;
    private LocalDate fechaEvaluacion;
    private String tipoEvaluacion;
    private ObservacionClinicaSectionDTO seccionObservacion;
    private PsicoanamnesisPrenatalDTO seccionPrenatal;
    private PsicoanamnesisNatalDTO seccionNatal;
    private PsicoanamnesisInfanciaDTO seccionInfancia;
    private String estado;
    private String condicion;
    private String diagnosticoCie10Codigo;
    private String diagnosticoCie10Descripcion;
    private String planFrecuencia;
    private String planTipoSesion;
    private String planDetalle;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}