package ec.mil.dsndft.servicio_gestion.service;

import ec.mil.dsndft.servicio_gestion.model.dto.reportes.ReporteAtencionPsicologoDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.reportes.ReporteEpidemiologiaDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.reportes.ReporteHistorialPsicologicoDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.reportes.ReportePersonalObservacionDTO;

import java.time.LocalDate;
import java.util.List;

public interface ReporteGestionService {

    List<ReporteAtencionPsicologoDTO> obtenerAtencionesPorPsicologo(Long psicologoId,
                                                                    LocalDate fechaDesde,
                                                                    LocalDate fechaHasta,
                                                                    String diagnosticoCodigo,
                                                                    String diagnosticoTexto);

    List<ReportePersonalObservacionDTO> obtenerPersonalEnObservacion(Long psicologoId,
                                                                      LocalDate fechaDesde,
                                                                      LocalDate fechaHasta);

    ReporteEpidemiologiaDTO obtenerEstadisticaEpidemiologica(LocalDate fechaDesde, LocalDate fechaHasta);

    ReporteHistorialPsicologicoDTO obtenerHistorialPsicologico(Long personalMilitarId, boolean incluirSeguimientos);
}
