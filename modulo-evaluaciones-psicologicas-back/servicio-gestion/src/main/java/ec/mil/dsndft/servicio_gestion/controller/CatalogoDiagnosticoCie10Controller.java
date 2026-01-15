package ec.mil.dsndft.servicio_gestion.controller;

import ec.mil.dsndft.servicio_gestion.model.dto.CatalogoDiagnosticoCie10CreateRequestDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.CatalogoDiagnosticoCie10DTO;
import ec.mil.dsndft.servicio_gestion.model.dto.CatalogoDiagnosticoCie10UpdateRequestDTO;
import ec.mil.dsndft.servicio_gestion.service.CatalogoDiagnosticoCie10Service;
import jakarta.validation.constraints.Min;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;

import java.net.URI;

@RestController
@RequestMapping("/api/catalogos/cie10")
@RequiredArgsConstructor
public class CatalogoDiagnosticoCie10Controller {

    private final CatalogoDiagnosticoCie10Service catalogoDiagnosticoService;

    @PreAuthorize("hasAnyRole('ADMINISTRADOR','PSICOLOGO')")
    @GetMapping
    public ResponseEntity<List<CatalogoDiagnosticoCie10DTO>> listarActivos(
            @RequestParam(value = "q", required = false) String terminoBusqueda) {
        return ResponseEntity.ok(catalogoDiagnosticoService.listarActivos(terminoBusqueda));
    }

    @PreAuthorize("hasAnyRole('ADMINISTRADOR','PSICOLOGO')")
    @GetMapping("/{id}")
    public ResponseEntity<CatalogoDiagnosticoCie10DTO> obtenerPorId(@PathVariable @Min(1) Long id) {
        return ResponseEntity.ok(catalogoDiagnosticoService.obtenerPorId(id));
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PostMapping
    public ResponseEntity<CatalogoDiagnosticoCie10DTO> crear(@Valid @RequestBody CatalogoDiagnosticoCie10CreateRequestDTO request) {
        CatalogoDiagnosticoCie10DTO creado = catalogoDiagnosticoService.crear(request);
        return ResponseEntity.created(URI.create("/api/catalogos/cie10/" + creado.getId())).body(creado);
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PutMapping("/{id}")
    public ResponseEntity<CatalogoDiagnosticoCie10DTO> actualizar(@PathVariable @Min(1) Long id,
                                                                   @Valid @RequestBody CatalogoDiagnosticoCie10UpdateRequestDTO request) {
        return ResponseEntity.ok(catalogoDiagnosticoService.actualizar(id, request));
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable @Min(1) Long id) {
        catalogoDiagnosticoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
