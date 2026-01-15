package ec.mil.dsndft.servicio_gestion.controller;

import ec.mil.dsndft.servicio_gestion.model.dto.reportes.ReporteAtencionPsicologoDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.reportes.ReporteHistorialFichaDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.reportes.ReportePersonalDiagnosticoDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.reportes.ReporteSeguimientoTransferenciaDTO;
import ec.mil.dsndft.servicio_gestion.service.ReporteGestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
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

    @PreAuthorize("hasAnyRole('ADMINISTRADOR','PSICOLOGO')")
    @GetMapping("/atenciones-psicologos")
    public ResponseEntity<List<ReporteAtencionPsicologoDTO>> obtenerAtenciones(
        @RequestParam(required = false) Long psicologoId,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaDesde,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaHasta,
        @RequestParam(required = false) Long diagnosticoId,
        @RequestParam(required = false) String cedula,
        @RequestParam(required = false) String unidadMilitar
    ) {
        List<ReporteAtencionPsicologoDTO> resultado = reporteGestionService
            .obtenerAtencionesPorPsicologo(psicologoId, fechaDesde, fechaHasta, diagnosticoId, cedula, unidadMilitar);
        return ResponseEntity.ok(resultado);
    }

    @PreAuthorize("hasAnyRole('ADMINISTRADOR','PSICOLOGO')")
    @GetMapping("/condicion-seguimiento")
    public ResponseEntity<List<ReporteSeguimientoTransferenciaDTO>> obtenerSeguimientoOTransferencia(
        @RequestParam(required = false) Long psicologoId,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaDesde,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaHasta,
        @RequestParam(required = false) String cedula,
        @RequestParam(required = false) String unidadMilitar
    ) {
        List<ReporteSeguimientoTransferenciaDTO> resultado = reporteGestionService
            .obtenerPersonasEnSeguimientoOTransferencia(psicologoId, fechaDesde, fechaHasta, cedula, unidadMilitar);
        return ResponseEntity.ok(resultado);
    }

    @PreAuthorize("hasAnyRole('ADMINISTRADOR','PSICOLOGO')")
    @GetMapping("/personal-diagnosticos")
    public ResponseEntity<List<ReportePersonalDiagnosticoDTO>> obtenerPersonalDiagnosticos(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaDesde,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaHasta,
        @RequestParam(required = false) Long diagnosticoId,
        @RequestParam(required = false) String cedula,
        @RequestParam(required = false) String grado,
        @RequestParam(required = false) String unidadMilitar
    ) {
        List<ReportePersonalDiagnosticoDTO> resultado = reporteGestionService
            .obtenerReportePersonalDiagnostico(fechaDesde, fechaHasta, diagnosticoId, cedula, grado, unidadMilitar);
        return ResponseEntity.ok(resultado);
    }

    @PreAuthorize("hasAnyRole('ADMINISTRADOR','PSICOLOGO')")
    @GetMapping("/historial-fichas")
    public ResponseEntity<List<ReporteHistorialFichaDTO>> obtenerHistorialFichas(
        @RequestParam(required = false) Long personalMilitarId,
        @RequestParam(required = false) String cedula,
        @RequestParam(required = false, defaultValue = "false") boolean incluirSeguimientos
    ) {
        List<ReporteHistorialFichaDTO> resultado = reporteGestionService
            .obtenerHistorialFichas(personalMilitarId, cedula, incluirSeguimientos);
        return ResponseEntity.ok(resultado);
    }
}
