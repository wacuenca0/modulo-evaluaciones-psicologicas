package ec.mil.dsndft.servicio_catalogos.controller;

import ec.mil.dsndft.servicio_catalogos.entity.PasswordChangeStatus;
import ec.mil.dsndft.servicio_catalogos.model.dto.AdminProcessPasswordChangeDTO;
import ec.mil.dsndft.servicio_catalogos.model.dto.AdminRejectPasswordChangeDTO;
import ec.mil.dsndft.servicio_catalogos.model.dto.CreatePasswordChangeRequestDTO;
import ec.mil.dsndft.servicio_catalogos.model.dto.PasswordChangeRequestDTO;
import ec.mil.dsndft.servicio_catalogos.service.PasswordChangeRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/password-requests")
public class PasswordChangeRequestController {

    private final PasswordChangeRequestService requestService;

    public PasswordChangeRequestController(PasswordChangeRequestService requestService) {
        this.requestService = requestService;
    }

    @PostMapping
    public ResponseEntity<PasswordChangeRequestDTO> submitRequest(@RequestBody CreatePasswordChangeRequestDTO requestDTO) {
        PasswordChangeRequestDTO created = requestService.submitRequest(requestDTO);
        return ResponseEntity.created(URI.create("/api/password-requests/" + created.getId())).body(created);
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @GetMapping
    public ResponseEntity<List<PasswordChangeRequestDTO>> listRequests(@RequestParam(value = "status", required = false) PasswordChangeStatus status) {
        List<PasswordChangeRequestDTO> requests = requestService.getRequests(status);
        return ResponseEntity.ok(requests);
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PostMapping("/{id}/complete")
    public ResponseEntity<PasswordChangeRequestDTO> completeRequest(@PathVariable Long id,
                                                                    @RequestBody AdminProcessPasswordChangeDTO dto) {
        String adminUsername = currentUsername();
        PasswordChangeRequestDTO processed = requestService.completeRequest(id, dto, adminUsername);
        return ResponseEntity.ok(processed);
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PostMapping("/{id}/reject")
    public ResponseEntity<PasswordChangeRequestDTO> rejectRequest(@PathVariable Long id,
                                                                  @RequestBody(required = false) AdminRejectPasswordChangeDTO dto) {
        String adminUsername = currentUsername();
        String notes = dto != null ? dto.getAdminNotes() : null;
        PasswordChangeRequestDTO processed = requestService.rejectRequest(id, adminUsername, notes);
        return ResponseEntity.ok(processed);
    }

    private String currentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : "admin";
    }
}
