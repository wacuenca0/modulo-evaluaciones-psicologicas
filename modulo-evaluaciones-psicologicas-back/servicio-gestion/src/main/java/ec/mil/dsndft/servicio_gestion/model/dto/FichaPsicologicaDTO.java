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
    private Long creadoPorId;
    private String creadoPorNombre;
    private String creadoPorUsername;
    private Long actualizadoPorId;
    private String actualizadoPorNombre;
    private String actualizadoPorUsername;
    private String numeroEvaluacion;
    private LocalDate fechaEvaluacion;
    private String tipoEvaluacion;
    private ObservacionClinicaSectionDTO seccionObservacion;
    private PsicoanamnesisPrenatalDTO seccionPrenatal;
    private PsicoanamnesisNatalDTO seccionNatal;
    private PsicoanamnesisInfanciaDTO seccionInfancia;
    private String estado;
    private String condicion;
    private Long diagnosticoCie10Id;
    private String diagnosticoCie10Codigo;
    private String diagnosticoCie10Nombre;
    private String diagnosticoCie10CategoriaPadre;
    private Integer diagnosticoCie10Nivel;
    private String diagnosticoCie10Descripcion;
    private String planFrecuencia;
    private String planTipoSesion;
    private String planDetalle;
    private LocalDate ultimaFechaSeguimiento;
    private LocalDate proximoSeguimiento;
    private LocalDate transferenciaFecha;
    private String transferenciaUnidad;
    private String transferenciaObservacion;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}