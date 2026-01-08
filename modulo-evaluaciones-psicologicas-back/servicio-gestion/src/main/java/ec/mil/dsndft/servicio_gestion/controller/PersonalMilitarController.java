package ec.mil.dsndft.servicio_gestion.controller;

import ec.mil.dsndft.servicio_gestion.model.dto.PersonalMilitarDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.PersonalMilitarUpsertRequestDTO;
import ec.mil.dsndft.servicio_gestion.service.PersonalMilitarService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
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

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/personal-militar")
@RequiredArgsConstructor
public class PersonalMilitarController {

	private final PersonalMilitarService personalMilitarService;

	@PreAuthorize("hasAnyRole('ADMINISTRADOR','PSICOLOGO')")
	@GetMapping
	public ResponseEntity<List<PersonalMilitarDTO>> listarPersonal() {
		return ResponseEntity.ok(personalMilitarService.findAll());
	}

	@PreAuthorize("hasAnyRole('ADMINISTRADOR','PSICOLOGO')")
	@GetMapping("/{id}")
	public ResponseEntity<PersonalMilitarDTO> obtenerPersonal(@PathVariable Long id) {
		return ResponseEntity.ok(personalMilitarService.findById(id));
	}


	@PreAuthorize("hasAnyRole('ADMINISTRADOR','PSICOLOGO')")
	@GetMapping("/buscar")
	public ResponseEntity<?> buscarPersonal(
		@RequestParam(value = "cedula", required = false) String cedula,
		@RequestParam(value = "apellidos", required = false) String apellidos,
		@RequestParam(value = "nombres", required = false) String nombres,
		@RequestParam(value = "termino", required = false) String termino,
		@RequestParam(value = "page", required = false, defaultValue = "0") Integer page,
		@RequestParam(value = "size", required = false, defaultValue = "10") Integer size
	) {
		if (cedula != null && !cedula.isBlank()) {
			return personalMilitarService.findByCedula(cedula)
				.map(ResponseEntity::ok)
				.orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
		}

		String criterioLibre = primeroNoVacio(apellidos, nombres, termino);
		if (criterioLibre != null) {
			int pageNumber = page != null && page >= 0 ? page : 0;
			int pageSize = size != null && size > 0 ? size : 10;
			Pageable pageable = PageRequest.of(pageNumber, pageSize);
			Page<PersonalMilitarDTO> resultado = personalMilitarService.searchByNombreCompleto(criterioLibre, pageable);
			return ResponseEntity.ok(resultado);
		}

		return ResponseEntity.badRequest().body(Map.of(
			"mensaje", "Debe proporcionar cédula, nombres o apellidos para realizar la búsqueda"
		));
	}

	private String primeroNoVacio(String... valores) {
		for (String valor : valores) {
			if (valor != null && !valor.isBlank()) {
				return valor;
			}
		}
		return null;
	}

	@PreAuthorize("hasRole('PSICOLOGO')")
	@PostMapping
	public ResponseEntity<PersonalMilitarDTO> registrarPersonal(
		@Valid @RequestBody PersonalMilitarUpsertRequestDTO request
	) {
		PersonalMilitarDTO creado = personalMilitarService.create(request);
		return ResponseEntity.status(HttpStatus.CREATED).body(creado);
	}

	@PreAuthorize("hasRole('PSICOLOGO')")
	@PutMapping("/{id}")
	public ResponseEntity<PersonalMilitarDTO> actualizarPersonal(
		@PathVariable Long id,
		@Valid @RequestBody PersonalMilitarUpsertRequestDTO request
	) {
		return ResponseEntity.ok(personalMilitarService.update(id, request));
	}
}