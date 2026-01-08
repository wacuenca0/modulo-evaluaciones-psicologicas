package ec.mil.dsndft.servicio_gestion.controller;

import ec.mil.dsndft.servicio_gestion.model.dto.FichaCondicionRequestDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.FichaDatosGeneralesRequestDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.FichaPsicologicaDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.FichaSeccionObservacionRequestDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.FichaSeccionPsicoanamnesisRequestDTO;
import ec.mil.dsndft.servicio_gestion.service.FichaPsicologicaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/fichas-psicologicas")
@RequiredArgsConstructor
public class FichaPsicologicaController {

    private final FichaPsicologicaService fichaPsicologicaService;

    @PreAuthorize("hasAnyRole('ADMINISTRADOR','PSICOLOGO')")
    @GetMapping
    public ResponseEntity<List<FichaPsicologicaDTO>> listarFichas(
        @RequestParam(required = false) Long psicologoId,
        @RequestParam(required = false) Long personalMilitarId,
        @RequestParam(required = false) String estado,
        @RequestParam(required = false) String condicion,
        @RequestParam(required = false) Boolean soloActivas
    ) {
        List<FichaPsicologicaDTO> fichas = fichaPsicologicaService.listar(psicologoId, personalMilitarId, estado, condicion, soloActivas);
        return ResponseEntity.ok(fichas);
    }

    @PreAuthorize("hasAnyRole('ADMINISTRADOR','PSICOLOGO')")
    @GetMapping("/condicion")
    public ResponseEntity<List<FichaPsicologicaDTO>> listarPorCondicion(
        @RequestParam String condicion,
        @RequestParam(required = false) Long psicologoId,
        @RequestParam(required = false) Long personalMilitarId
    ) {
        return ResponseEntity.ok(fichaPsicologicaService.listarPorCondicion(condicion, psicologoId, personalMilitarId));
    }

    @PreAuthorize("hasAnyRole('ADMINISTRADOR','PSICOLOGO')")
    @GetMapping("/historial/{personalMilitarId}")
    public ResponseEntity<List<FichaPsicologicaDTO>> obtenerHistorial(@PathVariable Long personalMilitarId) {
        return ResponseEntity.ok(fichaPsicologicaService.obtenerHistorialPorPersonal(personalMilitarId));
    }

    @PreAuthorize("hasAnyRole('ADMINISTRADOR','PSICOLOGO')")
    @GetMapping("/{id}")
    public ResponseEntity<FichaPsicologicaDTO> obtenerFicha(@PathVariable Long id) {
        return ResponseEntity.ok(fichaPsicologicaService.obtenerPorId(id));
    }

    @PreAuthorize("hasAnyRole('ADMINISTRADOR','PSICOLOGO')")
    @GetMapping("/numero/{numeroEvaluacion}")
    public ResponseEntity<FichaPsicologicaDTO> obtenerPorNumero(@PathVariable String numeroEvaluacion) {
        return ResponseEntity.ok(fichaPsicologicaService.obtenerPorNumeroEvaluacion(numeroEvaluacion));
    }

    @PreAuthorize("hasRole('PSICOLOGO')")
    @PostMapping
    public ResponseEntity<FichaPsicologicaDTO> crearFicha(@Valid @RequestBody FichaDatosGeneralesRequestDTO request) {
        FichaPsicologicaDTO creada = fichaPsicologicaService.crearFicha(request);
        return ResponseEntity.created(URI.create("/api/fichas-psicologicas/" + creada.getId())).body(creada);
    }

    @PreAuthorize("hasRole('PSICOLOGO')")
    @PutMapping("/{id}/general")
    public ResponseEntity<FichaPsicologicaDTO> actualizarDatosGenerales(@PathVariable Long id,
                                                                        @Valid @RequestBody FichaDatosGeneralesRequestDTO request) {
        return ResponseEntity.ok(fichaPsicologicaService.actualizarDatosGenerales(id, request));
    }

    @PreAuthorize("hasRole('PSICOLOGO')")
    @PutMapping("/{id}/observacion")
    public ResponseEntity<FichaPsicologicaDTO> guardarSeccionObservacion(@PathVariable Long id,
                                                                         @Valid @RequestBody FichaSeccionObservacionRequestDTO request) {
        return ResponseEntity.ok(fichaPsicologicaService.guardarSeccionObservacion(id, request));
    }

    @PreAuthorize("hasRole('PSICOLOGO')")
    @DeleteMapping("/{id}/observacion")
    public ResponseEntity<FichaPsicologicaDTO> eliminarSeccionObservacion(@PathVariable Long id) {
        return ResponseEntity.ok(fichaPsicologicaService.eliminarSeccionObservacion(id));
    }

    @PreAuthorize("hasRole('PSICOLOGO')")
    @PutMapping("/{id}/psicoanamnesis")
    public ResponseEntity<FichaPsicologicaDTO> guardarSeccionPsicoanamnesis(@PathVariable Long id,
                                                                            @Valid @RequestBody FichaSeccionPsicoanamnesisRequestDTO request) {
        return ResponseEntity.ok(fichaPsicologicaService.guardarSeccionPsicoanamnesis(id, request));
    }

    @PreAuthorize("hasRole('PSICOLOGO')")
    @DeleteMapping("/{id}/psicoanamnesis")
    public ResponseEntity<FichaPsicologicaDTO> eliminarSeccionPsicoanamnesis(@PathVariable Long id) {
        return ResponseEntity.ok(fichaPsicologicaService.eliminarSeccionPsicoanamnesis(id));
    }

    @PreAuthorize("hasRole('PSICOLOGO')")
    @PutMapping("/{id}/condicion")
    public ResponseEntity<FichaPsicologicaDTO> actualizarCondicion(@PathVariable Long id,
                                                                    @Valid @RequestBody FichaCondicionRequestDTO request) {
        return ResponseEntity.ok(fichaPsicologicaService.actualizarCondicion(id, request));
    }

    @PreAuthorize("hasRole('PSICOLOGO')")
    @DeleteMapping("/{id}/condicion")
    public ResponseEntity<FichaPsicologicaDTO> limpiarCondicion(@PathVariable Long id) {
        return ResponseEntity.ok(fichaPsicologicaService.limpiarCondicionClinica(id));
    }

    @PreAuthorize("hasRole('PSICOLOGO')")
    @PatchMapping("/{id}/estado")
    public ResponseEntity<FichaPsicologicaDTO> actualizarEstado(@PathVariable Long id,
                                                                 @RequestBody Map<String, String> body) {
        String estado = body != null ? body.get("estado") : null;
        return ResponseEntity.ok(fichaPsicologicaService.actualizarEstado(id, estado));
    }

    @PreAuthorize("hasRole('PSICOLOGO')")
    @PostMapping("/{id}/finalizar")
    public ResponseEntity<FichaPsicologicaDTO> finalizarFicha(@PathVariable Long id) {
        return ResponseEntity.ok(fichaPsicologicaService.finalizarFicha(id));
    }
}
