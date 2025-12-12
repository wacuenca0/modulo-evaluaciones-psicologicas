package ec.mil.dsndft.servicio_catalogos.controller;

import ec.mil.dsndft.servicio_catalogos.model.dto.CatalogoCIE10DTO;
import ec.mil.dsndft.servicio_catalogos.service.CatalogoCIE10Service;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/catalogo-cie10")
public class CatalogoCIE10Controller {

    private final CatalogoCIE10Service service;

    public CatalogoCIE10Controller(CatalogoCIE10Service service) {
        this.service = service;
    }

    @PreAuthorize("hasAnyRole('ADMINISTRADOR','PSICOLOGO')")
    @GetMapping
    public ResponseEntity<List<CatalogoCIE10DTO>> listar(@RequestParam(value = "soloActivos", required = false) Boolean soloActivos) {
        return ResponseEntity.ok(service.listar(soloActivos));
    }

    @PreAuthorize("hasAnyRole('ADMINISTRADOR','PSICOLOGO')")
    @GetMapping("/{id}")
    public ResponseEntity<CatalogoCIE10DTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.obtenerPorId(id));
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PostMapping
    public ResponseEntity<CatalogoCIE10DTO> crear(@Valid @RequestBody CatalogoCIE10DTO dto) {
        CatalogoCIE10DTO creado = service.crear(dto);
        return ResponseEntity.created(URI.create("/api/catalogo-cie10/" + creado.getId())).body(creado);
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PutMapping("/{id}")
    public ResponseEntity<CatalogoCIE10DTO> actualizar(@PathVariable Long id, @Valid @RequestBody CatalogoCIE10DTO dto) {
        return ResponseEntity.ok(service.actualizar(id, dto));
    }
}
