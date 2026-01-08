package ec.mil.dsndft.servicio_gestion.controller;

import ec.mil.dsndft.servicio_gestion.model.dto.SeguimientoPsicologicoDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.SeguimientoPsicologicoRequestDTO;
import ec.mil.dsndft.servicio_gestion.service.SeguimientoPsicologicoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/seguimientos-psicologicos")
@RequiredArgsConstructor
public class SeguimientoPsicologicoController {

    private final SeguimientoPsicologicoService seguimientoPsicologicoService;

    @PreAuthorize("hasAnyRole('ADMINISTRADOR','PSICOLOGO')")
    @GetMapping
    public ResponseEntity<List<SeguimientoPsicologicoDTO>> listarSeguimientos(
        @RequestParam(required = false) Long fichaPsicologicaId,
        @RequestParam(required = false) Long psicologoId,
        @RequestParam(required = false) Long personalMilitarId,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaDesde,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaHasta
    ) {
        List<SeguimientoPsicologicoDTO> seguimientos = seguimientoPsicologicoService
            .listar(fichaPsicologicaId, psicologoId, personalMilitarId, fechaDesde, fechaHasta);
        return ResponseEntity.ok(seguimientos);
    }

    @PreAuthorize("hasAnyRole('ADMINISTRADOR','PSICOLOGO')")
    @GetMapping("/{id}")
    public ResponseEntity<SeguimientoPsicologicoDTO> obtenerSeguimiento(@PathVariable Long id) {
        return ResponseEntity.ok(seguimientoPsicologicoService.obtenerPorId(id));
    }

    @PreAuthorize("hasAnyRole('ADMINISTRADOR','PSICOLOGO')")
    @PostMapping
    public ResponseEntity<SeguimientoPsicologicoDTO> crearSeguimiento(
        @Valid @RequestBody SeguimientoPsicologicoRequestDTO request
    ) {
        SeguimientoPsicologicoDTO creado = seguimientoPsicologicoService.crear(request);
        return ResponseEntity.created(URI.create("/api/seguimientos-psicologicos/" + creado.getId())).body(creado);
    }

    @PreAuthorize("hasAnyRole('ADMINISTRADOR','PSICOLOGO')")
    @PutMapping("/{id}")
    public ResponseEntity<SeguimientoPsicologicoDTO> actualizarSeguimiento(
        @PathVariable Long id,
        @Valid @RequestBody SeguimientoPsicologicoRequestDTO request
    ) {
        return ResponseEntity.ok(seguimientoPsicologicoService.actualizar(id, request));
    }

    @PreAuthorize("hasAnyRole('ADMINISTRADOR','PSICOLOGO')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarSeguimiento(@PathVariable Long id) {
        seguimientoPsicologicoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
