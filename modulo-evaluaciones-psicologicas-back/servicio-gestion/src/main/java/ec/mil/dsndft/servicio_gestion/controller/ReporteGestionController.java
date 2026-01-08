package ec.mil.dsndft.servicio_gestion.controller;

import ec.mil.dsndft.servicio_gestion.model.dto.reportes.ReporteAtencionPsicologoDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.reportes.ReporteEpidemiologiaDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.reportes.ReporteHistorialPsicologicoDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.reportes.ReportePersonalObservacionDTO;
import ec.mil.dsndft.servicio_gestion.service.ReporteGestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reportes")
@RequiredArgsConstructor
public class ReporteGestionController {

    private final ReporteGestionService reporteGestionService;

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @GetMapping("/atenciones-psicologos")
    public ResponseEntity<List<ReporteAtencionPsicologoDTO>> obtenerAtenciones(
        @RequestParam(required = false) Long psicologoId,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaDesde,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaHasta,
        @RequestParam(required = false) String cie10Codigo,
        @RequestParam(required = false) String cie10Texto
    ) {
        List<ReporteAtencionPsicologoDTO> resultado = reporteGestionService
            .obtenerAtencionesPorPsicologo(psicologoId, fechaDesde, fechaHasta, cie10Codigo, cie10Texto);
        return ResponseEntity.ok(resultado);
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @GetMapping("/observacion")
    public ResponseEntity<List<ReportePersonalObservacionDTO>> obtenerObservacion(
        @RequestParam(required = false) Long psicologoId,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaDesde,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaHasta
    ) {
        List<ReportePersonalObservacionDTO> resultado = reporteGestionService
            .obtenerPersonalEnObservacion(psicologoId, fechaDesde, fechaHasta);
        return ResponseEntity.ok(resultado);
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @GetMapping("/epidemiologia")
    public ResponseEntity<ReporteEpidemiologiaDTO> obtenerEpidemiologia(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaDesde,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaHasta
    ) {
        ReporteEpidemiologiaDTO dto = reporteGestionService.obtenerEstadisticaEpidemiologica(fechaDesde, fechaHasta);
        return ResponseEntity.ok(dto);
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @GetMapping("/historial-psicologico/{personalMilitarId}")
    public ResponseEntity<ReporteHistorialPsicologicoDTO> obtenerHistorial(
        @PathVariable Long personalMilitarId,
        @RequestParam(defaultValue = "true") boolean incluirSeguimientos
    ) {
        ReporteHistorialPsicologicoDTO dto = reporteGestionService
            .obtenerHistorialPsicologico(personalMilitarId, incluirSeguimientos);
        return ResponseEntity.ok(dto);
    }
}
