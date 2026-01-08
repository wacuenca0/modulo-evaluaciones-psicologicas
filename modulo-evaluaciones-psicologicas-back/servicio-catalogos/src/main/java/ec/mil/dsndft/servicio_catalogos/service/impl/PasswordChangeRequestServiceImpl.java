package ec.mil.dsndft.servicio_catalogos.service.impl;

import ec.mil.dsndft.servicio_catalogos.entity.PasswordChangeRequest;
import ec.mil.dsndft.servicio_catalogos.entity.PasswordChangeStatus;
import ec.mil.dsndft.servicio_catalogos.entity.Usuario;
import ec.mil.dsndft.servicio_catalogos.model.dto.AdminProcessPasswordChangeDTO;
import ec.mil.dsndft.servicio_catalogos.model.dto.CreatePasswordChangeRequestDTO;
import ec.mil.dsndft.servicio_catalogos.model.dto.PasswordChangeRequestDTO;
import ec.mil.dsndft.servicio_catalogos.repository.PasswordChangeRequestRepository;
import ec.mil.dsndft.servicio_catalogos.repository.UsuarioRepository;
import ec.mil.dsndft.servicio_catalogos.service.PasswordChangeRequestService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@Transactional
public class PasswordChangeRequestServiceImpl implements PasswordChangeRequestService {

    private final PasswordChangeRequestRepository requestRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public PasswordChangeRequestServiceImpl(PasswordChangeRequestRepository requestRepository,
                                            UsuarioRepository usuarioRepository,
                                            PasswordEncoder passwordEncoder) {
        this.requestRepository = requestRepository;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public PasswordChangeRequestDTO submitRequest(CreatePasswordChangeRequestDTO requestDTO) {
        if (requestDTO == null || !StringUtils.hasText(requestDTO.getUsername())) {
            throw new IllegalArgumentException("Debe especificar el nombre de usuario");
        }

        String username = requestDTO.getUsername().trim().toLowerCase(Locale.ROOT);
        Usuario usuario = usuarioRepository.findByUsername(username)
            .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        requestRepository.findFirstByUsuarioUsernameAndStatus(usuario.getUsername(), PasswordChangeStatus.PENDIENTE)
            .ifPresent(existing -> {
                throw new IllegalStateException("Ya existe una solicitud pendiente para este usuario");
            });

        PasswordChangeRequest request = new PasswordChangeRequest();
        request.setUsuario(usuario);
        request.setUsernameSnapshot(usuario.getUsername());
        request.setContactEmail(StringUtils.hasText(requestDTO.getContactEmail()) ? requestDTO.getContactEmail().trim() : usuario.getEmail());
        request.setMotivo(StringUtils.hasText(requestDTO.getMotivo()) ? requestDTO.getMotivo().trim() : "Solicitud de restablecimiento de contraseña");
        request.setStatus(PasswordChangeStatus.PENDIENTE);

        PasswordChangeRequest saved = requestRepository.save(request);
        return toDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PasswordChangeRequestDTO> getRequests(PasswordChangeStatus status) {
        if (status == null) {
            return requestRepository.findAll().stream()
                .sorted((a, b) -> a.getRequestedAt().compareTo(b.getRequestedAt()))
                .map(this::toDTO)
                .collect(Collectors.toList());
        }
        return requestRepository.findByStatusOrderByRequestedAtAsc(status).stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    @Override
    public PasswordChangeRequestDTO completeRequest(Long requestId, AdminProcessPasswordChangeDTO dto, String adminUsername) {
        if (requestId == null) {
            throw new IllegalArgumentException("Debe proporcionar el identificador de la solicitud");
        }
        PasswordChangeRequest request = requestRepository.findById(requestId)
            .orElseThrow(() -> new IllegalArgumentException("Solicitud no encontrada"));
        if (request.getStatus() != PasswordChangeStatus.PENDIENTE) {
            throw new IllegalStateException("La solicitud ya fue atendida");
        }
        if (dto == null || !StringUtils.hasText(dto.getNewPassword())) {
            throw new IllegalArgumentException("Debe indicar la nueva contraseña");
        }

        Usuario usuario = request.getUsuario();
        usuario.setPasswordHash(passwordEncoder.encode(dto.getNewPassword()));
        if (Boolean.TRUE.equals(dto.getUnlockAccount())) {
            usuario.setBloqueado(false);
            usuario.setActivo(true);
            usuario.setIntentosLogin(0);
        }
        usuarioRepository.save(usuario);

        request.setStatus(PasswordChangeStatus.COMPLETADO);
        request.setProcessedAt(LocalDateTime.now());
        request.setProcessedBy(adminUsername);
        request.setAdminNotes(dto.getAdminNotes());
        request.setUnlockAccount(dto.getUnlockAccount());

        PasswordChangeRequest saved = requestRepository.save(request);
        return toDTO(saved);
    }

    @Override
    public PasswordChangeRequestDTO rejectRequest(Long requestId, String adminUsername, String adminNotes) {
        if (requestId == null) {
            throw new IllegalArgumentException("Debe proporcionar el identificador de la solicitud");
        }
        PasswordChangeRequest request = requestRepository.findById(requestId)
            .orElseThrow(() -> new IllegalArgumentException("Solicitud no encontrada"));
        if (request.getStatus() != PasswordChangeStatus.PENDIENTE) {
            throw new IllegalStateException("La solicitud ya fue atendida");
        }

        request.setStatus(PasswordChangeStatus.RECHAZADO);
        request.setProcessedAt(LocalDateTime.now());
        request.setProcessedBy(adminUsername);
        request.setAdminNotes(adminNotes);

        PasswordChangeRequest saved = requestRepository.save(request);
        return toDTO(saved);
    }

    private PasswordChangeRequestDTO toDTO(PasswordChangeRequest request) {
        PasswordChangeRequestDTO dto = new PasswordChangeRequestDTO();
        dto.setId(request.getId());
        dto.setUsername(request.getUsernameSnapshot());
        dto.setContactEmail(request.getContactEmail());
        dto.setMotivo(request.getMotivo());
        dto.setStatus(request.getStatus());
        dto.setRequestedAt(request.getRequestedAt());
        dto.setProcessedAt(request.getProcessedAt());
        dto.setProcessedBy(request.getProcessedBy());
        dto.setAdminNotes(request.getAdminNotes());
        dto.setUnlockAccount(request.getUnlockAccount());
        return dto;
    }
}
