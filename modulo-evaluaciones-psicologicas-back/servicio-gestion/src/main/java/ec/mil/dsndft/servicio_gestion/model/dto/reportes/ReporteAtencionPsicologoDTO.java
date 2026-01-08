package ec.mil.dsndft.servicio_gestion.model.dto.reportes;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
public class ReporteAtencionPsicologoDTO {
    private Long psicologoId;
    private String psicologoNombre;
    private String psicologoUsername;
    private long totalFichas;
    private long fichasActivas;
    private long fichasObservacion;
    private long totalSeguimientos;
    private long personasAtendidas;
    private LocalDate ultimaAtencion;
    private String filtroDiagnosticoCodigo;
    private String filtroDiagnosticoTexto;

    public ReporteAtencionPsicologoDTO(Long psicologoId,
                                       String psicologoNombre,
                                       String psicologoUsername,
                                       long totalFichas,
                                       long fichasActivas,
                                       long fichasObservacion,
                                       long totalSeguimientos,
                                       long personasAtendidas,
                                       LocalDate ultimaAtencion) {
        this.psicologoId = psicologoId;
        this.psicologoNombre = psicologoNombre;
        this.psicologoUsername = psicologoUsername;
        this.totalFichas = totalFichas;
        this.fichasActivas = fichasActivas;
        this.fichasObservacion = fichasObservacion;
        this.totalSeguimientos = totalSeguimientos;
        this.personasAtendidas = personasAtendidas;
        this.ultimaAtencion = ultimaAtencion;
    }
}
