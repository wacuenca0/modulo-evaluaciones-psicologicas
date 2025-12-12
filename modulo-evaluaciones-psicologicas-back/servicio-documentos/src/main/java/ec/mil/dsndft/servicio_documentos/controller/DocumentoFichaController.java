package ec.mil.dsndft.servicio_documentos.controller;

import ec.mil.dsndft.servicio_documentos.model.dto.DocumentoFichaDTO;
import ec.mil.dsndft.servicio_documentos.service.DocumentoFichaService;
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
@RequestMapping("/api/documentos")
@Validated
@Tag(name = "Documentos de Ficha", description = "Gestión de documentos adjuntos a fichas psicológicas")
public class DocumentoFichaController {

    private final DocumentoFichaService documentoFichaService;

    public DocumentoFichaController(DocumentoFichaService documentoFichaService) {
        this.documentoFichaService = documentoFichaService;
    }

    @GetMapping("/fichas/{fichaId}/documentos")
    @Operation(summary = "Listar documentos activos de una ficha", description = "Obtiene los documentos activos asociados a una ficha psicológica específica")
    public ResponseEntity<List<DocumentoFichaDTO>> findActivosByFicha(@PathVariable Long fichaId) {
        return ResponseEntity.ok(documentoFichaService.findActivosByFicha(fichaId));
    }

    @GetMapping("/documentos/{id}")
    @Operation(summary = "Obtener documento de ficha", description = "Consulta un documento adjunto por su identificador")
    @ApiResponse(responseCode = "200", description = "Documento encontrado", content = @Content(schema = @Schema(implementation = DocumentoFichaDTO.class)))
    @ApiResponse(responseCode = "404", description = "Documento no encontrado")
    public ResponseEntity<DocumentoFichaDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(documentoFichaService.findById(id));
    }

    @PostMapping("/documentos")
    @Operation(summary = "Crear documento de ficha", description = "Registra un nuevo documento y lo asocia a una ficha psicológica")
    @ApiResponse(responseCode = "201", description = "Documento creado", content = @Content(schema = @Schema(implementation = DocumentoFichaDTO.class)))
    public ResponseEntity<DocumentoFichaDTO> create(@Valid @RequestBody DocumentoFichaDTO dto) {
        DocumentoFichaDTO created = documentoFichaService.create(dto);
        return ResponseEntity.created(URI.create("/api/documentos/documentos/" + created.getId())).body(created);
    }

    @PutMapping("/documentos/{id}")
    @Operation(summary = "Actualizar documento de ficha", description = "Actualiza los metadatos de un documento almacenado")
    public ResponseEntity<DocumentoFichaDTO> update(@PathVariable Long id, @Valid @RequestBody DocumentoFichaDTO dto) {
        return ResponseEntity.ok(documentoFichaService.update(id, dto));
    }

    @DeleteMapping("/documentos/{id}")
    @Operation(summary = "Inactivar documento de ficha", description = "Realiza una baja lógica del documento manteniendo su trazabilidad")
    @ApiResponse(responseCode = "204", description = "Documento inactivado")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        documentoFichaService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
