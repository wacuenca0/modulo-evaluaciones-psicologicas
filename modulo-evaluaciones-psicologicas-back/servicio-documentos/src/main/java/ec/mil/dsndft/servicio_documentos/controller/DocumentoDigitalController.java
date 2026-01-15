package ec.mil.dsndft.servicio_documentos.controller;

import ec.mil.dsndft.servicio_documentos.dto.DocumentoDigitalDetalleDto;
import ec.mil.dsndft.servicio_documentos.dto.DocumentoDigitalRespuestaDto;
import ec.mil.dsndft.servicio_documentos.dto.DocumentoDigitalResumenDto;
import ec.mil.dsndft.servicio_documentos.dto.DocumentoDigitalSolicitudDto;
import ec.mil.dsndft.servicio_documentos.service.DocumentoDigitalService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/documentos/digitales")
@RequiredArgsConstructor
public class DocumentoDigitalController {

    private final DocumentoDigitalService documentoDigitalService;

    @PostMapping
    public ResponseEntity<DocumentoDigitalRespuestaDto> crear(@Valid @RequestBody DocumentoDigitalSolicitudDto solicitud) {
        DocumentoDigitalRespuestaDto respuesta = documentoDigitalService.crear(solicitud);
        return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);
    }

    @PutMapping("/{documentoId}")
    public ResponseEntity<DocumentoDigitalRespuestaDto> actualizar(
            @PathVariable Long documentoId, @Valid @RequestBody DocumentoDigitalSolicitudDto solicitud) {
        DocumentoDigitalRespuestaDto respuesta = documentoDigitalService.actualizar(documentoId, solicitud);
        return ResponseEntity.ok(respuesta);
    }

    @DeleteMapping("/{documentoId}")
    public ResponseEntity<Void> eliminar(@PathVariable Long documentoId) {
        documentoDigitalService.eliminarLogicamente(documentoId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{documentoId}")
    public ResponseEntity<DocumentoDigitalDetalleDto> obtenerDetalle(@PathVariable Long documentoId) {
        DocumentoDigitalDetalleDto detalle = documentoDigitalService.obtenerPorId(documentoId);
        return ResponseEntity.ok(detalle);
    }

    @GetMapping
    public Page<DocumentoDigitalResumenDto> listarPorTipo(
            @RequestParam String nombreTipoDocumento, @PageableDefault Pageable pageable) {
        return documentoDigitalService.listarPorTipo(nombreTipoDocumento, pageable);
    }

    @GetMapping("/activos")
    public List<DocumentoDigitalResumenDto> listarActivos() {
        return documentoDigitalService.listarActivos();
    }

    @GetMapping("/fichas/{fichaId}")
    public ResponseEntity<List<DocumentoDigitalResumenDto>> listarPorFicha(@PathVariable Long fichaId) {
        return ResponseEntity.ok(documentoDigitalService.listarPorFicha(fichaId));
    }
}
