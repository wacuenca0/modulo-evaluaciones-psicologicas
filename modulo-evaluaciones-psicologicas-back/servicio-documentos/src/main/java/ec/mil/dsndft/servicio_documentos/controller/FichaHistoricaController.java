package ec.mil.dsndft.servicio_documentos.controller;

import ec.mil.dsndft.servicio_documentos.model.dto.FichaHistoricaDTO;
import ec.mil.dsndft.servicio_documentos.service.FichaHistoricaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
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
@RequestMapping("/api/documentos/fichas-historicas")
@Validated
@Tag(name = "Fichas Históricas", description = "Gestión de fichas históricas digitalizadas")
public class FichaHistoricaController {

    private final FichaHistoricaService fichaHistoricaService;

    public FichaHistoricaController(FichaHistoricaService fichaHistoricaService) {
        this.fichaHistoricaService = fichaHistoricaService;
    }

    @GetMapping
    @Operation(summary = "Listar fichas históricas por cédula", description = "Recupera el historial clínico histórico de un militar a partir de su cédula")
    @ApiResponse(responseCode = "200", description = "Listado recuperado", content = @Content(schema = @Schema(implementation = FichaHistoricaDTO.class)))
    public ResponseEntity<List<FichaHistoricaDTO>> findByCedula(@Parameter(description = "Cédula del personal militar", required = true)
                                                                @RequestParam("cedula") String cedulaPersonal) {
        return ResponseEntity.ok(fichaHistoricaService.findByCedulaPersonal(cedulaPersonal));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener ficha histórica", description = "Consulta una ficha histórica específica por su identificador")
    @ApiResponse(responseCode = "200", description = "Ficha encontrada", content = @Content(schema = @Schema(implementation = FichaHistoricaDTO.class)))
    @ApiResponse(responseCode = "404", description = "Ficha histórica no encontrada")
    public ResponseEntity<FichaHistoricaDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(fichaHistoricaService.findById(id));
    }

    @PostMapping
    @Operation(summary = "Registrar ficha histórica", description = "Carga una nueva ficha histórica digitalizada")
    @ApiResponse(responseCode = "201", description = "Ficha registrada", content = @Content(schema = @Schema(implementation = FichaHistoricaDTO.class)))
    public ResponseEntity<FichaHistoricaDTO> create(@Valid @RequestBody FichaHistoricaDTO dto) {
        FichaHistoricaDTO created = fichaHistoricaService.create(dto);
        return ResponseEntity.created(URI.create("/api/documentos/fichas-historicas/" + created.getId())).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar ficha histórica", description = "Modifica la información almacenada de una ficha histórica")
    public ResponseEntity<FichaHistoricaDTO> update(@PathVariable Long id, @Valid @RequestBody FichaHistoricaDTO dto) {
        return ResponseEntity.ok(fichaHistoricaService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar ficha histórica", description = "Elimina de forma permanente una ficha histórica digitalizada")
    @ApiResponse(responseCode = "204", description = "Ficha eliminada")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        fichaHistoricaService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
