package ec.mil.dsndft.servicio_documentos.controller;

import ec.mil.dsndft.servicio_documentos.model.dto.TipoDocumentoDTO;
import ec.mil.dsndft.servicio_documentos.service.TipoDocumentoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/documentos/tipos")
@Validated
@Tag(name = "Tipos de Documento", description = "Administración del catálogo de tipos de documentos adjuntos")
public class TipoDocumentoController {

    private final TipoDocumentoService tipoDocumentoService;

    public TipoDocumentoController(TipoDocumentoService tipoDocumentoService) {
        this.tipoDocumentoService = tipoDocumentoService;
    }

    @GetMapping
    @Operation(summary = "Listar tipos de documento", description = "Retorna todos los tipos de documento disponibles")
    public ResponseEntity<List<TipoDocumentoDTO>> findAll() {
        return ResponseEntity.ok(tipoDocumentoService.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener tipo de documento", description = "Consulta un tipo de documento por su identificador")
    @ApiResponse(responseCode = "200", description = "Tipo de documento encontrado", content = @Content(schema = @Schema(implementation = TipoDocumentoDTO.class)))
    @ApiResponse(responseCode = "404", description = "Tipo de documento no encontrado")
    public ResponseEntity<TipoDocumentoDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(tipoDocumentoService.findById(id));
    }

    @PostMapping
    @Operation(summary = "Crear tipo de documento", description = "Registra un nuevo tipo de documento en el catálogo")
    @ApiResponse(responseCode = "201", description = "Tipo de documento creado", content = @Content(schema = @Schema(implementation = TipoDocumentoDTO.class)))
    public ResponseEntity<TipoDocumentoDTO> create(@Valid @RequestBody TipoDocumentoDTO dto) {
        TipoDocumentoDTO created = tipoDocumentoService.create(dto);
        return ResponseEntity.created(URI.create("/api/documentos/tipos/" + created.getId())).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar tipo de documento", description = "Actualiza la información de un tipo de documento existente")
    public ResponseEntity<TipoDocumentoDTO> update(@PathVariable Long id, @Valid @RequestBody TipoDocumentoDTO dto) {
        return ResponseEntity.ok(tipoDocumentoService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar tipo de documento", description = "Elimina de forma permanente un tipo de documento")
    @ApiResponse(responseCode = "204", description = "Tipo de documento eliminado")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        tipoDocumentoService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
