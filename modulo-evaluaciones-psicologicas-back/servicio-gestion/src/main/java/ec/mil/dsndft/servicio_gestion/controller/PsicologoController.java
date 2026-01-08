package ec.mil.dsndft.servicio_gestion.controller;

import ec.mil.dsndft.servicio_gestion.model.dto.PsicologoDTO;
import ec.mil.dsndft.servicio_gestion.service.PsicologoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/psicologos")
@RequiredArgsConstructor
public class PsicologoController {

	private final PsicologoService psicologoService;

	@PreAuthorize("hasAnyRole('ADMINISTRADOR','PSICOLOGO')")
	@GetMapping
	public ResponseEntity<List<PsicologoDTO>> listarPsicologos() {
		return ResponseEntity.ok(psicologoService.findAll());
	}

	@PreAuthorize("hasAnyRole('ADMINISTRADOR','PSICOLOGO')")
	@GetMapping("/{id}")
	public ResponseEntity<PsicologoDTO> obtenerPsicologo(@PathVariable Long id) {
		return ResponseEntity.ok(psicologoService.findById(id));
	}

	@PreAuthorize("hasRole('ADMINISTRADOR')")
	@PostMapping
	public ResponseEntity<PsicologoDTO> crearPsicologo(@RequestBody PsicologoDTO dto) {
		PsicologoDTO creado = psicologoService.save(dto);
		return ResponseEntity.created(URI.create("/api/psicologos/" + creado.getId())).body(creado);
	}

	@PreAuthorize("hasRole('ADMINISTRADOR')")
	@PutMapping("/{id}")
	public ResponseEntity<PsicologoDTO> actualizarPsicologo(@PathVariable Long id, @RequestBody PsicologoDTO dto) {
		dto.setId(id);
		return ResponseEntity.ok(psicologoService.save(dto));
	}

	@PreAuthorize("hasRole('ADMINISTRADOR')")
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> eliminarPsicologo(@PathVariable Long id) {
		psicologoService.deleteById(id);
		return ResponseEntity.noContent().build();
	}
}