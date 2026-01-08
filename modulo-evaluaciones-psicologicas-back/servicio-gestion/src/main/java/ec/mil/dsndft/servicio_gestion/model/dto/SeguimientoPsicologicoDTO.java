package ec.mil.dsndft.servicio_gestion.model.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class SeguimientoPsicologicoDTO {
    private Long id;
    private Long fichaPsicologicaId;
    private Long personalMilitarId;
    private String personalMilitarNombre;
    private String personalMilitarCedula;
    private Long psicologoId;
    private String psicologoNombre;
    private String psicologoUsername;
    private LocalDate fechaSeguimiento;
    private String observaciones;
    private String estadoFicha;
    private String condicionFicha;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}