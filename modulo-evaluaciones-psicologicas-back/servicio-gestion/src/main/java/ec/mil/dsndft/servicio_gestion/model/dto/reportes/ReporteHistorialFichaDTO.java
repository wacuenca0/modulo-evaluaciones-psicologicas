package ec.mil.dsndft.servicio_gestion.model.dto.reportes;

import ec.mil.dsndft.servicio_gestion.model.dto.ObservacionClinicaSectionDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.PsicoanamnesisInfanciaDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.PsicoanamnesisNatalDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.PsicoanamnesisPrenatalDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.SeguimientoPsicologicoDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReporteHistorialFichaDTO {
    private Long fichaId;
    private LocalDate fechaEvaluacion;
    private String estado;
    private String tipoEvaluacion;
    private Long psicologoId;
    private String psicologoNombre;
    private String condicion;
    private String diagnosticoCodigo;
    private String diagnosticoDescripcion;
    private String planFrecuencia;
    private String planTipoSesion;
    private String planDetalle;
    private ObservacionClinicaSectionDTO seccionObservacion;
    private PsicoanamnesisPrenatalDTO seccionPrenatal;
    private PsicoanamnesisNatalDTO seccionNatal;
    private PsicoanamnesisInfanciaDTO seccionInfancia;
    private LocalDateTime creadaEn;
    private LocalDateTime actualizadaEn;
    private List<SeguimientoPsicologicoDTO> seguimientos = new ArrayList<>();
}
