package ec.mil.dsndft.servicio_gestion.service;

import ec.mil.dsndft.servicio_gestion.model.dto.reportes.ReporteAtencionPsicologoDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.reportes.ReportePersonalDiagnosticoDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.reportes.ReporteHistorialFichaDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.reportes.ReporteSeguimientoTransferenciaDTO;
import java.time.LocalDate;
import java.util.List;

public interface ReporteGestionService {

    List<ReporteAtencionPsicologoDTO> obtenerAtencionesPorPsicologo(Long psicologoId,
                                                                    LocalDate fechaDesde,
                                                                    LocalDate fechaHasta,
                                                                    Long diagnosticoId,
                                                                    String cedula,
                                                                    String unidadMilitar);

    List<ReporteSeguimientoTransferenciaDTO> obtenerPersonasEnSeguimientoOTransferencia(Long psicologoId,
                                                                                        LocalDate fechaDesde,
                                                                                        LocalDate fechaHasta,
                                                                                        String cedula,
                                                                                        String unidadMilitar);

    List<ReportePersonalDiagnosticoDTO> obtenerReportePersonalDiagnostico(LocalDate fechaDesde,
                                                                          LocalDate fechaHasta,
                                                                          Long diagnosticoId,
                                                                          String cedula,
                                                                          String grado,
                                                                          String unidadMilitar);

    List<ReporteHistorialFichaDTO> obtenerHistorialFichas(Long personalMilitarId,
                                                          String cedula,
                                                          boolean incluirSeguimientos);
}
